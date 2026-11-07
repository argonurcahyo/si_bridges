"""Membangun layer sungai untuk koridor tambahan dari cache OSM.

Jalankan dari apps/dashboard:
    python scripts/build-koridor-lain.py

Input : ../../data/osm/<Nama>-osm.json
Output: public/geo/pesanggrahan.geojson
"""

import json
from pathlib import Path

from shapely.geometry import LineString, mapping

root = Path(__file__).resolve().parents[1]
osm = root / ".." / ".." / "data" / "osm"
geo = root / "public" / "geo"

KORIDOR = [
    ("Pesanggrahan", "pesanggrahan", "Pesanggrahan"),
]


def main() -> None:
    for berkas, slug, kata_kunci in KORIDOR:
        sumber = osm / f"{berkas}-osm.json"
        if not sumber.exists():
            print(f"lewat: {sumber.name} tidak ada")
            continue

        data = json.loads(sumber.read_text(encoding="utf-8"))
        fitur = []
        for el in data.get("elements", []):
            nama = (el.get("tags", {}).get("name") or "").strip()
            geom = el.get("geometry") or []
            if kata_kunci.lower() not in nama.lower() or len(geom) < 2:
                continue
            garis = LineString([(p["lon"], p["lat"]) for p in geom]).simplify(0.0001)
            fitur.append(
                {
                    "type": "Feature",
                    "properties": {"nama": nama, "sumber": "OpenStreetMap (ODbL)"},
                    "geometry": mapping(garis),
                }
            )

        tujuan = geo / f"{slug}.geojson"
        tujuan.write_text(
            json.dumps({"type": "FeatureCollection", "features": fitur}), encoding="utf-8"
        )
        print(f"{len(fitur):>3} garis  {tujuan.stat().st_size / 1024:>6.0f} KB  {tujuan.name}")


if __name__ == "__main__":
    main()
