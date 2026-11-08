"""Mengisi templat proposal SI Bridges dengan konten HydroGraph-AI.

Jalankan dari root repo:
    python scripts/fill-proposal.py

Output:
    proposal-hydrograph-ai-final.docx
"""

from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
SUMBER = ROOT / "docs" / "references" / "templat-proposal.docx"
TUJUAN = ROOT / "proposal-hydrograph-ai-final.docx"
GAMBAR = ROOT / "docs" / "architecture" / "figures"
TANGKAPAN = ROOT / "docs" / "ui-prototype" / "screenshots"

HITAM = RGBColor(0x1A, 0x1A, 0x1A)
ABU = RGBColor(0x51, 0x60, 0x7A)
HIJAU = RGBColor(0x0F, 0x76, 0x6E)
PUTIH = RGBColor(0xFF, 0xFF, 0xFF)
UKURAN = Pt(10.2)


def bersihkan(par):
    for run in list(par.runs):
        run._element.getparent().remove(run._element)


def tulis(par, teks, tebal=False, ukuran=UKURAN):
    bersihkan(par)
    run = par.add_run(teks)
    run.bold = tebal
    run.italic = False
    run.font.size = ukuran
    run.font.color.rgb = HITAM
    par.alignment = WD_ALIGN_PARAGRAPH.LEFT
    par.paragraph_format.space_after = Pt(4)
    par.paragraph_format.space_before = Pt(0)
    par.paragraph_format.line_spacing = 1.06
    return par


def tulis_bullet(par, teks, ukuran=UKURAN):
    bersihkan(par)
    run = par.add_run("•  " + teks)
    run.font.size = ukuran
    run.font.color.rgb = HITAM
    par.alignment = WD_ALIGN_PARAGRAPH.LEFT
    par.paragraph_format.left_indent = Cm(0.5)
    par.paragraph_format.first_line_indent = Cm(-0.35)
    par.paragraph_format.space_after = Pt(2.5)
    par.paragraph_format.space_before = Pt(0)
    par.paragraph_format.line_spacing = 1.05
    return par


def sisip_setelah(par, teks, gaya=None, tebal=False, ukuran=UKURAN):
    baru = deepcopy(par._p)
    for anak in list(baru):
        if anak.tag.endswith("}r") or anak.tag.endswith("}hyperlink"):
            baru.remove(anak)
    par._p.addnext(baru)
    from docx.text.paragraph import Paragraph

    p = Paragraph(baru, par._parent)
    if gaya == "bullet":
        tulis_bullet(p, teks)
    else:
        if gaya:
            p.style = gaya
        tulis(p, teks, tebal=tebal, ukuran=ukuran)
    return p


def paragraf_berikut(par, daftar, gaya=None):
    sebelumnya = par
    for teks in daftar:
        sebelumnya = sisip_setelah(sebelumnya, teks, gaya=gaya)
    return sebelumnya


def isi_sel(sel, teks, tebal=False):
    sel.text = ""
    p = sel.paragraphs[0]
    run = p.add_run(teks)
    run.bold = tebal
    run.font.size = Pt(9)
    p.paragraph_format.space_after = Pt(0)


def tanpa_border(tabel):
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    borders = OxmlElement("w:tblBorders")
    for sisi in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{sisi}")
        el.set(qn("w:val"), "nil")
        borders.append(el)
    tabel._tbl.tblPr.append(borders)


def keterangan(par, teks):
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = par.add_run(teks)
    run.italic = True
    run.font.size = Pt(8.5)
    run.font.color.rgb = ABU
    par.paragraph_format.space_after = Pt(4)
    par.paragraph_format.space_before = Pt(2)


def sisip_gambar(doc, setelah, kiri, kanan, teks_keterangan):
    from docx.oxml import OxmlElement
    from docx.text.paragraph import Paragraph

    tabel = doc.add_table(rows=1, cols=2)
    tabel.autofit = False
    tanpa_border(tabel)
    for i, berkas in enumerate((kiri, kanan)):
        sel = tabel.rows[0].cells[i]
        sel.width = Cm(7.6)
        sel.text = ""
        par = sel.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.add_run().add_picture(str(berkas), width=Cm(6.9))
    setelah._p.addnext(tabel._tbl)

    elemen = OxmlElement("w:p")
    tabel._tbl.addnext(elemen)
    cap = Paragraph(elemen, setelah._parent)
    keterangan(cap, teks_keterangan)
    return cap


def cari_paragraf(doc, awalan):
    for par in doc.paragraphs:
        if par.text.strip().startswith(awalan):
            return par
    raise SystemExit(f"Paragraf panduan tidak ditemukan: {awalan}")


def sisip_gambar_tunggal(doc, setelah, berkas, lebar_cm, teks_keterangan):
    from docx.oxml import OxmlElement
    from docx.text.paragraph import Paragraph

    elemen = OxmlElement("w:p")
    setelah._p.addnext(elemen)
    par = Paragraph(elemen, setelah._parent)
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.add_run().add_picture(str(berkas), width=Cm(lebar_cm))
    par.paragraph_format.space_before = Pt(4)
    par.paragraph_format.space_after = Pt(0)

    cap_el = OxmlElement("w:p")
    elemen.addnext(cap_el)
    cap = Paragraph(cap_el, setelah._parent)
    keterangan(cap, teks_keterangan)
    return cap


def sisip_tabel(doc, setelah, judul, header, baris, lebar_cm):
    """Sisipkan tabel berketerangan, kembalikan paragraf kosong sesudahnya."""
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.text.paragraph import Paragraph

    cap_el = OxmlElement("w:p")
    setelah._p.addnext(cap_el)
    cap = Paragraph(cap_el, setelah._parent)
    cap.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = cap.add_run(judul)
    run.italic = True
    run.font.size = Pt(8.5)
    run.font.color.rgb = ABU
    cap.paragraph_format.space_before = Pt(6)
    cap.paragraph_format.space_after = Pt(2)

    tabel = doc.add_table(rows=1 + len(baris), cols=len(header))
    tabel.autofit = False
    tabel.allow_autofit = False

    borders = OxmlElement("w:tblBorders")
    for sisi in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{sisi}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "CBD5E1")
        borders.append(el)
    tabel._tbl.tblPr.append(borders)

    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tabel._tbl.tblPr.append(layout)

    def isi(sel, teks, tebal=False, warna=HITAM, latar=None, lebar=None):
        sel.width = Cm(lebar)
        sel.text = ""
        if latar:
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"), "clear")
            shd.set(qn("w:fill"), latar)
            sel._tc.get_or_add_tcPr().append(shd)
        p = sel.paragraphs[0]
        run = p.add_run(teks)
        run.bold = tebal
        run.font.size = Pt(7.8)
        run.font.color.rgb = warna
        p.paragraph_format.space_after = Pt(1.2)
        p.paragraph_format.space_before = Pt(1.2)
        p.paragraph_format.line_spacing = 1.0

    tr_pr = tabel.rows[0]._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tr_pr.append(tbl_header)
    for i, teks in enumerate(header):
        isi(tabel.rows[0].cells[i], teks, tebal=True, warna=PUTIH, latar="0F766E", lebar=lebar_cm[i])

    for r, data in enumerate(baris, start=1):
        for i, teks in enumerate(data):
            isi(tabel.rows[r].cells[i], teks, lebar=lebar_cm[i])

    for i, lebar in enumerate(lebar_cm):
        tabel.columns[i].width = Cm(lebar)

    cap._p.addnext(tabel._tbl)

    elemen = OxmlElement("w:p")
    tabel._tbl.addnext(elemen)
    anchor = Paragraph(elemen, setelah._parent)
    anchor.paragraph_format.space_after = Pt(0)
    anchor.paragraph_format.space_before = Pt(0)
    for run in anchor.runs:
        run.font.size = Pt(1)
    return anchor


def tambah_nomor_halaman(doc):
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    def medan(induk, instruksi):
        fld = OxmlElement("w:fldSimple")
        fld.set(qn("w:instr"), instruksi)
        r = OxmlElement("w:r")
        rpr = OxmlElement("w:rPr")
        warna = OxmlElement("w:color")
        warna.set(qn("w:val"), "51607A")
        rpr.append(warna)
        sz = OxmlElement("w:sz")
        sz.set(qn("w:val"), "15")
        rpr.append(sz)
        r.append(rpr)
        t = OxmlElement("w:t")
        t.text = "1"
        r.append(t)
        fld.append(r)
        induk.append(fld)

    for section in doc.sections:
        p = section.footer.paragraphs[0]
        p.text = ""
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        awal = p.add_run("HydroGraph-AI · HydroAI Labs — halaman ")
        awal.font.size = Pt(7.5)
        awal.font.color.rgb = ABU
        medan(p._p, "PAGE")
        tengah = p.add_run(" dari ")
        tengah.font.size = Pt(7.5)
        tengah.font.color.rgb = ABU
        medan(p._p, "NUMPAGES")


def main() -> None:
    doc = Document(SUMBER)

    # Header dokumen
    kepala = doc.paragraphs[0]
    if kepala.runs:
        kepala.runs[0].text = "SI BRIDGES INDONESIA — PROPOSAL MAHASISWA / STUDENT PROPOSAL"

    # Judul
    doc.paragraphs[1].text = (
        "HydroGraph-AI: Super Intelligence untuk Peringatan Dini dan Simulasi Limpasan Mikro "
        "Koridor Ciliwung (Depok–Jakarta)"
    )
    for run in doc.paragraphs[1].runs:
        run.font.size = Pt(15)

    # Hapus teks panduan di bawah judul dan panduan bagian 1
    for awalan in ("Maksimal lima halaman", "Isi satu baris per anggota"):
        par = cari_paragraf(doc, awalan)
        par._p.getparent().remove(par._p)

    # Tabel identitas
    tabel = doc.tables[0]
    isi_sel(tabel.rows[0].cells[1], "HydroAI Labs")
    isi_sel(tabel.rows[3].cells[1], "Argo Nurcahyo — (lengkapi alamat email)")

    # Tabel anggota
    anggota = doc.tables[1]
    data = [
        ("Argo Nurcahyo", "Institut Teknologi Bandung", "2026", "Project Lead & QA; Visual & UI/UX Designer"),
        ("Yovi Maulana Nugraha", "Institut Teknologi Bandung", "2026", "Frontend Engineer & System Architect"),
        ("Jhonathan Putro Siahaan", "Institut Teknologi Bandung", "2026", "AI & Spatial Data Engineer"),
        ("Eka Miftakhul Rachmawati", "Institut Teknologi Bandung", "2026", "GIS & Data Engineer"),
        ("Meidiana Rahmawati", "Institut Teknologi Bandung", "2026", "AI/LLM Evaluation & Data Analyst"),
    ]
    for i, (nama, kampus, tahun, peran) in enumerate(data, start=1):
        baris = anggota.rows[i]
        isi_sel(baris.cells[1], nama)
        isi_sel(baris.cells[2], kampus)
        isi_sel(baris.cells[3], tahun)
        isi_sel(baris.cells[4], peran)
    anggota._tbl.remove(anggota.rows[6]._tr)

    # 2. Topik dan masalah
    p = cari_paragraf(doc, "Topik yang kalian pilih")
    tulis(
        p,
        "Banjir perkotaan dan dinamika daerah aliran sungai di Sub-DAS Ciliwung Hulu–Tengah, "
        "koridor lintas Depok–Jakarta. Perubahan tutupan dan penggunaan lahan (LULC) yang masif "
        "menaikkan koefisien limpasan dan memperpendek waktu konsentrasi (Son et al., 2023; "
        "He & Chen, 2024).",
    )
    q = sisip_setelah(
        p,
        "Peringatan banjir Jakarta masih bergantung pada indikator manual tinggi muka air (TMA) "
        "di Pintu Air Katulampa dan Depok. Pendekatan titik tunggal tidak menangkap akumulasi "
        "limpasan spasial non-linear saat hujan ekstrem lokal (Ye et al., 2021; Pham et al., 2021), "
        "sehingga lead time mitigasi di Bidara Cina, Kampung Melayu, dan Cawang sering kurang dari "
        "2 jam (Sohn & Kotval-Karamchandani, 2023).",
    )
    sisip_setelah(
        q,
        "Yang terdampak: warga bantaran 237 desa di empat kota/kabupaten koridor yang kesulitan "
        "mengevakuasi barang dan keluarga; serta petugas BPBD dan DSDA yang harus memperkirakan "
        "dampak limpasan sebelum air mencapai pintu penampungan.",
    )

    # 3. Ide
    p = cari_paragraf(doc, "Bagaimana SI membantu")
    tulis(
        p,
        "HydroGraph-AI adalah Super Intelligence (SI) pendukung keputusan banjir untuk koridor "
        "Ciliwung Depok–Jakarta. Prinsipnya tegas: SI tidak menggantikan model hidrologi. Model SI "
        "mengklasifikasi tutupan lahan dan status siaga, menalar di atas hasil hitungan, lalu "
        "menarasikan rekomendasi; angka debit dan waktu tiba tetap berasal dari model numerik yang "
        "dapat diperiksa ulang (Tong et al., 2026).",
    )
    q = sisip_setelah(p, "Arsitektur SI berlapis (Gambar 1):")
    akhir_lapisan = paragraf_berikut(
        q,
        [
            "Lapisan 1 — Persepsi dan analitik. Random Forest mengklasifikasi tutupan lahan "
            "Sentinel-2 menjadi koefisien limpasan C per sub-DAS; XGBoost mengklasifikasi "
            "status siaga dari TMA, tren, hujan, dan debit; graph engine deterministik "
            "mempropagasi debit pada graf pintu air–segmen dengan Q = 0,00278·C·I·A dan lag routing.",
            "Lapisan 2 — Konteks dan penalaran. Serializer mengubah hasil graph dan fitur lahan "
            "menjadi skema JSON tetap. Gemini (Google, Amerika Serikat) hanya membaca konteks ini: "
            "tidak menerima data mentah dan tidak menghitung debit.",
            "Lapisan 3 — Generasi dan antarmuka. Gemini menyusun narasi dan draf peringatan; "
            "validator mencocokkan setiap angka dengan hasil simulasi; fallback aturan hidrologi "
            "menjaga respons di bawah 5 detik bila API gagal. Operator BPBD/DSDA menerima atau "
            "menolak, lalu snapshot yang disetujui tayang di web publik.",
        ],
        gaya="bullet",
    )

    akhir_lapisan = sisip_setelah(
        akhir_lapisan,
        "Tabel 1 merinci peran, masukan, keluaran, dan metrik tiap komponen; Gambar 2 menunjukkan "
        "pipeline pelatihannya.",
    )
    akhir_lapisan.paragraph_format.space_before = Pt(5)

    cap1 = sisip_gambar_tunggal(
        doc,
        akhir_lapisan,
        GAMBAR / "arsitektur-sistem.png",
        16.2,
        "Gambar 1. Arsitektur SI tiga lapisan: persepsi, penalaran, generasi. Hijau = komponen SI, "
        "abu-abu = model numerik, oranye = keputusan manusia, biru = antarmuka.",
    )

    anchor = sisip_tabel(
        doc,
        cap1,
        "Tabel 1. Komponen SI, peran, keluaran, dan metrik evaluasi.",
        ["Komponen", "Peran SI", "Masukan → keluaran", "Metrik evaluasi"],
        [
            ("Random Forest (GEE)", "Klasifikasi tutupan lahan per sub-DAS",
             "Sentinel-2 → C per segmen", "Overall accuracy, F1 per kelas, kappa; spatial split"),
            ("XGBoost (status siaga)", "Klasifikasi status siaga per node",
             "TMA, hujan, tren, debit → kelas + probabilitas", "F1 kelas siaga, Brier score, kalibrasi"),
            ("Gemini (Google, AS)", "Penalaran skenario dan narasi",
             "JSON konteks → rekomendasi + draf", "50 skenario uji; 100% angka bersumber"),
            ("Validator + fallback", "Penjaga keluaran dan ketersediaan",
             "Narasi + simulasi → lulus / tolak", "0 angka tanpa sumber; respons < 5 detik"),
            ("Graph engine (bukan SI)", "Propagasi debit dan waktu tiba",
             "C, hujan, geometri → Q, waktu tiba", "Selisih terhadap TMA historis"),
        ],
        [3.7, 3.9, 4.6, 4.4],
    )

    q = sisip_setelah(
        anchor,
        "Model SI dari perusahaan Amerika Serikat: Gemini (Google) untuk penalaran dan narasi, "
        "dengan OpenAI GPT-4o sebagai pembanding pada 50 skenario yang sama untuk mengukur "
        "konsistensi dan kepatuhan angka. Random Forest dan XGBoost adalah model yang kami latih "
        "sendiri; Google Earth Engine adalah platform komputasi spasial, bukan model SI. Versi "
        "Gemini dikunci saat implementasi dan dievaluasi ulang tiap Gate.",
    )

    cap2 = sisip_gambar_tunggal(
        doc,
        q,
        GAMBAR / "pipeline-model-si.png",
        16.2,
        "Gambar 2. Pipeline pemodelan SI: data dan label, pelatihan, validasi spasial, registri "
        "model, dan inferensi ke Lapisan 1.",
    )

    q = sisip_setelah(cap2, "Yang dilihat pengguna:")
    q.paragraph_format.space_before = Pt(3)
    paragraf_berikut(
        q,
        [
            "Dashboard operator: peta 2D/3D, debit per segmen, proyeksi 3–6 jam, slider hujan dan "
            "konversi lahan, rekomendasi bertanda sumber, serta log audit.",
            "Web publik: zona hijau/kuning/merah per desa, estimasi waktu tiba, dan langkah "
            "evakuasi; hanya tayang setelah operator menerbitkan snapshot.",
        ],
        gaya="bullet",
    )

    # 4. Data
    p = cari_paragraf(doc, "Data yang dibutuhkan")
    tulis(p, "Seluruh data publik, berizin mitra, atau sintetis; tidak ada data pribadi.")
    paragraf_berikut(
        p,
        [
            "Citra Sentinel-2 (10 m) dan Landsat 8/9 — Copernicus dan Google Earth Engine — publik.",
            "DEMNAS ±8 m — Badan Informasi Geospasial — publik.",
            "TMA Katulampa, Depok, dan Manggarai — publik; akan diambil melalui scraping dan permintaan "
            "resmi ke DSDA, dengan atribusi sumber.",
            "Curah hujan dan prakiraan BMKG, serta CHIRPS — publik.",
            "Batas desa (BPS), jaringan sungai, dan batas DAS — BIG dan OpenStreetMap (ODbL) — publik.",
            "Baseline tutupan lahan: Dynamic World (WRI–Google, 10 m) dan ESA WorldCover 2021 "
            "(CC-BY-4.0) — publik, dipakai sebagai pembanding model kami.",
            "Label LULC manual dan data hidrodinamik sintetis (Rational Method) — milik tim dan sintetis.",
        ],
        gaya="bullet",
    )

    # 5. Rencana
    p = cari_paragraf(doc, "Apa yang akan dibangun")
    tulis(
        p,
        "Lima bulan (Desember 2026–April 2027) mengikuti Gate I–V; setiap gate menghasilkan satu "
        "komponen SI yang teruji.",
    )
    akhir_rencana = paragraf_berikut(
        p,
        [
            "Bulan 1 (Gate I): data dan label. Scraping TMA, ingest DEMNAS dan Sentinel-2, pembuatan "
            "label LULC, validasi cakupan 237 desa.",
            "Bulan 2 (Gate II): prototipe minimum. Random Forest LULC dan graph engine berjalan; "
            "C per segmen dihitung dari citra, bukan tabel tetap.",
            "Bulan 3 (Gate III): model status dan LLM. Gradient boosting status siaga, Gemini API, "
            "serializer JSON, dan validator angka; uji 50 skenario dan presentasi tengah program.",
            "Bulan 4 (Gate IV): produk dan tata kelola. Dashboard operator dan web publik; tinjauan "
            "penggunaan SI yang bertanggung jawab; evaluasi performa per wilayah.",
            "Bulan 5 (Gate V): validasi dan finalisasi. Bandingkan dengan kejadian banjir 2020/2021 "
            "dan TMA historis; kalibrasi; siapkan showcase 24 April 2027.",
            "MVP: aplikasi web interaktif koridor Ciliwung. Saat slider hujan atau konversi lahan "
            "digeser, sistem menampilkan heatmap risiko per segmen, narasi rekomendasi taktis, dan "
            "contoh peringatan untuk warga.",
            "Progres awal: prototipe dashboard sudah berjalan dengan peta 2D/3D, simulasi debit, "
            "rekomendasi dengan fallback rule-based, keputusan operator, dan draf peringatan publik.",
        ],
        gaya="bullet",
    )
    sisip_gambar(
        doc,
        akhir_rencana,
        TANGKAPAN / "03-panel-peta.png",
        TANGKAPAN / "10-mode-3d.png",
        "Gambar 3. Prototipe dashboard: peta zonasi 2D dan mode 3D dengan terrain DEMNAS (data mock).",
    )

    # 6. Responsible use
    p = cari_paragraf(doc, "Apa yang bisa salah")
    tulis(
        p,
        "Yang paling dirugikan bila sistem salah: warga bantaran yang salah membaca tingkat bahaya, "
        "dan petugas yang mengambil keputusan dari narasi keliru. Risiko utama dan mitigasinya, per "
        "komponen:",
    )
    akhir_tanggung_jawab = paragraf_berikut(
        p,
        [
            "Salah klasifikasi LULC: area terbangun tertukar dengan lahan terbuka, sehingga C terlalu "
            "rendah. Mitigasi: spatial split, laporkan F1 per kelas, tandai segmen dengan keyakinan "
            "rendah, dan bandingkan dengan Dynamic World.",
            "Model status meleset: probabilitas yang tidak terkalibrasi memicu peringatan salah. "
            "Mitigasi: kalibrasi dan Brier score, tampilkan TMA mentah di samping prediksi, dan jangan "
            "pernah mengaktuasi pintu air atau pompa.",
            "Halusinasi LLM: narasi menyebut angka atau lokasi yang tidak ada. Mitigasi: validator "
            "mencocokkan setiap angka dengan hasil simulasi; narasi yang gagal ditolak, bukan "
            "ditampilkan.",
            "False alarm dan kepanikan: peringatan terlalu sensitif menimbulkan kecemasan. Mitigasi: "
            "bahasa tenang berbasis level, draf tidak dikirim otomatis, publikasi hanya setelah "
            "operator menerima.",
            "Ketergantungan API dan bias data: gangguan cloud saat badai, dan desa yang jarang "
            "tergenang kurang terwakili. Mitigasi: fallback aturan di bawah 5 detik, evaluasi per "
            "kota, dan warga bantaran dilibatkan saat uji coba.",
        ],
        gaya="bullet",
    )

    # 7. Kenapa tim
    p = cari_paragraf(doc, "Keterampilan yang dimiliki tim")
    tulis(
        p,
        "Keterampilan tim: Random Forest dan XGBoost (scikit-learn), klasifikasi citra di "
        "Google Earth Engine, validasi spasial, integrasi API Gemini dan evaluasi LLM, GIS (GeoPandas, "
        "PostGIS, MapLibre), serta desain antarmuka kebencanaan.",
    )
    q = sisip_setelah(
        p,
        "Yang masih perlu dipelajari: hidrodinamika mikro sungai Jakarta, parameter operasional pintu "
        "air dan pompa DSDA, serta kualitas label LULC di kawasan padat.",
    )
    sisip_setelah(
        q,
        "Alasan ikut: sebagai mahasiswa Magister Informatika ITB, kami ingin membuktikan bahwa riset "
        "computational informatics dan foundation model tidak berhenti sebagai karya akademis, tetapi "
        "dapat diimplementasikan untuk masalah banjir Jakarta.",
    )

    doc.core_properties.title = (
        "HydroGraph-AI: Super Intelligence untuk Peringatan Dini Limpasan Mikro Koridor Ciliwung"
    )
    doc.core_properties.author = "HydroAI Labs"
    doc.core_properties.subject = "Proposal SI Bridges Indonesia"
    doc.core_properties.keywords = (
        "banjir, Ciliwung, super intelligence, random forest, gradient boosting, Gemini, GIS"
    )

    tambah_nomor_halaman(doc)

    doc.save(TUJUAN)
    print(f"tersimpan: {TUJUAN}")


if __name__ == "__main__":
    main()
