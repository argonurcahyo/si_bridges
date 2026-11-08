"""Membuat diagram arsitektur SI dalam format draw.io (editable).

Jalankan dari root repo:
    python scripts/render-drawio-architecture.py

Output:
    docs/architecture/figures/arsitektur-sistem.drawio

Buka dengan https://app.diagrams.net (File > Open from > Device), atau
ekstensi Draw.io Integration di VS Code.
"""

from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "architecture" / "figures" / "arsitektur-sistem.drawio"

# Palet, sama dengan gambar PNG
INK = "#0F172A"
MUTED = "#475569"
SI = "#0F766E"
NUM = "#334155"
HUMAN = "#B45309"
OUTPUT = "#1D4ED8"
FALLBACK = "#6B7280"
BAND_A = "#F1F5F9"
BAND_B = "#F8FAFC"
WARN = "#FFFBEB"

W, H = 1000, 600

cells = []
counter = {"n": 0}


def cid(prefix):
    counter["n"] += 1
    return f"{prefix}-{counter['n']}"


def cell(xml):
    cells.append(xml)


def band(y, h, accent, fill):
    cell(
        f'<mxCell id="{cid("band")}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor={fill};'
        f'strokeColor=none;" vertex="1" parent="1"><mxGeometry x="0" y="{y}" width="{W}" height="{h}" as="geometry"/></mxCell>'
    )
    cell(
        f'<mxCell id="{cid("bar")}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor={accent};'
        f'strokeColor=none;" vertex="1" parent="1"><mxGeometry x="0" y="{y}" width="8" height="{h}" as="geometry"/></mxCell>'
    )


def label_vert(x, y, w, h, teks, warna):
    cell(
        f'<mxCell id="{cid("vlabel")}" value="{escape(teks).replace(chr(10), "&lt;br&gt;")}" style="text;html=1;align=center;'
        f'verticalAlign=middle;rotation=270;fontSize=11;fontStyle=1;fontColor={warna};" vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )


def label(x, y, w, h, teks, warna=MUTED, ukuran=9, miring=True, tebal=False, latar=None, align="left"):
    gaya = (
        f"text;html=1;align={align};verticalAlign=middle;fontSize={ukuran};fontColor={warna};"
        f"fontStyle={3 if (miring and not tebal) else (1 if tebal else 0)};"
    )
    if latar:
        gaya += f"labelBackgroundColor={latar};"
    cell(
        f'<mxCell id="{cid("label")}" value="{escape(teks)}" style="{gaya}" vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )


def kotak(nama, x, y, w, h, judul, isi, warna, tinggi_judul=22, garis_putus=False):
    grup = cid("group")
    cell(
        f'<mxCell id="{grup}" value="" style="group" vertex="1" connectable="0" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
    )
    cell(
        f'<mxCell id="{cid("head")}" value="{escape(judul)}" style="rounded=0;whiteSpace=wrap;html=1;'
        f'fillColor={warna};strokeColor={warna};fontColor=#FFFFFF;fontStyle=1;fontSize=10;align=left;'
        f'spacingLeft=7;spacingRight=7;" vertex="1" parent="{grup}">'
        f'<mxGeometry x="0" y="0" width="{w}" height="{tinggi_judul}" as="geometry"/></mxCell>'
    )
    cell(
        f'<mxCell id="{cid("body")}" value="{escape(isi)}" style="rounded=0;whiteSpace=wrap;html=1;'
        f'fillColor=#FFFFFF;strokeColor={warna};fontSize={8.6 if h < 60 else 9};align=left;verticalAlign=middle;'
        f'spacingLeft=7;spacingRight=7;{"dashed=1;" if garis_putus else ""}" vertex="1" parent="{grup}">'
        f'<mxGeometry x="0" y="{tinggi_judul}" width="{w}" height="{h - tinggi_judul}" as="geometry"/></mxCell>'
    )
    return grup


def panah(nama, sumber, target, titik=None, putus=False, keluar=None, masuk=None):
    gaya = (
        "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=1;"
        f"strokeColor={MUTED};strokeWidth=1.2;"
    )
    if putus:
        gaya += "dashed=1;"
    if keluar:
        gaya += f"exitX={keluar[0]};exitY={keluar[1]};exitDx=0;exitDy=0;"
    if masuk:
        gaya += f"entryX={masuk[0]};entryY={masuk[1]};entryDx=0;entryDy=0;"
    isi_titik = ""
    if titik:
        isi_titik = (
            '<Array as="points">'
            + "".join(f'<mxPoint x="{px}" y="{py}"/>' for px, py in titik)
            + "</Array>"
        )
    cell(
        f'<mxCell id="{cid("edge")}" value="" style="{gaya}" edge="1" parent="1" '
        f'source="{sumber}" target="{target}">'
        f'<mxGeometry relative="1" as="geometry">{isi_titik}</mxGeometry></mxCell>'
    )


def main():
    # --- pita baris
    band(24, 60, NUM, BAND_A)
    band(96, 94, SI, BAND_B)
    band(202, 90, SI, BAND_B)
    band(304, 94, SI, BAND_B)
    band(410, 112, HUMAN, BAND_B)
    band(532, 40, HUMAN, WARN)

    label_vert(8, 28, 88, 52, "SUMBER DATA", NUM)
    label_vert(8, 100, 88, 86, "LAPISAN 1\nPERSEPSI &\nANALITIK", SI)
    label_vert(8, 206, 88, 82, "LAPISAN 2\nKONTEKS &\nPENALARAN", SI)
    label_vert(8, 308, 88, 86, "LAPISAN 3\nGENERASI &\nANTARMUKA", SI)
    label_vert(8, 414, 88, 104, "KEPUTUSAN\nMANUSIA &\nKELUARAN", HUMAN)

    # --- sumber data
    label(
        120, 32, 850, 44,
        "Sentinel-2 & Landsat (GEE)  ·  DEMNAS 8 m  ·  Hujan BMKG  ·  TMA Katulampa–Depok–Manggarai (scraping)<br>"
        "SHP batas desa & jaringan sungai (BIG)  ·  Data sintetis hidrodinamik (Rational Method + lag routing)  ·  "
        "publik / berizin mitra / sintetis",
        warna=INK, ukuran=9, miring=False,
    )

    # --- legenda
    legenda = [
        (200, SI, "SI", "komponen SI"),
        (420, NUM, "NUM", "model numerik"),
        (630, HUMAN, "MANUSIA", "keputusan operator"),
        (820, OUTPUT, "KELUARAN", "antarmuka"),
    ]
    for x, warna, kode, teks in legenda:
        cell(
            f'<mxCell id="{cid("legend")}" value="&lt;b&gt;&lt;font color=&quot;{warna}&quot;&gt;■ {kode}&lt;/font&gt;&lt;/b&gt;'
            f'&amp;nbsp; &lt;font color=&quot;{MUTED}&quot;&gt;{teks}&lt;/font&gt;" '
            f'style="text;html=1;align=left;verticalAlign=middle;fontSize=9.5;" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="4" width="200" height="16" as="geometry"/></mxCell>'
        )

    # --- lapisan 1
    x1 = [110, 404, 698]
    w1 = 280
    y1, h1 = 104, 78
    lulc = kotak(
        "lulc", x1[0], y1, w1, h1,
        "SI · Klasifikasi LULC",
        "Random Forest di GEE per sub-DAS;<br>baseline Dynamic World (WRI–Google).<br>→ C (limpasan) per segmen",
        SI,
    )
    graph = kotak(
        "graph", x1[1], y1, w1, h1,
        "NUM · Graph engine hidrologi",
        "DAG pintu air–segmen:<br>Q = 0,00278·C·I·A + lag routing.<br>→ debit, waktu tiba, volume",
        NUM,
    )
    klas = kotak(
        "klasifikasi", x1[2], y1, w1, h1,
        "SI · Klasifikasi status siaga",
        "Gradient boosting (XGBoost).<br>Fitur: TMA, tren, hujan, debit.<br>→ aman / waspada / siaga",
        SI,
    )

    # --- lapisan 2
    y2, h2 = 210, 74
    ser = kotak(
        "serializer", 110, y2, 420, h2,
        "JSON · Serializer konteks",
        "Hasil graph + fitur LULC → skema JSON tetap.<br>LLM tidak menerima data mentah, hanya konteks terhitung.",
        NUM,
    )
    gem = kotak(
        "gemini", 560, y2, 420, h2,
        "SI · Gemini (Google, Amerika Serikat)",
        "Foundation model multimodal: penalaran skenario dan<br>rekomendasi taktis dari JSON.<br>Tidak menghitung debit.",
        SI,
    )

    # --- lapisan 3
    y3, h3 = 312, 78
    nar = kotak(
        "narasi", x1[0], y3, w1, h3,
        "SI · Narasi & draf peringatan",
        "Gemini menyusun teks peringatan desa;<br>setiap angka wajib ada di konteks.<br>Tidak menghitung sendiri.",
        SI,
    )
    val = kotak(
        "validator", x1[1], y3, w1, h3,
        "NUM · Validator angka",
        "Cocokkan angka narasi dengan simulasi;<br>confidence < 85% ditandai.",
        NUM,
    )
    fb = kotak(
        "fallback", x1[2], y3, w1, h3,
        "FALLBACK · Aturan hidrologi",
        "LLM gagal atau > 5 detik:<br>template rule-based, tanpa LLM.",
        FALLBACK,
        garis_putus=True,
    )

    # --- keputusan dan keluaran
    op = kotak(
        "operator", 110, 418, 560, 96,
        "MANUSIA · Operator BPBD / DSDA",
        "Meninjau, menerima atau menolak, dan menandatangani log audit.<br>"
        "SI tidak menggerakkan pintu air, pompa, atau rute evakuasi.",
        HUMAN,
    )
    dash = kotak(
        "dashboard", 684, 418, 296, 44,
        "KELUARAN · Dashboard operator",
        "Peta 2D/3D, simulasi, rekomendasi, audit.",
        OUTPUT,
        tinggi_judul=20,
    )
    web = kotak(
        "web", 684, 470, 296, 44,
        "KELUARAN · Web publik",
        "Zona per desa setelah snapshot disetujui.",
        OUTPUT,
        tinggi_judul=20,
    )

    # --- panah
    for px in (x1[0] + w1 / 2, x1[1] + w1 / 2, x1[2] + w1 / 2):
        cell(
            f'<mxCell id="{cid("feed")}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;'
            f'endArrow=block;endFill=1;strokeColor={MUTED};strokeWidth=1.2;" edge="1" parent="1">'
            f'<mxGeometry relative="1" as="geometry"><mxPoint x="{px}" y="84" as="sourcePoint"/>'
            f'<mxPoint x="{px}" y="{y1}" as="targetPoint"/></mxGeometry></mxCell>'
        )

    panah("c", lulc, graph, keluar=(1, 0.5), masuk=(0, 0.5))
    panah("q", graph, klas, keluar=(1, 0.5), masuk=(0, 0.5))

    panah("fitur", klas, ser, [(838, 196), (194, 196)], keluar=(0.5, 1), masuk=(0.2, 0))
    label(455, 184, 120, 12, "fitur + status", ukuran=8.5, latar="#FFFFFF")

    panah("json", ser, gem, keluar=(1, 0.5), masuk=(0, 0.5))
    label(532, 232, 28, 12, "JSON", ukuran=8.5, latar="#FFFFFF", align="center")

    panah("draf", gem, nar, [(770, 298), (166, 298)], keluar=(0.5, 1), masuk=(0.2, 0))
    label(420, 286, 110, 12, "draf + alasan", ukuran=8.5, latar="#FFFFFF")

    panah("validasi", nar, val, keluar=(1, 0.5), masuk=(0, 0.5))
    panah("gagal", val, fb, putus=True, keluar=(1, 0.5), masuk=(0, 0.5))

    cell(
        f'<mxCell id="{cid("to-operator")}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;'
        f'endArrow=block;endFill=1;strokeColor={MUTED};strokeWidth=1.2;'
        f'exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" '
        f'source="{val}" target="{op}">'
        f'<mxGeometry relative="1" as="geometry"/></mxCell>'
    )
    label(468, 400, 70, 12, "draf akhir", ukuran=8.5, latar="#FFFFFF", align="center")

    panah("fallback-op", fb, op, [(838, 404), (586, 404)], putus=True, keluar=(0.5, 1), masuk=(0.85, 0))

    panah("to-dash", op, dash, keluar=(1, 0.23), masuk=(0, 0.5))
    panah("to-web", op, web, putus=True, keluar=(1, 0.77), masuk=(0, 0.5))

    # --- catatan bawah
    label(
        120, 538, 850, 28,
        "<b>Batas SI:</b> debit dan waktu tiba dihitung model numerik; SI hanya mengklasifikasi, menalar, dan menarasikan."
        "<br>Tidak ada aktuasi otomatis. Publikasi ke web publik hanya setelah operator menerima snapshot.",
        warna=INK, ukuran=9, miring=False,
    )

    xml = (
        '<mxfile host="app.diagrams.net" type="device">\n'
        '  <diagram id="arsitektur-si" name="Arsitektur SI">\n'
        f'    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" '
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
