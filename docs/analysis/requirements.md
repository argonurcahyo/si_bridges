# Requirement List — Dashboard Operasional HydroGraph-AI

| Versi | 0.1 (draft) |
|---|---|
| Lingkup | Dashboard Operasional (`/ops`) untuk petugas BPBD dan DSDA DKI Jakarta |
| Pemilik | Tim SWE (Argo Nurcahyo, Yovi Maulana Nugraha) |
| Sumber | `proposal-banjir-hydrograph-ai-v2.docx`, `docs/analysis/glossary.md` |

> Di luar lingkup dokumen ini: web publik (masyarakat), halaman tentang & sumber data, pemodelan hidrologi (kalibrasi, Manning penuh, pipeline GEE). Data hasil simulasi pada tahap prototipe berasal dari layanan mock dengan kontrak tetap.

## 1. Prioritas

- **M** = Must (wajib untuk MVP)
- **S** = Should (sebaiknya ada)
- **C** = Could (opsional)

## 2. Functional Requirements (FR)

### 2.1 Pemantauan & Peta

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-01 | Peta interaktif menampilkan jaringan graf: node (pintu air, penampungan, sensor TMA) dan edge (segmen sungai) dari Katulampa/Depok sampai Jakarta. | M | Proposal §3 |
| FR-02 | Peta dapat ditampilkan dalam mode 2D dan mode 3D (3D memakai terrain bila tersedia, jika tidak, extrusion sederhana). | M | Proposal §3, keputusan 3D |
| FR-03 | Layer peta dapat diaktifkan atau dinonaktifkan: sungai, batas DAS, heatmap kelurahan, titik sensor. | S | Keputusan prototipe |
| FR-04 | Heatmap akumulasi risiko per kelurahan Jakarta dengan legenda tiga kategori (Aman, Waspada, Siaga). | M | Proposal MVP |
| FR-05 | Klik node atau segmen membuka panel detail (debit, TMA, C-value, status, sumber). | M | Proposal §3 |
| FR-06 | Layar menampilkan data pemantauan terakhir per node (TMA, debit) dengan timestamp WIB. | M | Proposal §3 |

### 2.2 Simulasi

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-07 | Slider intensitas hujan (0–200 mm/jam) memperbarui peta, grafik, dan rekomendasi secara langsung. | M | Proposal MVP |
| FR-08 | Pilihan tingkat konversi lahan di Depok (0%, 10%, 20%, 30%) sebagai input skenario. | M | Proposal MVP |
| FR-09 | Tombol skenario cepat, misalnya "Hujan naik 20 mm/jam", yang menerapkan preset input. | S | Proposal §3 |
| FR-10 | Panel perbandingan baseline vs skenario, menampilkan selisih debit dan volume per segmen. | S | Masukan tim |
| FR-11 | Batas input (0–200 mm/jam, 0–30%) ditampilkan dengan jelas di kontrol. | M | Masukan tim |
| FR-12 | Simulasi dihitung ulang dengan debounce ≤ 300 ms setelah input berhenti berubah. | M | Keputusan NFR-01 |

### 2.3 Beban Debit & Proyeksi

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-13 | Grafik beban debit (m³/s) per segmen sungai dengan garis ambang siaga dan waspada. | M | Proposal §3 |
| FR-14 | Grafik proyeksi akumulasi volume air 3–6 jam ke depan, dengan pita confidence. | M | Proposal §3 |
| FR-15 | Pemutaran data historis banjir (kejadian 2020 dan 2021) dengan play, pause, dan scrub. | S | Proposal §5 Bulan 5 |

### 2.4 Rekomendasi & Responsible AI

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-20 | Panel rekomendasi taktis menampilkan narasi singkat untuk operator, misalnya "Buka Pintu Air Manggarai 15% dalam 45 menit". | M | Proposal MVP |
| FR-21 | Narasi dihasilkan lewat adapter LLM (mock pada prototipe). Jika timeout (5 detik) atau gagal, sistem beralih ke rule-based dan menampilkan badge sumber. | M | Proposal §6 |
| FR-22 | Setiap narasi dan proyeksi menampilkan confidence score (0–100%). | M | Proposal §6 |
| FR-23 | Jika confidence < 85%, tampilkan label "Memerlukan Konfirmasi Petugas Lapangan". | M | Proposal §6 |
| FR-24 | Operator memberi keputusan pada rekomendasi: Diterima, Ditolak, atau Perlu Verifikasi. Sistem tidak menjalankan aksi fisik. | M | Proposal §6 (HITL) |
| FR-25 | Setiap keputusan operator dicatat di log audit (ID rekomendasi, keputusan, waktu WIB, nama operator sesuai sesi demo). | M | Masukan tim |
| FR-26 | Draf peringatan publik (teks notifikasi) dapat ditinjau dan disalin oleh operator. Tidak ada pengiriman otomatis. | M | Proposal MVP, masukan tim |
| FR-27 | Toggle developer untuk memaksa kegagalan LLM agar jalur fallback bisa didemokan. | S | Keputusan prototipe |

### 2.5 Transparansi & Status

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-28 | Layar status data menampilkan sumber setiap layer, waktu pembaruan terakhir, dan label status (`open_data`, `sintetis`, `mock`). | M | Proposal §4, masukan tim |
| FR-29 | Banner mode ("Mode Latihan" atau "Mode Operasional") selalu terlihat di header. | M | Masukan tim |
| FR-30 | Indikator status layanan (simulasi, LLM, data) dengan keadaan: normal, terdegradasi, gagal. | S | Masukan tim |

### 2.6 Umum

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-31 | Seluruh teks UI dalam Bahasa Indonesia, angka dengan format Indonesia (`1.250,5`), waktu dalam WIB. | M | Proposal, keputusan bahasa |
| FR-32 | Disclaimer DSS tampil di dashboard: "Sistem ini alat bantu keputusan. Keputusan akhir ada pada petugas berwenang." | M | Proposal §6 |
| FR-33 | Semua state kosong, loading, dan error memiliki tampilan sendiri (O-08). | M | Masukan tim |

## 3. Non-Functional Requirements (NFR)

| ID | Kategori | Requirement | Ukuran |
|---|---|---|---|
| NFR-01 | Performa | Perubahan slider sampai peta dan grafik ter-update. | ≤ 300 ms pada laptop standar |
| NFR-02 | Performa | First contentful paint dashboard (build produksi). | ≤ 2 detik pada 4G |
| NFR-03 | Responsif | Layout utama desktop; tablet dapat dipakai. | Desktop ≥ 1280 px utama; tablet 768 px didukung |
| NFR-04 | Aksesibilitas | Mengikuti WCAG 2.1 AA. Status tidak hanya bergantung pada warna. | Kontras ≥ 4,5:1 untuk teks; fokus keyboard terlihat |
| NFR-05 | Keamanan | Tidak ada API key di kode client. | Diperiksa di review kode |
| NFR-06 | Privasi | Tidak ada data pribadi yang dikirim atau disimpan. | Lokasi pengguna tidak dipakai di dashboard |
| NFR-07 | Ketersediaan | Fitur utama tetap berjalan saat layanan LLM gagal atau data tidak tersedia. | Fallback aktif dalam ≤ 5 detik |
| NFR-08 | Maintainability | Logika simulasi dipisah dari komponen UI. | Diperiksa di review arsitektur |
| NFR-09 | Testabilitas | Fungsi perhitungan memiliki unit test. Alur utama memiliki e2e test. | Cakupan unit ≥ 80% untuk modul simulasi |
| NFR-10 | Browser | Chrome, Edge, Firefox versi terbaru. | — |
| NFR-11 | Auditabilitas | Keputusan operator dan pemanggilan LLM dapat ditelusuri. | Log tersedia dan dapat diekspor |
| NFR-12 | Keterbacaan | Angka dan status terbaca cepat di bawah tekanan. | Angka utama ≥ 24 px, status dengan ikon dan teks |

## 4. Requirement Responsible AI (Wajib)

| ID | Requirement |
|---|---|
| FR-R1 | Human-in-the-loop: AI tidak pernah menjalankan aksi pada infrastruktur fisik (pintu air, pompa). |
| FR-R2 | Confidence < 85% selalu diberi label konfirmasi lapangan (FR-23). |
| FR-R3 | Rule-based fallback aktif otomatis saat LLM gagal (FR-21). |
| FR-R4 | Setiap narasi AI menampilkan model, waktu generasi, dan ringkasan input. |
| FR-R5 | Angka dalam narasi harus berasal dari hasil simulasi. Angka yang tidak cocok ditolak dan memicu fallback. |
| FR-R6 | Teks peringatan publik tidak menimbulkan kepanikan. Gunakan level risiko dan langkah tindakan. |
| FR-R7 | API key LLM tidak boleh ada di browser. Produksi wajib lewat backend proxy. |

## 5. Asumsi & Batasan

| # | Asumsi |
|---|---|
| A-01 | Hasil simulasi pada prototipe berasal dari layanan mock dengan kontrak yang sama dengan layanan nyata. |
| A-02 | LLM pada prototipe adalah mock dengan delay dan kegagalan acak yang dapat dikontrol. |
| A-03 | Data geometri (kelurahan, DAS, jaringan sungai) berasal dari SHP yang sudah dikonversi ke GeoJSON WGS84. |
| A-04 | Tidak ada autentikasi pada prototipe. Banner "Mode Latihan" menjelaskan hal ini. |
| A-05 | Koordinat pintu air dan TMA diverifikasi dengan sumber resmi sebelum demo final. |

## 6. Traceability

Lihat `docs/analysis/traceability.md`.
