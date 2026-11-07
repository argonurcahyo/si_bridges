"""Membangun tile terrain-RGB dari DEMNAS untuk mode 3D MapLibre.

Jalankan dari apps/dashboard:
    python scripts/build-terrain.py

Input : ../../data/demnas/DEMNAS_*.tif
Output: public/terrain/{z}/{x}/{y}.png  (encoding mapbox terrain-RGB)

Format tinggi (MapLibre/Mapbox):
    tinggi = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
"""

import math
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.merge import merge

BOUNDS = (106.35, -6.80, 107.30, -5.92)  # west, south, east, north
RES = 0.0003  # derajat, sekitar 33 m
ZOOM_OVERVIEW = (10, 11)
ZOOM_DETAIL = (12, 13)
BOUNDS_DETAIL = (106.68, -6.70, 107.05, -6.05)
R = 6378137.0
WORLD = 2 * math.pi * R

root = Path(__file__).resolve().parents[1]
demnas = root / ".." / ".." / "data" / "demnas"
keluaran = root / "public" / "terrain"

berkas = sorted(demnas.glob("DEMNAS_*.tif"))
dipakai = []
for p in berkas:
    with rasterio.open(p) as r:
        b = r.bounds
        if b.right < BOUNDS[0] or b.left > BOUNDS[2] or b.top < BOUNDS[1] or b.bottom > BOUNDS[3]:
            continue
        dipakai.append(p)

if not dipakai:
    raise SystemExit("Tidak ada tile DEMNAS pada area target")
print(f"{len(dipakai)} tile DEMNAS dipakai")

sumber = [rasterio.open(p) for p in dipakai]
dem, transform = merge(sumber, bounds=BOUNDS, res=(RES, RES), resampling=Resampling.bilinear)
grid = dem[0]
barat, utara = transform.c, transform.f
print(f"mosaik {grid.shape[1]}x{grid.shape[0]} piksel")


def sampel(lon: np.ndarray, lat: np.ndarray) -> np.ndarray:
    kolom = np.clip((lon - barat) / RES - 0.5, 0, grid.shape[1] - 1)
    baris = np.clip((utara - lat) / RES - 0.5, 0, grid.shape[0] - 1)
    c0 = np.floor(kolom).astype(int)
    r0 = np.floor(baris).astype(int)
    c1 = np.clip(c0 + 1, 0, grid.shape[1] - 1)
    r1 = np.clip(r0 + 1, 0, grid.shape[0] - 1)
    fc = kolom - c0
    fr = baris - r0
    atas = grid[r0, c0] * (1 - fc) + grid[r0, c1] * fc
    bawah = grid[r1, c0] * (1 - fc) + grid[r1, c1] * fc
    nilai = atas * (1 - fr) + bawah * fr
    return np.nan_to_num(nilai, nan=0.0)


def tile_bounds(z: int, x: int, y: int):
    n = 2**z
    ukuran = WORLD / n
    mx0 = -WORLD / 2 + x * ukuran
    my0 = WORLD / 2 - y * ukuran
    mx1 = mx0 + ukuran
    my1 = my0 - ukuran

    def lon(mx):
        return mx / R * 180 / math.pi

    def lat(my):
        return (2 * math.atan(math.exp(my / R)) - math.pi / 2) * 180 / math.pi

    return lon(mx0), lat(my1), lon(mx1), lat(my0)


def rentang_tile(z: int, bounds) -> tuple[range, range]:
    n = 2**z

    def xt(lon):
        return int((lon + 180) / 360 * n)

    def yt(lat):
        rad = math.radians(lat)
        return int((1 - math.log(math.tan(rad) + 1 / math.cos(rad)) / math.pi) / 2 * n)

    return range(xt(bounds[0]), xt(bounds[2]) + 1), range(yt(bounds[3]), yt(bounds[1]) + 1)


def encode(tinggi: np.ndarray) -> np.ndarray:
    nilai = np.clip((tinggi + 10000) * 10, 0, 16777215).astype(np.uint32)
    rgb = np.zeros((*tinggi.shape, 3), dtype=np.uint8)
    rgb[..., 0] = (nilai >> 16) & 255
    rgb[..., 1] = (nilai >> 8) & 255
    rgb[..., 2] = nilai & 255
    return rgb


def buat_tile(z: int, bounds, detail: bool) -> int:
    xs, ys = rentang_tile(z, bounds)
    jumlah = 0
    for x in xs:
        for y in ys:
            kiri, bawah, kanan, atas = tile_bounds(z, x, y)
            if kanan < BOUNDS[0] or kiri > BOUNDS[2] or atas < BOUNDS[1] or bawah > BOUNDS[3]:
                continue
            px = (np.arange(256) + 0.5) / 256
            lon = kiri + (kanan - kiri) * px
            lat = atas + (bawah - atas) * px
            grid_lon, grid_lat = np.meshgrid(lon, lat)
            tinggi = sampel(grid_lon, grid_lat)
            folder = keluaran / str(z) / str(x)
            folder.mkdir(parents=True, exist_ok=True)
            Image.fromarray(encode(tinggi)).save(folder / f"{y}.png", optimize=True)
            jumlah += 1
    print(f"z{z} {'detail' if detail else 'overview'}: {jumlah} tile")
    return jumlah


def main() -> None:
    total = 0
    for z in ZOOM_OVERVIEW:
        total += buat_tile(z, BOUNDS, detail=False)
    for z in ZOOM_DETAIL:
        total += buat_tile(z, BOUNDS_DETAIL, detail=True)

    ukuran = sum(p.stat().st_size for p in keluaran.rglob("*.png"))
    print(f"total {total} tile, {ukuran / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()


