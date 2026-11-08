"""Membangun poligon kelurahan koridor Ciliwung dari SHP BPS.

Jalankan dari root repo (butuh geopandas):
    python scripts/build-kelurahan-geo.py

Input:
    data/shp/idn_admbnda_adm4_bps_20200401.shp
    apps/dashboard/public/geo/scope-koridor.geojson
    apps/dashboard/public/geo/ciliwung.geojson

Output:
    apps/dashboard/public/geo/kelurahan-koridor.geojson

Empat kota/kabupaten koridor: Jakarta Selatan, Jakarta Timur, Jakarta Pusat,
Kota Depok. Jumlahnya 237 kelurahan.
"""

from pathlib import Path

import geopandas as gpd

ROOT = Path(__file__).resolve().parents[1]
SHP = ROOT / "data" / "shp" / "idn_admbnda_adm4_bps_20200401.shp"
GEO = ROOT / "apps" / "dashboard" / "public" / "geo"
SCOPE = GEO / "scope-koridor.geojson"
SUNGAI = GEO / "ciliwung.geojson"
OUT = GEO / "kelurahan-koridor.geojson"

KOTA = [
    "Kota Jakarta Selatan",
    "Kota Jakarta Timur",
    "Kota Jakarta Pusat",
    "Kota Depok",
]

UTM = "EPSG:32748"  # UTM 48S, metrik untuk luas dan jarak
SIMPLIFY = 0.00022  # derajat, sekitar 24 m


def main() -> None:
    scope = gpd.read_file(SCOPE).to_crs(4326)
    bbox = tuple(scope.total_bounds)

    shp = gpd.read_file(SHP, bbox=bbox)
    shp = shp[shp["ADM2_EN"].isin(KOTA)].copy()
    shp = shp[shp.geometry.intersects(scope.geometry.union_all())].copy()
    print(f"kelurahan terpilih: {len(shp)}")

    shp = shp.to_crs(UTM)
    shp["luasHa"] = (shp.geometry.area / 10_000).round(1)

    sungai = gpd.read_file(SUNGAI).to_crs(UTM)
    garis = sungai.geometry.union_all()
    shp["jarakSungaiM"] = shp.geometry.centroid.distance(garis).round(0)

    # Perkiraan jumlah RW untuk mock; ganti dengan data RW resmi bila tersedia.
    shp["rw"] = (shp["luasHa"] / 18).round().clip(lower=3, upper=28).astype(int)

    shp = shp.to_crs(4326)
    shp["geometry"] = shp.geometry.simplify(SIMPLIFY, preserve_topology=True)

    hasil = shp.rename(
        columns={
            "ADM4_EN": "kelurahan",
            "ADM4_PCODE": "kode",
            "ADM3_EN": "kecamatan",
            "ADM2_EN": "kota",
            "ADM1_EN": "provinsi",
        }
    )[
        [
            "kode",
            "kelurahan",
            "kecamatan",
            "kota",
            "provinsi",
            "luasHa",
            "jarakSungaiM",
            "rw",
            "geometry",
        ]
    ].sort_values(["kota", "kecamatan", "kelurahan"])

    kosong = hasil.geometry.is_empty
    if kosong.any():
        print(f"membuang {int(kosong.sum())} geometri kosong")
        hasil = hasil[~kosong]

    hasil.to_file(OUT, driver="GeoJSON")
    print(f"tersimpan: {OUT} ({OUT.stat().st_size / 1024:.0f} KB, {len(hasil)} fitur)")


if __name__ == "__main__":
    main()
