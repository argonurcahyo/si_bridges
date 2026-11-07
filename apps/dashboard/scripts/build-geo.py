"""Membangun layer geospasial ringan untuk dashboard.

Jalankan dari apps/dashboard:
    python scripts/build-geo.py

Input (tidak masuk repo, lihat .gitignore):
  ../../data/shp/kecamatan_jabodetabek.shp
  ../../data/shp/jabodetabek.shp
  ../../data/shp/Sungai Line 25K (124).shp

Output (masuk repo):
  public/geo/kecamatan-koridor.geojson
  public/geo/kabupaten-jabodetabek.geojson
  public/geo/provinsi-jabodetabek.geojson
  public/geo/sungai-jabodetabek.geojson
"""

from pathlib import Path

import geopandas as gpd
from pyproj import Transformer

KOTA_KORIDOR = [
    "Kota Depok",
    "Kota Jakarta Pusat",
    "Kota Jakarta Selatan",
    "Kota Jakarta Timur",
]
BBOX_JABODETABEK = (106.6, -6.7, 107.1, -6.0)

root = Path(__file__).resolve().parents[1]
shp = root / ".." / ".." / "data" / "shp"
geo = root / "public" / "geo"
geo.mkdir(parents=True, exist_ok=True)


def tulis(gdf: gpd.GeoDataFrame, nama: str) -> None:
    tujuan = geo / nama
    gdf.to_file(tujuan, driver="GeoJSON", COORDINATE_PRECISION=5)
    print(f"{len(gdf):>4} fitur  {tujuan.stat().st_size / 1024:>8.0f} KB  {nama}")


# 1. Kecamatan pada koridor (untuk heatmap dan hover nama)
kecamatan = gpd.read_file(shp / "kecamatan_jabodetabek.shp")
kecamatan = kecamatan[kecamatan["ADM2_EN"].isin(KOTA_KORIDOR)].copy()
kecamatan["geometry"] = kecamatan.geometry.simplify(0.0003, preserve_topology=True)
kecamatan = kecamatan[["ADM3_EN", "ADM3_PCODE", "ADM2_EN", "ADM1_EN", "geometry"]].rename(
    columns={
        "ADM3_EN": "kecamatan",
        "ADM3_PCODE": "kode",
        "ADM2_EN": "kotaKab",
        "ADM1_EN": "provinsi",
    }
)
tulis(kecamatan, "kecamatan-koridor.geojson")

# 2. Batas kabupaten/kota Jabodetabek
kabupaten = gpd.read_file(shp / "jabodetabek.shp")
kabupaten["geometry"] = kabupaten.geometry.simplify(0.0002, preserve_topology=True)
kabupaten = kabupaten[["ADM2_EN", "ADM2_PCODE", "ADM1_EN", "geometry"]].rename(
    columns={"ADM2_EN": "kabupaten", "ADM2_PCODE": "kode", "ADM1_EN": "provinsi"}
)
tulis(kabupaten, "kabupaten-jabodetabek.geojson")

# 3. Batas provinsi (dissolve kabupaten per provinsi)
provinsi = kabupaten.dissolve(by="provinsi", as_index=False)[["provinsi", "geometry"]]
provinsi["geometry"] = provinsi.geometry.simplify(0.0002, preserve_topology=True)
tulis(provinsi, "provinsi-jabodetabek.geojson")

# 4. Garis sungai besar (Ciliwung) dibangun terpisah oleh build-sungai-osm.py

