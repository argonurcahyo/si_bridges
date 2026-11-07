# Screen Inventory — Dashboard Operasional

| ID | Layar | Tujuan | Use case | Requirement | Prioritas | Pemilik |
|---|---|---|---|---|---|---|
| O-01 | Dashboard utama | Pantau, simulasi, lihat debit, proyeksi, dan rekomendasi dalam satu layar | UC-01, 02, 03, 04, 05, 07 | FR-01–FR-14, FR-20–FR-23 | M | Yovi |
| O-02 | Detail node/segmen | Lihat detail satu titik atau segmen | UC-10 | FR-05, FR-06 | M | Yovi |
| O-03 | Perbandingan skenario | Bandingkan baseline dan skenario | UC-06 | FR-10 | S | Yovi |
| O-04 | Rekomendasi & keputusan | Baca narasi, lihat confidence, beri keputusan, lihat log | UC-07, 08, 13, 14 | FR-20–FR-25, FR-R1–R5 | M | Yovi |
| O-05 | Playback historis | Putar kejadian 2020 dan 2021 | UC-11 | FR-15 | S | Yovi |
| O-06 | Draf peringatan publik | Tinjau dan salin draf per kelurahan | UC-09 | FR-26, FR-R6 | M | Yovi |
| O-07 | Status data & layanan | Lihat sumber, waktu pembaruan, status layanan | UC-12 | FR-28, FR-29, FR-30 | M | Yovi |
| O-08 | Kondisi khusus | Kosong, loading, error, LLM gagal, offline | Semua | FR-33, NFR-07 | M | Yovi |

## Catatan

- O-01 adalah layar utama. Layar lain adalah panel atau halaman pendukung.
- O-04 memuat log audit (UC-13) sebagai tab, bukan layar terpisah.
- O-08 didokumentasikan sebagai varian dari O-01, O-04, dan O-07 (lihat `wireframes.md`).
- Web publik tidak termasuk dalam daftar ini (tahap berikutnya).

## Varian Layar

| ID | Kondisi | Layar dasar |
|---|---|---|
| O-01a | Data node kosong | O-01 |
| O-01b | Simulasi sedang berjalan (skeleton) | O-01 |
| O-01c | Simulasi gagal (hasil lama + label) | O-01 |
| O-01d | Konektivitas hilang (banner) | O-01 |
| O-04a | LLM timeout, fallback aktif | O-04 |
| O-04b | Confidence < 85% | O-04 |
| O-04c | Belum ada rekomendasi | O-04 |
| O-07a | Layanan terdegradasi | O-07 |
| O-08a | Peta gagal dimuat (daftar segmen sebagai pengganti) | O-01 |
| O-08b | Mode tablet 768 px | O-01 |
