# Requirement List — HydroTwin-AI (EWS & Simulator)

| Versi | 0.3 (draft) |
|---|---|
| Lingkup | **Early Warning System** (`/ops` operator + `/warga`) dan **Simulator** (`/rencana` perencana) |
| Pemilik | Tim SWE (Argo Nurcahyo, Yovi Maulana Nugraha) |
| Sumber | `proposal-hydrograph-ai-final.pdf`, `docs/analysis/glossary.md`, keputusan 18 November 2026 |

> Di luar lingkup dokumen ini: autentikasi/RBAC, pengiriman SMS/WhatsApp/push notification, integrasi broadcast BPBD, provider AI produksi, pemodelan hidrologi produksi (HEC-RAS/GNN), serta perluasan peta zonasi desa/GPS/offline yang diatur di `docs/plan/web-publik.md`. Data hasil simulasi pada prototipe berasal dari layanan mock dengan kontrak tetap.

## 1. Prioritas

- **M** = Must (wajib untuk MVP)
- **S** = Should (sebaiknya ada)
- **C** = Could (opsional)

## 2. Functional Requirements (FR)

### 2.1 Pemantauan & Peta — EWS Operator

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-01 | Peta interaktif menampilkan jaringan graf: node (pintu air, penampungan, sensor TMA) dan edge (segmen sungai) dari Katulampa/Depok sampai Jakarta. | M | Proposal §3 |
| FR-02 | Peta dapat ditampilkan dalam mode 2D dan mode 3D (3D memakai terrain bila tersedia, jika tidak, extrusion sederhana). | M | Proposal §3, keputusan 3D |
| FR-03 | Layer peta dapat diaktifkan atau dinonaktifkan: sungai, batas DAS, heatmap kelurahan, titik sensor. | S | Keputusan prototipe |
| FR-04 | Heatmap akumulasi risiko per kelurahan Jakarta dengan legenda tiga kategori (Aman, Waspada, Siaga). | M | Proposal MVP |
| FR-05 | Klik node atau segmen membuka panel detail (debit, TMA, C-value, status, sumber). | M | Proposal §3 |
| FR-06 | Layar menampilkan data pemantauan terakhir per node (TMA, debit) dengan timestamp WIB. | M | Proposal §3 |

### 2.2 Simulasi Operator — EWS

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-07 | Slider intensitas hujan (0–200 mm/jam) memperbarui peta, grafik, dan rekomendasi secara langsung. | M | Proposal MVP |
| FR-08 | Pilihan tingkat konversi lahan di Depok (0%, 10%, 20%, 30%) sebagai input skenario. | M | Proposal MVP |
| FR-09 | Tombol skenario cepat, misalnya "Hujan naik 20 mm/jam", yang menerapkan preset input. | S | Proposal §3 |
| FR-10 | Panel perbandingan baseline vs skenario, menampilkan selisih debit dan volume per segmen. | S | Masukan tim |
| FR-11 | Batas input (0–200 mm/jam, 0–30%) ditampilkan dengan jelas di kontrol. | M | Masukan tim |
| FR-12 | Simulasi dihitung ulang dengan debounce ≤ 300 ms setelah input berhenti berubah. | M | Keputusan NFR-01 |

### 2.3 Beban Debit & Proyeksi — EWS

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-13 | Grafik beban debit (m³/s) per segmen sungai dengan garis ambang siaga dan waspada. | M | Proposal §3 |
| FR-14 | Grafik proyeksi akumulasi volume air 3–6 jam ke depan, dengan pita confidence. | M | Proposal §3 |
| FR-15 | Pemutaran data historis banjir (kejadian 2020 dan 2021) dengan play, pause, dan scrub. | S | Proposal §5 Bulan 5 |

### 2.4 Rekomendasi Taktis & Responsible AI — EWS

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-20 | Panel rekomendasi taktis menampilkan narasi singkat untuk operator, misalnya "Buka Pintu Air Manggarai 15% dalam 45 menit". | M | Proposal MVP |
| FR-21 | Narasi dihasilkan lewat adapter LLM (mock pada prototipe). Jika timeout (5 detik) atau gagal, sistem beralih ke rule-based dan menampilkan badge sumber. | M | Proposal §6 |
| FR-22 | Setiap narasi dan proyeksi menampilkan confidence score (0–100%). | M | Proposal §6 |
| FR-23 | Jika confidence < 85%, tampilkan label "Memerlukan Konfirmasi Petugas Lapangan". | M | Proposal §6 |
| FR-24 | Operator memberi keputusan pada rekomendasi taktis: Diterima, Ditolak, atau Perlu Verifikasi. Sistem tidak menjalankan aksi fisik. | M | Proposal §6 (HITL) |
| FR-25 | Setiap keputusan operator dicatat di log audit (ID rekomendasi, keputusan, waktu WIB, nama operator sesuai sesi demo). | M | Masukan tim |
| FR-27 | Toggle developer untuk memaksa kegagalan LLM agar jalur fallback bisa didemokan. | S | Keputusan prototipe |

Catatan: keputusan pada FR-24 **tidak otomatis** menjadi persetujuan peringatan publik (lihat FR-34).

### 2.5 Peringatan Publik & Publikasi — EWS

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-26 | Pesan peringatan publik disusun AI per wilayah dari konteks hasil pemodelan. Operator meninjau, dapat menyunting, lalu menyiarkan atau menolak. Tidak ada pengiriman otomatis tanpa aksi operator. | M | Proposal MVP, keputusan 18 Nov 2026 |
| FR-34 | Peringatan hanya dapat dibaca warga setelah operator menyiarkannya. Halaman warga hanya menampilkan peringatan aktif untuk wilayah yang dipilih. | M | Keputusan EWS |
| FR-35 | Operator dapat menarik peringatan per wilayah. Setelah ditarik, peringatan langsung tidak tampil di halaman warga. | M | Keputusan EWS |
| FR-36 | Peringatan kedaluwarsa otomatis setelah 6 jam, atau saat digantikan siaran baru untuk wilayah yang sama. | M | Keputusan EWS |
| FR-37 | Setiap perubahan status peringatan (disusun, disunting, disiarkan, ditolak, ditarik, kedaluwarsa) tercatat di log audit. | M | NFR-11 |
| FR-38 | Kartu peringatan warga menampilkan level, estimasi tiba, puncak, langkah evakuasi, waktu siaran, dan sumber; kedalaman ditampilkan bila model menyediakannya. Tanpa peringatan aktif, tampil pesan resmi "belum ada peringatan". | M | FR-R6, keputusan EWS |

Aturan tambahan:

- Hanya level `waspada` dan `siaga` yang dapat disiarkan; level `aman` tidak di-blast.
- Satu wilayah hanya memiliki satu peringatan aktif.
- Teks AI asli dan teks final hasil suntingan operator disimpan terpisah.

### 2.6 Simulator — Perencana

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-39 | Simulator menyediakan registry parameter skenario (label, satuan, batas, langkah, default, tipe, bantuan) sehingga parameter baru dapat ditambahkan tanpa mengubah struktur panel. | M | Keputusan 18 Nov 2026 |
| FR-40 | Perubahan parameter memperbarui peta kedalaman per kelurahan dan panel dampak (luas genangan, RW terdampak, puncak, keyakinan) setelah input berhenti berubah. | M | Keputusan 18 Nov 2026 |
| FR-41 | Simulator menampilkan interpretasi AI atas hasil skenario dibanding baseline. Interpretasi dihasilkan otomatis setelah input berhenti berubah, dengan fallback template. | M | Keputusan 18 Nov 2026 |
| FR-42 | Perencana dapat menghasilkan Executive Brief on-demand. Brief memuat ringkasan skenario, dampak, opsi kebijakan, rekomendasi, dan batasan, serta dapat disalin atau diunduh sebagai Markdown. | M | Keputusan 18 Nov 2026 |
| FR-43 | Interpretasi dan Executive Brief menampilkan sumber (AI/template), model, waktu generasi, dan label "draf, menunggu tinjauan analis". | M | FR-R11 |

### 2.7 Transparansi & Status

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-28 | Layar status data menampilkan sumber setiap layer, waktu pembaruan terakhir, dan label status (`open_data`, `sintetis`, `mock`). | M | Proposal §4, masukan tim |
| FR-29 | Banner mode ("Mode Latihan" atau "Mode Operasional") selalu terlihat di header. | M | Masukan tim |
| FR-30 | Indikator status layanan (simulasi, LLM, data) dengan keadaan: normal, terdegradasi, gagal. | S | Masukan tim |

### 2.8 Umum

| ID | Requirement | Prioritas | Sumber |
|---|---|---|---|
| FR-31 | UI tersedia dalam English dan Bahasa Indonesia dengan pilihan bahasa yang tersimpan. Default demo: English. Angka mengikuti locale (`1,250.5` untuk EN, `1.250,5` untuk ID); waktu dalam WIB. | M | Proposal, keputusan bahasa |
| FR-32 | Disclaimer DSS tampil di dashboard: "Sistem ini alat bantu keputusan. Keputusan akhir ada pada petugas berwenang." | M | Proposal §6 |
| FR-33 | Semua state kosong, loading, dan error memiliki tampilan sendiri (O-08). | M | Masukan tim |

## 3. Non-Functional Requirements (NFR)

| ID | Kategori | Requirement | Ukuran |
|---|---|---|---|
| NFR-01 | Performa | Perubahan slider sampai peta dan grafik ter-update. | ≤ 300 ms pada laptop standar |
| NFR-02 | Performa | First contentful paint dashboard (build produksi). | ≤ 2 detik pada 4G |
| NFR-03 | Responsif | Layout operator desktop/tablet, halaman warga mobile-first. | Operator ≥ 768 px; warga 360–430 px |
| NFR-04 | Aksesibilitas | Mengikuti WCAG 2.1 AA. Status tidak hanya bergantung pada warna. | Kontras ≥ 4,5:1 untuk teks; fokus keyboard terlihat |
| NFR-05 | Keamanan | Tidak ada API key di kode client. | Diperiksa di review kode |
| NFR-06 | Privasi | Tidak ada data pribadi yang dikirim atau disimpan. Pemilihan wilayah warga tidak mengirim lokasi ke server. | Diperiksa di review kode |
| NFR-07 | Ketersediaan | Fitur utama tetap berjalan saat layanan LLM gagal atau data tidak tersedia. | Fallback aktif dalam ≤ 5 detik |
| NFR-08 | Maintainability | Logika simulasi dan publikasi dipisah dari komponen UI. | Diperiksa di review arsitektur |
| NFR-09 | Testabilitas | Fungsi perhitungan, transisi peringatan, dan gating wilayah memiliki unit test. Alur utama memiliki e2e test. | Cakupan unit ≥ 80% untuk modul simulasi dan peringatan |
| NFR-10 | Browser | Chrome, Edge, Firefox versi terbaru. | — |
| NFR-11 | Auditabilitas | Keputusan operator, perubahan status peringatan, dan pemanggilan LLM dapat ditelusuri. | Log tersedia dan dapat diekspor |
| NFR-12 | Keterbacaan | Angka dan status terbaca cepat di bawah tekanan. | Angka utama ≥ 24 px, status dengan ikon dan teks |
| NFR-13 | Konsistensi publikasi | Satu peringatan aktif per wilayah; perubahan siarkan/tarik tercermin di tab lain pada browser yang sama. | ≤ 1 detik setelah aksi |

## 4. Requirement Responsible AI (Wajib)

| ID | Requirement |
|---|---|
| FR-R1 | Human-in-the-loop: AI tidak pernah menjalankan aksi pada infrastruktur fisik (pintu air, pompa). |
| FR-R2 | Confidence < 85% selalu diberi label konfirmasi lapangan (FR-23). |
| FR-R3 | Fallback template/rule-based aktif otomatis saat LLM gagal pada semua task (rekomendasi, peringatan, interpretasi, brief). |
| FR-R4 | Setiap narasi AI (rekomendasi, peringatan, interpretasi, brief) menampilkan model, waktu generasi, dan ringkasan input. |
| FR-R5 | Angka dalam narasi harus berasal dari hasil simulasi. Angka yang tidak cocok ditolak dan memicu fallback. |
| FR-R6 | Teks peringatan publik tidak menimbulkan kepanikan. Gunakan level risiko dan langkah tindakan. |
| FR-R7 | API key LLM tidak boleh ada di browser. Produksi wajib lewat backend proxy. |
| FR-R8 | AI tidak menentukan level risiko banjir. Level berasal dari hasil pemodelan; AI hanya menyusun bahasa dari konteks terhitung. |
| FR-R9 | Operator dapat menyunting pesan peringatan sebelum disiarkan. Teks AI asli dan teks final tercatat di audit. |
| FR-R10 | Hanya peringatan yang disiarkan operator yang dapat diakses warga. Tidak ada jalur langsung dari simulasi ke warga. |
| FR-R11 | Interpretasi simulator dan Executive Brief adalah draf AI, bukan keputusan kebijakan. Label dan batasan model wajib tampil. |

## 5. Asumsi & Batasan

| # | Asumsi |
|---|---|
| A-01 | Hasil simulasi pada prototipe berasal dari layanan mock dengan kontrak yang sama dengan layanan nyata. |
| A-02 | LLM pada prototipe adalah mock dengan delay dan kegagalan acak yang dapat dikontrol. Provider nyata dapat dipasang lewat adapter. |
| A-03 | Data geometri (kelurahan, DAS, jaringan sungai) berasal dari SHP yang sudah dikonversi ke GeoJSON WGS84. |
| A-04 | Tidak ada autentikasi pada prototipe. Banner "Mode Latihan" menjelaskan hal ini. |
| A-05 | Koordinat pintu air dan TMA diverifikasi dengan sumber resmi sebelum demo final. |
| A-06 | Publikasi peringatan prototipe memakai localStorage dan BroadcastChannel; produksi memerlukan backend. |
| A-07 | "Siarkan" pada prototipe berarti publikasi ke feed peringatan publik, bukan SMS/WhatsApp/push notification. |
| A-08 | Peringatan aktif sampai ditarik, digantikan siaran baru, atau melewati TTL 6 jam. |
| A-09 | Daftar parameter simulator tambahan ditentukan pada fase F3; registry disiapkan tanpa mengarang parameter. |
| A-10 | Demo default English; Bahasa Indonesia tersedia lewat pemilih ID/EN. Nama tempat, instansi, dan istilah lokal dipertahankan. |

## 6. Traceability

Lihat `docs/analysis/traceability.md`.
