# Screen Inventory — HydroTwin-AI (EWS & Simulator)

## 1. Early Warning System — Operator

| ID | Layar | Tujuan | Use case | Requirement | Prioritas | Pemilik |
|---|---|---|---|---|---|---|
| O-01 | Dashboard utama | Pantau, simulasi, lihat debit, proyeksi, dan rekomendasi dalam satu layar | UC-01, 02, 03, 04, 05, 07 | FR-01–FR-14, FR-20–FR-23 | M | Yovi |
| O-02 | Detail node/segmen | Lihat detail satu titik atau segmen | UC-10 | FR-05, FR-06 | M | Yovi |
| O-03 | Perbandingan skenario | Bandingkan baseline dan skenario | UC-06 | FR-10 | S | Yovi |
| O-04 | Rekomendasi & keputusan | Baca narasi, lihat confidence, beri keputusan, lihat log | UC-07, 08, 13, 14 | FR-20–FR-25, FR-R1–R5 | M | Yovi |
| O-05 | Playback historis | Putar kejadian 2020 dan 2021 | UC-11 | FR-15 | S | Yovi |
| O-06 | Tinjau & siarkan peringatan | Tinjau pesan (template/AI), sunting, siarkan/tolak/tarik per wilayah | UC-09, 16 | FR-26, FR-34–FR-37, FR-R6, FR-R9 | M | Yovi |
| O-07 | Status data & layanan | Lihat sumber, waktu pembaruan, status layanan | UC-12 | FR-28, FR-29, FR-30 | M | Yovi |
| O-08 | Kondisi khusus | Kosong, loading, error, LLM gagal, offline | Semua | FR-33, NFR-07 | M | Yovi |

## 2. Early Warning System — Warga

| ID | Layar | Tujuan | Use case | Requirement | Prioritas | Pemilik |
|---|---|---|---|---|---|---|
| W-01 | Kartu peringatan warga | Melihat peringatan resmi untuk wilayahnya | UC-15 | FR-34, FR-38, FR-R10 | M | Yovi |
| W-02 | Empty state warga | Pesan resmi bila belum ada peringatan aktif | UC-15 | FR-38 | M | Yovi |

## 3. Simulator — Perencana

| ID | Layar | Tujuan | Use case | Requirement | Prioritas | Pemilik |
|---|---|---|---|---|---|---|
| P-01 | Panel parameter | Mengatur parameter dari registry | UC-20 | FR-39 | M | Yovi |
| P-02 | Peta kedalaman | Melihat sebaran kedalaman per kelurahan | UC-21 | FR-40 | M | Yovi |
| P-03 | Panel dampak | Luas genangan, RW terdampak, puncak, keyakinan | UC-21 | FR-40 | M | Yovi |
| P-04 | Interpretasi & Executive Brief | Membaca interpretasi AI dan menghasilkan brief | UC-22, 23 | FR-41–FR-43, FR-R11 | M | Yovi |

## Catatan

- O-01 adalah layar utama EWS operator. Layar lain adalah panel atau halaman pendukung.
- O-04 memuat log audit (UC-13) sebagai tab, bukan layar terpisah.
- O-06 menggantikan draf yang hanya bisa disalin; sekarang memiliki aksi siarkan/tarik per wilayah.
- W-01 hanya membaca peringatan berstatus `disiarkan`; tidak ada akses ke simulasi langsung.
- P-04 menggabungkan interpretasi otomatis dan Executive Brief on-demand.
- O-08 didokumentasikan sebagai varian dari O-01, O-04, O-06, dan O-07 (lihat `wireframes.md`).
- Pemilih bahasa ID/EN tersedia di header dan halaman warga; default English.

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
| O-06a | AI gagal, pesan template | O-06 |
| O-06b | Belum ada wilayah waspada/siaga | O-06 |
| O-06c | Peringatan sedang disiarkan | O-06 |
| O-07a | Layanan terdegradasi | O-07 |
| O-08a | Peta gagal dimuat (daftar segmen sebagai pengganti) | O-01 |
| O-08b | Mode tablet 768 px | O-01 |
| W-01a | Peringatan ditarik / kedaluwarsa | W-01 |
| W-01b | Belum ada peringatan aktif | W-02 |
| P-04a | Interpretasi template (LLM gagal) | P-04 |
| P-04b | Brief usang setelah parameter berubah | P-04 |
