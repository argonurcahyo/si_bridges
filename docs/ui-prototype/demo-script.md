# Skrip Demo — HydroTwin-AI (EWS & Simulator, 7–8 menit)

Target penonton: juri SI Bridges, petugas BPBD/DSDA, dan tim. Semua data pada demo adalah **mock** dan ditandai di layar.

Catatan: skrip ini mencakup F1–F6. UI default English untuk juri internasional; gunakan tombol ID/EN di header atau halaman warga untuk berganti bahasa. Semua fitur pada skrip sudah aktif dengan provider AI mock.

## Persiapan

- [ ] Prototipe berjalan di browser (Chrome, layar 1440 px).
- [ ] Toggle "paksa gagal LLM" dalam keadaan mati di awal.
- [ ] Skenario operator di-reset ke baseline; log keputusan kosong.
- [ ] Tidak ada peringatan aktif di `/warga` sebelum demo.
- [ ] Simulator di `/rencana` memakai baseline.

## Urutan

| Menit | Langkah | Yang ditunjukkan | Catatan untuk presenter |
|---|---|---|---|
| 0:00 | Buka `/ops` | Banner MODE LATIHAN, peta koridor | "Ini data mock. Banner ini tidak boleh dihapus." |
| 0:30 | Tunjuk node dan edge | Warna node, ukuran edge sesuai debit | Node = pintu air, edge = segmen sungai |
| 1:00 | Geser slider ke 80 mm/jam | Peta dan grafik berubah | Tekankan respons cepat |
| 1:30 | Baca rekomendasi (O-04) | Narasi, badge sumber, confidence | "AI hanya memberi saran." |
| 2:00 | Aktifkan "paksa gagal LLM" lalu geser slider | Fallback otomatis ke template | **Momen kunci.** Dashboard tidak kosong |
| 2:30 | Matikan paksa gagal, buka O-06 | Pesan peringatan AI per wilayah | "Pesan disusun AI dari angka model, dengan validator dan fallback." |
| 3:00 | Sunting teks peringatan | Teks final berbeda dari teks AI asli | "Operator tetap penentu akhir." |
| 3:15 | Tekan **Siarkan** untuk satu wilayah | Status berubah menjadi disiarkan | "Hanya peringatan ini yang akan dilihat warga." |
| 3:45 | Buka `/warga` di tab lain | Kartu peringatan wilayah tersebut | "Warga tidak pernah melihat simulasi mentah." |
| 4:00 | Pilih wilayah lain di `/warga` | Tidak ada peringatan untuk wilayah itu | "Publikasi per wilayah, bukan global." |
| 4:15 | Kembali ke O-06, tekan **Tarik** | Peringatan hilang dari `/warga` | "Operator bisa menarik informasi yang sudah tidak berlaku." |
| 4:30 | Buka log audit | Entri sunting, siarkan, tarik dengan waktu WIB | "Semua keputusan dapat ditelusuri." |
| 5:00 | Buka `/rencana` | Parameter, heatmap, dampak | "Ini use case Simulator untuk perencana." |
| 5:30 | Ubah hujan/pasang/RTH | Peta, dampak, dan interpretasi berubah | Tunjukkan interpretasi otomatis |
| 6:15 | Tunjuk interpretasi AI | Sumber, model, batasan model mock | "AI membantu membaca trade-off, bukan memutuskan." |
| 6:45 | Tekan **Generate brief** | Executive Brief tampil | "Brief adalah draf untuk analis." |
| 7:15 | Salin / unduh Markdown | File atau clipboard berisi brief | "Bisa dibawa ke perancangan kebijakan." |
| 7:45 | Tutup dengan disclaimer | Footer DSS | "Keputusan akhir ada pada manusia." |

## Pertanyaan yang Mungkin Muncul

| Pertanyaan | Jawaban singkat |
|---|---|
| Apakah ini model hidrologi asli? | Belum. Ini prototipe dengan layanan simulasi mock. Kontraknya sama dengan model yang akan dipasang. |
| Bagaimana kalau AI salah? | Ada confidence, validasi angka, fallback, dan tinjauan manusia. AI tidak menjalankan aksi. |
| Apakah warga menerima notifikasi otomatis? | Tidak otomatis. Warga hanya menerima peringatan yang disiarkan operator. |
| Apakah pesan AI bisa diedit? | Ya. Teks AI asli dan teks final sama-sama disimpan untuk audit. |
| Apakah satu peringatan berlaku untuk semua wilayah? | Tidak. Publikasi per wilayah; satu wilayah punya satu peringatan aktif. |
| Apakah brief langsung menjadi kebijakan? | Tidak. Brief adalah draf AI dengan batasan model, untuk ditinjau analis. |
| Apakah data ini nyata? | Belum. Semua ditandai mock. Sumber nyata dihubungkan pada tahap berikutnya. |
| Bagaimana jika LLM tidak tersedia saat banjir? | Fallback template aktif dalam ≤ 5 detik. |

## Jika Ada Masalah Saat Demo

| Masalah | Tindakan |
|---|---|
| Peta lambat | Matikan layer heatmap, lanjut ke grafik |
| Mode 3D gagal | Kembali ke 2D, jelaskan bahwa 3D masih dalam pengembangan |
| LLM terlalu cepat dan fallback tidak terlihat | Aktifkan "paksa gagal" sebelum mengubah input |
| Halaman warga tidak berubah | Pastikan tab berada di browser yang sama dan peringatan berstatus disiarkan |
| Koneksi internet terputus | Demo tetap berjalan karena data lokal |
