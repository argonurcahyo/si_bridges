"""Konversi batas kecamatan (SHP) ke GeoJSON ringan untuk koridor demo.

Jalankan dari apps/dashboard:
    python scripts/build-geo.py

Input  : ../../data/shp/kecamatan_jabodetabek.shp (tidak masuk repo, lihat .gitignore)
Output : public/geo/kecamatan-koridor.geojson (masuk repo, sudah disederhanakan)
"""

from pathlib import Path

import geopandas as gpd

KOTA_KORIDOR = [
    "Kota Depok",
    "Kota Jakarta Pusat",
    "Kota Jakarta Selatan",
    "Kota Jakarta Timur",
]
TOLERANSI_DERAJAT = 0.0003
KOLOM = ["ADM3_EN", "ADM3_PCODE", "ADM2_EN", "ADM1_EN"]

root = Path(__file__).resolve().parents[1]
sumber = root / ".." / ".." / "data" / "shp" / "kecamatan_jabodetabek.shp"
tujuan = root / "public" / "geo" / "kecamatan-koridor.geojson"

gdf = gpd.read_file(sumber)
gdf = gdf[gdf["ADM2_EN"].isin(KOTA_KORIDOR)].copy()
gdf["geometry"] = gdf.geometry.simplify(TOLERANSI_DERAJAT, preserve_topology=True)
gdf = gdf[KOLOM + ["geometry"]].rename(
    columns={
        "ADM3_EN": "kecamatan",
        "ADM3_PCODE": "kode",
        "ADM2_EN": "kotaKab",
        "ADM1_EN": "provinsi",
    }
)

tujuan.parent.mkdir(parents=True, exist_ok=True)
gdf.to_file(tujuan, driver="GeoJSON", COORDINATE_PRECISION=5)
print(f"{len(gdf)} kecamatan ditulis ke {tujuan}")
