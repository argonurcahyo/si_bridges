# Catatan Usability

Template untuk uji pengguna prototipe. Dilakukan setelah prototipe bisa dijalankan.

## 1. Rencana Uji

| Item | Isi |
|---|---|
| Tujuan | Memastikan operator memahami alur peringatan dan perencana memahami alur simulator |
| Jumlah peserta | 3–5 orang |
| Komposisi | Mahasiswa atau dosen dengan latar informatika, dan jika memungkinkan petugas atau pihak yang memahami operasional banjir |
| Durasi | 30 menit per peserta |
| Metode | Think-aloud. Peserta diminta menyelesaikan tugas tanpa bantuan |
| Pencatat | Tim SWE (satu orang mencatat, satu orang memandu) |

## 2. Tugas Uji

| # | Tugas | Keberhasilan | Waktu target |
|---|---|---|---|
| T-1 | Temukan node dengan status siaga | Menunjuk node yang benar | 30 detik |
| T-2 | Naikkan intensitas hujan menjadi 100 mm/jam dan jelaskan dampaknya pada peta | Menjelaskan perubahan warna dan debit | 1 menit |
| T-3 | Pilih konversi lahan 30% di Depok dan lihat dampaknya pada grafik | Menyebut segmen yang berubah | 1 menit |
| T-4 | Baca rekomendasi dan beri keputusan "Perlu Verifikasi" | Keputusan tercatat di log | 1 menit |
| T-5 | Jelaskan arti label "Memerlukan Konfirmasi Petugas Lapangan" | Menjelaskan bahwa perlu cek lapangan | 30 detik |
| T-6 | Temukan peringatan untuk Bidara Cina, sunting satu kalimat, lalu siarkan | Peringatan berstatus disiarkan dan muncul di `/warga` | 1,5 menit |
| T-7 | Tarik peringatan dan pastikan hilang dari halaman warga | Halaman warga menampilkan empty state | 1 menit |
| T-8 | Ubah parameter simulator dan jelaskan interpretasi yang muncul | Menyebut dampak vs baseline dan batasan model | 1,5 menit |
| T-9 | Generate Executive Brief dan unduh Markdown | File brief terunduh | 1 menit |
| T-10 | Jelaskan apakah data di layar nyata atau mock | Menyebut "Mode Latihan" atau status mock | 30 detik |

## 3. Pertanyaan Setelah Uji

1. Bagian mana yang paling membantu dalam mengambil keputusan?
2. Bagian mana yang membingungkan atau membuat Anda ragu?
3. Apakah Anda merasa perlu memverifikasi rekomendasi AI? Kapan?
4. Apakah tombol keputusan sudah jelas?
5. Apakah peringatan publik sudah sesuai dengan cara Anda berkomunikasi dengan warga?
6. Apa satu hal yang paling ingin Anda ubah?

## 4. Skala Penilaian

| Aspek | Skala 1–5 |
|---|---|
| Kemudahan memahami peta | |
| Kejelasan hasil simulasi | |
| Kepercayaan terhadap rekomendasi | |
| Kejelasan status AI dan confidence | |
| Kemudahan membuat keputusan | |

## 5. Catatan Peserta

| Peserta | Tanggal | Tugas gagal | Kutipan penting | Temuan | Prioritas perbaikan |
|---|---|---|---|---|---|
| P-1 | | | | | |
| P-2 | | | | | |
| P-3 | | | | | |

## 6. Ringkasan Temuan

| ID | Temuan | Dampak | Tindak lanjut | Pemilik |
|---|---|---|---|---|
| UT-01 | | | | |

## 7. Catatan Etika

- Peserta diberi tahu bahwa data adalah mock dan hasil tidak mewakili kondisi nyata.
- Tidak ada data pribadi yang direkam. Nama peserta diganti P-1, P-2, dan seterusnya.
- Peserta boleh berhenti kapan saja.
