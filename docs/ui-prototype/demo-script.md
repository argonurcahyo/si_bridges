# Skrip Demo — Dashboard Operasional (5–7 menit)

Target penonton: juri SI Bridges, petugas BPBD/DSDA, dan tim. Semua data pada demo adalah **mock** dan ditandai di layar.

## Persiapan

- [ ] Prototipe berjalan di browser (Chrome, layar 1440 px).
- [ ] Mode 3D sudah diuji. Jika belum siap, demo hanya 2D.
- [ ] Toggle "paksa gagal LLM" dalam keadaan mati di awal.
- [ ] Skenario di-reset ke baseline.
- [ ] Log keputusan kosong.

## Urutan

| Menit | Langkah | Yang ditunjukkan | Catatan untuk presenter |
|---|---|---|---|
| 0:00 | Buka `/ops` | Banner MODE LATIHAN, peta koridor Katulampa–Cawang | "Ini data mock. Banner ini tidak boleh dihapus." |
| 0:30 | Tunjuk node dan edge | Warna node, ukuran edge sesuai debit | Jelaskan node = pintu air, edge = segmen sungai |
| 1:00 | Klik Pintu Air Manggarai | Panel O-02 dengan TMA, debit, sumber | Tunjukkan sumber dan waktu pembaruan |
| 1:30 | Geser slider ke 80 mm/jam | Peta dan grafik berubah dalam ≤ 300 ms | Tekankan respons real-time |
| 2:00 | Pilih konversi lahan Depok 20% | C-value berubah, debit naik | "Ini pengaruh tata guna lahan." |
| 2:30 | Tekan "Hujan +20 mm/jam" | Skenario cepat | Jelaskan pertanyaan "bagaimana jika hujan naik" |
| 3:00 | Buka perbandingan (O-03) | Baseline vs skenario, selisih per segmen | Opsional jika waktu kurang |
| 3:30 | Baca rekomendasi (O-04) | Narasi AI, badge sumber, confidence | Tunjuk "AI · Gemini (mock)" |
| 4:00 | Jika confidence < 85%, tunjuk label konfirmasi | Label tidak bisa dihilangkan | Tekankan Responsible AI |
| 4:15 | Aktifkan "paksa gagal LLM" lalu geser slider | Fallback otomatis ke rule-based dalam 5 detik | **Momen kunci.** Tunjukkan dashboard tidak kosong |
| 4:45 | Operator memilih "Perlu Verifikasi" | Toast "Tidak ada tindakan otomatis" | Tekankan human-in-the-loop |
| 5:00 | Buka log keputusan | Entri dengan waktu WIB | Tekankan auditabilitas |
| 5:15 | Buka draf peringatan publik (O-06) | Teks per kelurahan, tidak ada tombol kirim | "Warga tidak menerima pesan otomatis." |
| 5:45 | Salin teks | Toast tersalin | Selesai |
| 6:00 | Buka status data (O-07) | Sumber, status mock/sintetis, status layanan | Tekankan transparansi |
| 6:30 | Tutup dengan disclaimer | Footer DSS | "Keputusan akhir ada pada petugas." |

## Pertanyaan yang Mungkin Muncul

| Pertanyaan | Jawaban singkat |
|---|---|
| Apakah ini model hidrologi asli? | Belum. Ini prototipe dashboard dengan layanan simulasi mock. Kontraknya sama dengan model yang akan dipasang. |
| Bagaimana kalau AI salah? | Ada confidence, validasi angka, fallback, dan keputusan manusia. AI tidak menjalankan aksi. |
| Apakah warga menerima notifikasi otomatis? | Tidak. Draf hanya ditinjau dan disalin oleh operator. |
| Apakah data ini nyata? | Sumber data nyata akan dihubungkan di tahap berikutnya. Saat ini semua ditandai mock. |
| Apa bedanya dengan Manning penuh? | Prototipe memakai pendekatan yang disederhanakan. Perhitungan lanjutan ada di tahap pemodelan. |
| Bagaimana jika LLM tidak tersedia saat banjir? | Fallback rule-based aktif dalam 5 detik. |

## Jika Ada Masalah Saat Demo

| Masalah | Tindakan |
|---|---|
| Peta lambat | Matikan layer heatmap, lanjut ke grafik |
| Mode 3D gagal | Kembali ke 2D, jelaskan bahwa 3D masih dalam pengembangan |
| LLM terlalu cepat dan fallback tidak terlihat | Aktifkan "paksa gagal" sebelum geser slider |
| Koneksi internet terputus | Demo tetap berjalan karena data lokal |
