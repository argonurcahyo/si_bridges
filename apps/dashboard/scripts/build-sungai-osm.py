"""Membangun centerline Ciliwung dan alur graf antar pintu air.

Jalankan dari apps/dashboard:
    python scripts/build-sungai-osm.py

Input : ../../data/osm/ciliwung-osm.json  (hasil query Overpass, tidak masuk repo)
Output: public/geo/ciliwung.geojson        (satu garis menyambung)
        public/geo/koridor-edges.geojson  (5 alur mengikuti sungai)
        public/geo/scope-koridor.geojson  (poligon cakupan untuk masker basemap)

Sumber: OpenStreetMap via Overpass, lisensi ODbL.
"""

import json
import math
from pathlib import Path

import geopandas as gpd
import networkx as nx
from pyproj import Transformer
from shapely.geometry import LineString, Point
from shapely.ops import substring, unary_union

NAMA_DIPAKAI = {"ciliwung", "ci liwung", "sungai ciliwung"}
BRIDGE_MAKS_M = 800
SNAP_MAKS_M = 800

root = Path(__file__).resolve().parents[1]
sumber = root / ".." / ".." / "data" / "osm" / "ciliwung-osm.json"
geo = root / "public" / "geo"
geo.mkdir(parents=True, exist_ok=True)

ke_utm = Transformer.from_crs(4326, 32748, always_xy=True)
ke_wgs = Transformer.from_crs(32748, 4326, always_xy=True)


def baca_ways() -> list[list[tuple[float, float]]]:
    data = json.loads(sumber.read_text(encoding="utf-8"))
    ways: list[list[tuple[float, float]]] = []
    for el in data["elements"]:
        nama = (el.get("tags", {}).get("name") or "").strip().lower()
        geom = el.get("geometry") or []
        if nama in NAMA_DIPAKAI and len(geom) > 1:
            ways.append([(p["lon"], p["lat"]) for p in geom])
    if not ways:
        raise SystemExit("Tidak ada way Ciliwung pada file OSM")
    return ways


def buat_graf(ways):
    """Graf dengan node dalam meter UTM dan bobot jarak meter."""
    graf = nx.Graph()

    def kunci(xy):
        return (round(xy[0]), round(xy[1]))

    for way in ways:
        utm = [ke_utm.transform(lon, lat) for lon, lat in way]
        for a, b in zip(utm, utm[1:]):
            ka, kb = kunci(a), kunci(b)
            if ka == kb:
                continue
            jarak = math.dist(a, b)
            if not graf.has_edge(ka, kb) or graf[ka][kb]["weight"] > jarak:
                graf.add_edge(ka, kb, weight=jarak)

    # Sambungkan komponen yang terpisah celah kecil (mis. jembatan/way terpotong).
    ujung = {kunci(ke_utm.transform(way[0][0], way[0][1])) for way in ways}
    ujung |= {kunci(ke_utm.transform(way[-1][0], way[-1][1])) for way in ways}
    ujung = list(ujung)

    while nx.number_connected_components(graf) > 1:
        komponen = {node: i for i, comp in enumerate(nx.connected_components(graf)) for node in comp}
        terbaik = None
        for i, a in enumerate(ujung):
            if a not in graf:
                continue
            for b in ujung[i + 1 :]:
                if b not in graf or komponen.get(a) == komponen.get(b):
                    continue
                jarak = math.dist(a, b)
                if jarak <= BRIDGE_MAKS_M and (terbaik is None or jarak < terbaik[0]):
                    terbaik = (jarak, a, b)
        if terbaik is None:
            break
        jarak, a, b = terbaik
        graf.add_edge(a, b, weight=jarak)
    return graf


def nearest_node(graf, lon, lat):
    x, y = ke_utm.transform(lon, lat)
    node = min(graf.nodes, key=lambda n: (n[0] - x) ** 2 + (n[1] - y) ** 2)
    offset = math.dist(node, (x, y))
    return node, offset


def main() -> None:
    ways = baca_ways()
    graf = buat_graf(ways)
    print(
        f"ways={len(ways)} node={graf.number_of_nodes()} "
        f"edge={graf.number_of_edges()} komponen={nx.number_connected_components(graf)}"
    )

    jaringan = json.loads((root / "src" / "data" / "network.json").read_text(encoding="utf-8"))
    urutan = ["katulampa", "depok", "manggarai", "kampung_melayu", "bidara_cina", "cawang"]

    snap = {}
    for node in jaringan["nodes"]:
        if node["id"] not in urutan:
            continue
        target, offset = nearest_node(graf, node["lng"], node["lat"])
        if offset > SNAP_MAKS_M:
            print(f"PERINGATAN {node['id']} berjarak {offset:.0f} m dari sungai")
        snap[node["id"]] = target
        print(f"{node['id']:<16} snap {offset:6.0f} m")

    # Telusuri dari Katulampa sampai ujung hilir paling utara.
    ujung_hilir = max(graf.nodes, key=lambda n: n[1])
    jalur = nx.shortest_path(graf, snap[urutan[0]], ujung_hilir, weight="weight")
    garis = LineString(jalur)
    print(f"panjang jalur {garis.length / 1000:.1f} km, {len(jalur)} vertex")

    # Posisi tiap pintu air di sepanjang jalur
    posisi = {}
    for node in jaringan["nodes"]:
        if node["id"] not in urutan:
            continue
        x, y = ke_utm.transform(node["lng"], node["lat"])
        posisi[node["id"]] = garis.project(Point(x, y))
    print("posisi km:", {k: round(v / 1000, 1) for k, v in posisi.items()})

    def garis_ke_wgs(line: LineString) -> list[list[float]]:
        hasil = []
        for x, y in line.coords:
            lon, lat = ke_wgs.transform(x, y)
            hasil.append([round(lon, 6), round(lat, 6)])
        return hasil

    # Simpan centerline utuh
    centerline = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"nama": "Ciliwung", "sumber": "OpenStreetMap (ODbL)"},
                "geometry": {"type": "LineString", "coordinates": garis_ke_wgs(garis)},
            }
        ],
    }
    (geo / "ciliwung.geojson").write_text(json.dumps(centerline), encoding="utf-8")

    # Potong jalur per segmen antar pintu air, diurutkan mengikuti aliran sungai.
    urut = sorted(posisi, key=posisi.get)
    fitur = []
    for a, b in zip(urut, urut[1:]):
        awal, akhir = sorted((posisi[a], posisi[b]))
        potong = substring(garis, awal, akhir)
        fitur.append(
            {
                "type": "Feature",
                "properties": {"id": f"{a}-{b}", "dari": a, "ke": b},
                "geometry": {"type": "LineString", "coordinates": garis_ke_wgs(potong)},
            }
        )
        print(f"edge {a:<16} -> {b:<16} {potong.length / 1000:5.1f} km")
    (geo / "koridor-edges.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": fitur}), encoding="utf-8"
    )

    # Poligon cakupan untuk masker basemap (di dalam koridor dibuat polos)
    kecamatan = gpd.read_file(geo / "kecamatan-koridor.geojson")
    scope = unary_union(kecamatan.geometry).simplify(0.0005)
    (geo / "scope-koridor.geojson").write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {"nama": "Cakupan koridor"},
                        "geometry": scope.__geo_interface__,
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    print("scope-koridor.geojson ditulis")


if __name__ == "__main__":
    main()


