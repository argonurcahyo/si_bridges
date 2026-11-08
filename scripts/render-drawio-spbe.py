"""Membuat diagram arsitektur SPBE HydroTwin-AI (draw.io).

Jalankan dari root repo:
    python scripts/render-drawio-spbe.py

Output:
    docs/architecture/figures/arsitektur-spbe-hydrotwin.drawio

Kanvas 2055 x 1365 px, agar saat ditempel selebar 17,8 cm di A4
teks tetap terbaca (sekitar 6 pt).
"""

from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "architecture" / "figures" / "arsitektur-spbe-hydrotwin.drawio"

W, H = 2055, 1365

NAVY = "#16324F"
INK = "#0F172A"
MUTED = "#475569"
LINE = "#CBD5E1"

BOX_FILL = "#EFF6FF"
BOX_LINE = "#2563EB"
SI_FILL = "#FFF7ED"
SI_LINE = "#EA580C"
GUARD_FILL = "#ECFDF5"
GUARD_LINE = "#059669"
SEC_FILL = "#FEF2F2"
SEC_LINE = "#DC2626"
SEC_CARD = "#FFFFFF"

FONT = "Segoe UI"

cells = []
n = {"i": 0}


def cid(prefix):
    n["i"] += 1
    return f"{prefix}-{n['i']}"


def add(xml):
    cells.append(xml)


def rect(x, y, w, h, style, value="", parent="1", extra=""):
    add(
        f'<mxCell id="{cid("c")}" value="{escape(value)}" style="{style}" vertex="1" parent="{parent}">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )


def text(x, y, w, h, value, size, color=INK, bold=False, italic=False, align="left", valign="middle", rotation=0):
    gaya_teks = (1 if bold else 0) + (2 if italic else 0)
    gaya = (
        f"text;html=1;align={align};verticalAlign={valign};fontSize={size};fontFamily={FONT};"
        f"fontColor={color};fontStyle={gaya_teks};rotation={rotation};"
    )
    rect(x, y, w, h, gaya, value)


def band(y, h):
    rect(15, y, 2040, h, f"rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor={LINE};")


def domain(y, h, kode, judul, inggris):
    rect(
        15, y, 180, h,
        f"rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor={NAVY};strokeColor={NAVY};",
    )
    text(25, y + 8, 160, 34, kode, 29, color="#FFFFFF", bold=True, align="center")
    text(25, y + 58, 160, 68, judul, 23, color="#FFFFFF", bold=True, align="center")
    text(25, y + h - 36, 160, 24, inggris, 14.5, color="#BFD3E6", italic=True, align="center")


def card(x, y, w, h, value, kind="plain", size=23):
    fill, line = {
        "plain": (BOX_FILL, BOX_LINE),
        "si": (SI_FILL, SI_LINE),
        "guard": (GUARD_FILL, GUARD_LINE),
    }[kind]
    rect(
        x, y, w, h,
        f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={line};strokeWidth=2;",
    )
    add(
        f'<mxCell id="{cid("t")}" value="{escape(value)}" style="text;html=1;align=center;verticalAlign=middle;'
        f'fontSize={size};fontFamily={FONT};fontColor={INK};whiteSpace=wrap;" vertex="1" parent="1">'
        f'<mxGeometry x="{x + 8}" y="{y + 8}" width="{w - 16}" height="{h - 16}" as="geometry"/></mxCell>'
    )


def chevron(x, y, w, h, value, kind="plain", size=22):
    fill, line = {
        "plain": (BOX_FILL, BOX_LINE),
        "si": (SI_FILL, SI_LINE),
    }[kind]
    rect(
        x, y, w, h,
        f"shape=step;perimeter=stepPerimeter;size=24;fixedSize=1;whiteSpace=wrap;html=1;"
        f"fillColor={fill};strokeColor={line};strokeWidth=2;",
    )
    add(
        f'<mxCell id="{cid("t")}" value="{escape(value)}" style="text;html=1;align=center;verticalAlign=middle;'
        f'fontSize={size};fontFamily={FONT};fontColor={INK};whiteSpace=wrap;" vertex="1" parent="1">'
        f'<mxGeometry x="{x + 18}" y="{y + 8}" width="{w - 34}" height="{h - 16}" as="geometry"/></mxCell>'
    )


def arrow_up(x, y1, y2):
    add(
        f'<mxCell id="{cid("arrow")}" value="" style="endArrow=block;endFill=1;html=1;rounded=0;'
        f'strokeColor={MUTED};strokeWidth=2;fillColor={MUTED};" edge="1" parent="1">'
        f'<mxGeometry relative="1" as="geometry"><mxPoint x="{x}" y="{y1}" as="sourcePoint"/>'
        f'<mxPoint x="{x}" y="{y2}" as="targetPoint"/></mxGeometry></mxCell>'
    )


def main():
    # --- baris domain
    band(15, 230)
    band(275, 230)
    band(535, 230)
    band(795, 230)
    band(1055, 230)

    domain(15, 230, "D6", "Layanan<br>SPBE", "Business Service")
    domain(275, 230, "D1", "Proses<br>Bisnis", "Business Architecture")
    domain(535, 230, "D4", "Aplikasi<br>SPBE", "Application Arch.")
    domain(795, 230, "D2", "Data dan<br>Informasi", "Data Architecture")
    domain(1055, 230, "D3", "Infrastruktur<br>SPBE", "Technology Arch.")

    # --- D6 layanan
    y6, h6 = 35, 190
    w6 = 521
    x6 = [215, 757, 1299]
    card(x6[0], y6, w6, h6,
         "<b>Warga RW bantaran</b><br>PWA peringatan: zona risiko,<br>kisaran kedalaman, langkah evakuasi")
    card(x6[1], y6, w6, h6,
         "<b>Operator BPBD / DSDA</b><br>Konsol peringatan: tinjau, setujui,<br>rekomendasi taktis (hanya saran)")
    card(x6[2], y6, w6, h6,
         "<b>Perencana Pemprov DKI,<br>Depok, Bogor</b><br>Simulator what-if 3D + Executive Brief")

    # --- D1 proses bisnis (chevron)
    y1, h1 = 305, 170
    w1 = 256
    labels1 = [
        ("1 · Sense<br>hujan, TMA, satelit", "plain"),
        ("2 · Simulate<br>HEC-RAS 2D + GNN surrogate", "plain"),
        ("3 · Explain<br>narasi SI + validator angka", "si"),
        ("4 · Approve<br>tinjauan operator BPBD (HITL)", "plain"),
        ("5 · Disseminate<br>PWA, kanal BPBD/RW", "plain"),
        ("6 · Evaluate<br>hindcast, log, kalibrasi ulang", "plain"),
    ]
    for i, (teks, jenis) in enumerate(labels1):
        chevron(215 + i * (w1 + 13), y1, w1, h1, teks, jenis, size=21)

    # --- D4 aplikasi
    y4, h4 = 565, 170
    w4 = 256
    gap4 = 13
    labels4 = [
        ("Ingest &<br>ETL service", "plain"),
        ("Hydro engine<br>HEC-RAS 2D + GNN<br>(PyTorch Geometric)", "plain"),
        ("Scenario /<br>what-if service", "plain"),
        ("<b>SI Gateway (adapter)</b><br>Claude + model OpenAI", "si"),
        ("Validator angka &<br>fallback rule-based", "guard"),
        ("Web 3D (Mapbox/<br>Cesium) + PWA offline", "plain"),
    ]
    for i, (teks, jenis) in enumerate(labels4):
        card(215 + i * (w4 + gap4), y4, w4, h4, teks, jenis, size=21)

    # --- D2 data
    y2, h2 = 825, 170
    labels2 = [
        ("Topografi<br>DEMNAS 8 m, batas DAS,<br>bangunan", "plain"),
        ("<b>Citra Sentinel-2,<br>Landsat; AlphaEarth<br>Satellite Embedding</b>", "si"),
        ("Hujan BMKG/GPM,<br>TMA Katulampa,<br>Depok, Manggarai", "plain"),
        ("Amblesan (InSAR),<br>muka laut, pasang<br>surut", "plain"),
        ("RDTR/RTRW &<br>regulasi (korpus<br>RAG)", "plain"),
        ("Library skenario,<br>data validasi, sintetis<br>(tanpa PII)", "plain"),
    ]
    for i, (teks, jenis) in enumerate(labels2):
        card(215 + i * (w4 + gap4), y2, w4, h2, teks, jenis, size=21)

    # --- D3 infrastruktur
    y3, h3 = 1085, 170
    labels3 = [
        ("Google Earth Engine<br>(pemrosesan satelit)", "plain"),
        ("Container cloud<br>(Cloud Run / AWS)<br>kredit USD 400", "plain"),
        ("PostgreSQL +<br>PostGIS", "plain"),
        ("Object storage,<br>3D tiles + CDN", "plain"),
        ("Cloud CPU/GPU batch<br>(HEC-RAS, latih GNN)", "plain"),
        ("Service worker<br>(cache offline<br>di perangkat)", "plain"),
    ]
    for i, (teks, jenis) in enumerate(labels3):
        card(215 + i * (w4 + gap4), y3, w4, h3, teks, jenis, size=21)

    # --- panah aliran data (bawah ke atas)
    for y1a, y2a in ((245, 275), (505, 535), (765, 795), (1025, 1055)):
        arrow_up(1017, y1a, y2a)

    # --- D5 keamanan (lintas domain)
    rect(
        1845, 15, 195, 1270,
        f"rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor={SEC_FILL};strokeColor={SEC_LINE};strokeWidth=2;",
    )
    text(1852, 20, 181, 34, "D5", 28, color=SEC_LINE, bold=True, align="center")
    text(1852, 60, 181, 30, "Keamanan SPBE", 20, color=SEC_LINE, bold=True, align="center")
    text(1852, 94, 181, 22, "lintas domain", 14, color=SEC_LINE, italic=True, align="center")

    d5 = [
        "Human-in-the-loop:<br>AI tidak mengendalikan<br>pintu air/pompa",
        "Peringatan evakuasi<br>terbit setelah<br>persetujuan BPBD",
        "Guardrail LLM:<br>keluaran JSON,<br>validator angka",
        "Fallback rule-based<br>saat API/jaringan<br>terganggu",
        "Privasi: GPS hanya<br>di perangkat; tanpa<br>PII (UU PDP 27/2022)",
        "Confidence score,<br>audit log, RBAC,<br>HTTPS, rahasia API",
    ]
    yk = 132
    hk = 180
    for teks in d5:
        rect(
            1858, yk, 169, hk,
            f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={SEC_CARD};strokeColor=#FCA5A5;strokeWidth=1.6;",
        )
        add(
            f'<mxCell id="{cid("t")}" value="{escape(teks)}" style="text;html=1;align=center;verticalAlign=middle;'
            f'fontSize=18.5;fontFamily={FONT};fontColor={INK};whiteSpace=wrap;" vertex="1" parent="1">'
            f'<mxGeometry x="{1863}" y="{yk + 8}" width="159" height="{hk - 16}" as="geometry"/></mxCell>'
        )
        yk += hk + 12

    # --- legenda
    ly = 1310
    items = [
        (215, SI_FILL, SI_LINE, "Komponen SI dari perusahaan AS"),
        (780, BOX_FILL, BOX_LINE, "Komponen non-SI (fisik, data, visualisasi)"),
        (1430, GUARD_FILL, GUARD_LINE, "Pengaman (validator, fallback)"),
    ]
    for x, fill, line, teks in items:
        rect(x, ly + 2, 26, 22,
             f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={line};strokeWidth=2;")
        text(x + 36, ly, 420, 26, teks, 19, color=MUTED)

    xml = (
        '<mxfile host="app.diagrams.net" type="device">\n'
        '  <diagram id="arsitektur-spbe" name="Arsitektur SPBE">\n'
        f'    <mxGraphModel dx="2055" dy="1365" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" '
        f'arrows="1" fold="1" page="1" pageScale="1" pageWidth="{W}" pageHeight="{H}" math="0" shadow="0">\n'
        "      <root>\n"
        '        <mxCell id="0"/>\n'
        '        <mxCell id="1" parent="0"/>\n'
        + "".join(f"        {c}\n" for c in cells)
        + "      </root>\n"
        "    </mxGraphModel>\n"
        "  </diagram>\n"
        "</mxfile>\n"
    )
    OUT.write_text(xml, encoding="utf-8")
    print(f"tersimpan: {OUT}")


if __name__ == "__main__":
    main()
