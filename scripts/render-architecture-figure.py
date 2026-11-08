"""Membuat gambar arsitektur untuk proposal HydroTwin-AI.

Jalankan dari root repo:
    python scripts/render-architecture-figure.py

Output (300 dpi):
    docs/architecture/figures/arsitektur-sistem.png
    docs/architecture/figures/pipeline-model-si.png
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "architecture" / "figures"
OUT.mkdir(parents=True, exist_ok=True)

FONT = "Segoe UI"

INK = "#0F172A"
MUTED = "#475569"
GRID = "#CBD5E1"

SI = "#0F766E"
NUM = "#334155"
HUMAN = "#B45309"
OUTPUT = "#1D4ED8"
FALLBACK = "#6B7280"

BAND_A = "#F1F5F9"
BAND_B = "#F8FAFC"
WARN_BG = "#FFFBEB"

plt.rcParams.update(
    {
        "font.family": FONT,
        "font.size": 6,
        "text.color": INK,
        "axes.edgecolor": GRID,
        "savefig.facecolor": "white",
        "figure.facecolor": "white",
    }
)


def kotak(ax, x, y, w, h, judul, isi, warna, ukuran_judul=6.15, ukuran_isi=5.7, garis="-"):
    tinggi_judul = min(4.2, h * 0.34)
    ax.add_patch(
        Rectangle(
            (x, y + h - tinggi_judul),
            w,
            tinggi_judul,
            facecolor=warna,
            edgecolor=warna,
            linewidth=0.6,
            zorder=3,
        )
    )
    ax.add_patch(
        Rectangle(
            (x, y),
            w,
            h - tinggi_judul,
            facecolor="white",
            edgecolor=warna,
            linewidth=0.6,
            linestyle=garis,
            zorder=3,
        )
    )
    ax.text(
        x + 1.2,
        y + h - tinggi_judul / 2,
        judul,
        color="white",
        fontsize=ukuran_judul,
        fontweight="bold",
        va="center",
        ha="left",
        zorder=4,
    )
    ax.text(
        x + 1.2,
        y + (h - tinggi_judul) / 2,
        isi,
        color=INK,
        fontsize=ukuran_isi,
        va="center",
        ha="left",
        linespacing=1.42,
        zorder=4,
    )


def panah(ax, titik, putus=False, warna=MUTED, tebal=0.85, label=None, geser=(0, 0.9), label_pos=None):
    for (x1, y1), (x2, y2) in zip(titik[:-2], titik[1:-1]):
        ax.plot(
            [x1, x2],
            [y1, y2],
            color=warna,
            linewidth=tebal,
            linestyle=(0, (2.4, 1.6)) if putus else "-",
            solid_capstyle="round",
            zorder=2,
        )
    ax.annotate(
        "",
        xy=titik[-1],
        xytext=titik[-2],
        arrowprops=dict(
            arrowstyle="-|>",
            color=warna,
            linewidth=tebal,
            linestyle=(0, (2.4, 1.6)) if putus else "-",
            shrinkA=0,
            shrinkB=0,
            mutation_scale=5.2,
        ),
        zorder=2,
    )
    if label:
        if label_pos is None:
            (x1, y1), (x2, y2) = titik[-2], titik[-1]
            label_pos = ((x1 + x2) / 2 + geser[0], (y1 + y2) / 2 + geser[1])
        ax.text(
            label_pos[0],
            label_pos[1],
            label,
            fontsize=5.2,
            color=MUTED,
            style="italic",
            ha="center",
            va="bottom",
            bbox=dict(facecolor="white", edgecolor="none", pad=0.6),
            zorder=5,
        )


def band(ax, y, h, warna_belah, bayangan=BAND_B):
    ax.add_patch(Rectangle((0, y), 100, h, facecolor=bayangan, edgecolor="none", zorder=0))
    ax.add_patch(Rectangle((0, y), 1.1, h, facecolor=warna_belah, edgecolor="none", zorder=1))


def label_lapisan(ax, x, y, teks, warna):
    ax.text(
        x,
        y,
        teks,
        rotation=90,
        color=warna,
        fontsize=5.5,
        fontweight="bold",
        ha="center",
        va="center",
        linespacing=1.25,
        zorder=2,
    )


def legenda(ax, y):
    item = [
        (17.0, "SI", "komponen SI", SI),
        (36.0, "NUM", "numerik/aturan", NUM),
        (58.0, "MANUSIA", "keputusan operator", HUMAN),
        (80.0, "KELUARAN", "antarmuka", OUTPUT),
    ]
    for x, kode, teks, warna in item:
        ax.add_patch(Rectangle((x, y - 0.75), 1.5, 1.5, facecolor=warna, edgecolor="none", zorder=4))
        ax.text(x + 2.0, y, kode, fontsize=5.0, fontweight="bold", color=warna, va="center", ha="left")
        ax.text(x + 2.0 + len(kode) * 0.8 + 1.2, y, teks, fontsize=5.0, color=MUTED, va="center", ha="left")


def gambar_arsitektur():
    fig = plt.figure(figsize=(6.55, 4.95), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 104)
    ax.axis("off")

    # --- pita baris
    band(ax, 92.5, 7.5, NUM, BAND_A)
    band(ax, 70.5, 15.5, SI)
    band(ax, 50.5, 15.5, SI)
    band(ax, 30.5, 15.5, SI)
    band(ax, 8.5, 17.5, HUMAN)

    label_lapisan(ax, 3.6, 96.2, "SUMBER\nDATA", NUM)
    label_lapisan(ax, 3.6, 78.2, "LAPISAN 1\nPERSEPSI &\nANALITIK", SI)
    label_lapisan(ax, 3.6, 58.2, "LAPISAN 2\nKONTEKS &\nPENALARAN", SI)
    label_lapisan(ax, 3.6, 38.2, "LAPISAN 3\nGENERASI &\nANTARMUKA", SI)
    label_lapisan(ax, 3.6, 17.2, "KEPUTUSAN\nMANUSIA &\nKELUARAN", HUMAN)

    # --- sumber data
    ax.text(
        7.0,
        97.2,
        "Sentinel-2 & Landsat (GEE)  ·  AlphaEarth Satellite Embedding  ·  DEMNAS 8 m  ·  Hujan BMKG  ·  "
        "TMA 3 pintu air\nSHP batas desa & jaringan sungai (BIG)  ·  Korpus RDTR/RTRW  ·  Data sintetis "
        "hidrodinamik  ·  publik / mitra / sintetis",
        fontsize=5.6,
        va="center",
        ha="left",
        linespacing=1.5,
        zorder=4,
    )

    legenda(ax, 102.4)

    # --- lapisan 1
    x = [7.0, 38.57, 70.14]
    w = 28.36
    h = 12.6
    y = 71.6

    kotak(
        ax, x[0], y, w, h,
        "SI · AlphaEarth Embedding (Google)",
        "Tutupan lahan & imperviousness 10 m\nvia Earth Engine, label lapangan minim.\n→ parameter limpasan C",
        SI,
    )
    kotak(
        ax, x[1], y, w, h,
        "NUM · Graph engine hidrologi",
        "DAG pintu air–segmen:\nQ = 0,00278·C·I·A + lag routing.\n→ debit, rate of rise, waktu puncak",
        NUM,
    )
    kotak(
        ax, x[2], y, w, h,
        "SI · Klasifikasi status siaga",
        "Gradient boosting (XGBoost).\nFitur: TMA, tren, hujan, debit.\n→ aman / waspada / siaga",
        SI,
    )

    # --- lapisan 2
    y2, h2 = 51.6, 11.8
    kotak(
        ax, 7.0, y2, 43.75, h2,
        "JSON · Serializer konteks",
        "Hasil graph + fitur lahan + status menjadi skema JSON tetap.\nLLM tidak menerima data mentah.",
        NUM,
    )
    kotak(
        ax, 54.75, y2, 43.75, h2,
        "NUM · Template peringatan",
        "Template baku per level: Waspada / Siaga / Awas.\nTidak menentukan level; hanya membatasi bahasa.",
        NUM,
    )

    # --- lapisan 3: dua jalur model
    y3, h3 = 31.6, 11.8
    kotak(
        ax, x[0], y3, w, h3,
        "SI · Claude Sonnet 5.5 (Anthropic)",
        "Executive Brief: analisis skenario,\nrujukan pasal RDTR via RAG, dan\nselisih antar skenario.",
        SI,
    )
    kotak(
        ax, x[1], y3, w, h3,
        "SI · OpenAI (model terbaru)",
        "Peringatan bahasa awam: debit,\nrate of rise, waktu puncak → pesan\nuntuk Pengurus RW & warga.",
        SI,
    )
    kotak(
        ax, x[2], y3, w, h3,
        "NUM · Validator + fallback",
        "Cek angka narasi vs simulasi;\nfallback rule-based ≤ 5 detik.\nTidak menentukan level.",
        NUM,
    )

    # --- keputusan dan keluaran
    kotak(
        ax, 7.0, 9.6, 33.0, 12.4,
        "KELUARAN · Executive Brief",
        "Untuk analis kebijakan: ringkasan\nskenario, rujukan RDTR, selisih opsi.",
        OUTPUT,
        ukuran_judul=5.9,
        ukuran_isi=5.4,
    )
    kotak(
        ax, 43.0, 9.6, 29.0, 12.4,
        "MANUSIA · Operator BPBD / DSDA",
        "Meninjau, menyetujui, dan menandatangani\nlog audit. Tidak ada aktuasi pintu air/pompa.",
        HUMAN,
        ukuran_judul=5.9,
        ukuran_isi=5.4,
    )
    kotak(
        ax, 75.0, 17.0, 23.5, 5.0,
        "KELUARAN · Dashboard operator",
        "Peta, debit, rekomendasi, audit.",
        OUTPUT,
        ukuran_judul=5.6,
        ukuran_isi=5.1,
    )
    kotak(
        ax, 75.0, 9.6, 23.5, 5.6,
        "KELUARAN · PWA warga & RW",
        "Zona, kedalaman, langkah evakuasi.",
        OUTPUT,
        ukuran_judul=5.6,
        ukuran_isi=5.1,
    )

    # --- panah
    for xi in (x[0] + w / 2, x[1] + w / 2, x[2] + w / 2):
        panah(ax, [(xi, 92.5), (xi, y + h)])

    panah(ax, [(x[0] + w, y + 6.2), (x[1], y + 6.2)])
    panah(ax, [(x[1] + w, y + 6.2), (x[2], y + 6.2)])

    # classifier -> serializer
    panah(
        ax,
        [(84.3, y), (84.3, 68.5), (28.9, 68.5), (28.9, y2 + h2)],
        label="fitur + status",
        label_pos=(55.0, 68.8),
    )

    # serializer -> Claude, serializer -> OpenAI, template -> OpenAI
    panah(ax, [(21.2, y2), (21.2, y3 + h3)])
    panah(ax, [(38.0, y2), (38.0, 48.5), (52.75, 48.5), (52.75, y3 + h3)])
    panah(ax, [(84.3, y2), (84.3, 48.5), (61.0, 48.5), (61.0, y3 + h3)])
    ax.text(
        55.0,
        48.8,
        "konteks + template",
        fontsize=5.2,
        color=MUTED,
        style="italic",
        ha="center",
        va="bottom",
        bbox=dict(facecolor="white", edgecolor="none", pad=0.6),
        zorder=5,
    )

    # OpenAI -> validator -> operator
    panah(ax, [(x[1] + w, y3 + 5.9), (x[2], y3 + 5.9)])
    panah(
        ax,
        [(84.3, y3), (84.3, 27.4), (58.0, 27.4), (58.0, 22.0)],
        label="pesan tervalidasi",
        label_pos=(71.0, 27.7),
    )

    # Claude -> executive brief
    panah(ax, [(21.2, y3), (21.2, 22.0)], label="draf brief", label_pos=(22.6, 25.8))

    # operator -> dashboard dan PWA
    panah(ax, [(72.0, 19.5), (75.0, 19.5)])
    panah(ax, [(72.0, 12.4), (75.0, 12.4)], putus=True)

    # --- catatan bawah
    ax.add_patch(Rectangle((0, 0.6), 100, 6.6, facecolor=WARN_BG, edgecolor="none", zorder=0))
    ax.add_patch(Rectangle((0, 0.6), 1.1, 6.6, facecolor=HUMAN, edgecolor="none", zorder=1))
    ax.text(
        7.0,
        3.9,
        "Use case utama: BPBD/DSDA. Executive Brief untuk analis kebijakan; PWA untuk warga RW setelah "
        "snapshot disetujui operator.\nSI tidak menghitung debit dan tidak mengaktuasi pintu air. Angka "
        "dari model numerik; narasi dari SI.",
        fontsize=5.6,
        va="center",
        ha="left",
        linespacing=1.5,
        zorder=4,
    )

    fig.savefig(OUT / "arsitektur-sistem.png", dpi=300)
    plt.close(fig)


def gambar_pipeline():
    fig = plt.figure(figsize=(6.55, 2.15), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    ax.add_patch(Rectangle((0, 0), 100, 100, facecolor=BAND_B, edgecolor="none", zorder=0))
    ax.add_patch(Rectangle((0, 78), 100, 22, facecolor=BAND_A, edgecolor="none", zorder=0))
    ax.add_patch(Rectangle((0, 78), 1.1, 22, facecolor=SI, edgecolor="none", zorder=1))
    ax.text(4.0, 89, "PELATIHAN & PEMELIHARAAN MODEL SI  ·  di luar jam operasi", fontsize=5.7,
            fontweight="bold", color=SI, va="center", ha="left")
    ax.text(98.0, 89, "dilatih ulang tiap musim dan saat data bergeser", fontsize=5.1, color=MUTED,
            style="italic", va="center", ha="right")

    tahap = [
        ("Data & label", "Sentinel-2, AlphaEarth\nEmbedding, TMA historis;\nlabel lapangan minim"),
        ("Pelatihan", "Klasifikasi di atas\nembedding AlphaEarth;\ngradient boosting status"),
        ("Validasi", "Spatial split; overall\naccuracy, F1 per kelas,\nkappa, kalibrasi"),
        ("Registri model", "Versi, metrik, dan data\nlatih dicatat; hanya model\nlulus yang dipakai"),
        ("Inferensi", "LULC + imperviousness;\nstatus per node →\nLapisan 1"),
    ]
    w = 16.6
    h = 26.0
    y = 37.0
    gap = 3.0
    x0 = 2.5
    for i, (judul, isi) in enumerate(tahap):
        x = x0 + i * (w + gap)
        kotak(ax, x, y, w, h, judul, isi, SI if i in (1, 2, 4) else NUM, ukuran_judul=5.9, ukuran_isi=5.3)
        if i < len(tahap) - 1:
            panah(ax, [(x + w, y + h / 2), (x + w + gap, y + h / 2)])

    akhir = x0 + 4 * (w + gap) + w / 2
    panah(
        ax,
        [(akhir, y), (akhir, 26.0), (x0 + w / 2, 26.0), (x0 + w / 2, y)],
        putus=True,
        label="monitoring drift & evaluasi ulang",
        label_pos=(50.0, 28.6),
    )

    ax.text(98.0, 6.5, "Data uji tidak bersebelahan dengan data latih (spatial split).", fontsize=5.1,
            color=MUTED, va="center", ha="right", style="italic")

    fig.savefig(OUT / "pipeline-model-si.png", dpi=300)
    plt.close(fig)


if __name__ == "__main__":
    gambar_arsitektur()
    gambar_pipeline()
    for f in ("arsitektur-sistem.png", "pipeline-model-si.png"):
        print(OUT / f)
