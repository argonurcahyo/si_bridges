# User Stories — Dashboard Operasional HydroGraph-AI

Format: **Sebagai** [peran], **saya ingin** [tujuan], **agar** [manfaat].
Kriteria penerimaan memakai **Given / When / Then**.
Prioritas mengikuti `requirements.md`. Estimasi memakai story point Fibonacci (1, 2, 3, 5, 8).

## Epic

| ID | Epic | Tujuan |
|---|---|---|
| E-01 | Pemantauan jaringan | Operator melihat kondisi sungai secara spasial |
| E-02 | Simulasi skenario | Operator mencoba hujan dan konversi lahan |
| E-03 | Beban & proyeksi | Operator membaca debit dan volume ke depan |
| E-04 | Rekomendasi & keputusan | Operator menilai dan memutuskan rekomendasi AI |
| E-05 | Peringatan publik | Operator meninjau draf sebelum disebarkan |
| E-06 | Historis | Operator mempelajari kejadian banjir sebelumnya |
| E-07 | Transparansi & status | Operator tahu sumber dan kesegaran data |

## E-01 Pemantauan jaringan

**US-01 Melihat peta jaringan** (M, 5)
Sebagai operator, saya ingin melihat node dan edge di peta, agar saya tahu kondisi tiap pintu air.

- Given dashboard dibuka, When peta selesai dimuat, Then node dan edge tampil dari Depok sampai Jakarta.
- Given node memiliki level siaga, When peta tampil, Then node berwarna merah dengan ikon dan label teks.

**US-02 Beralih 2D dan 3D** (S, 3)
Sebagai operator, saya ingin beralih antara 2D dan 3D, agar saya bisa melihat topografi koridor.

- Given mode 3D dipilih, When terrain tersedia, Then peta menampilkan terrain.
- Given terrain tidak tersedia, When mode 3D dipilih, Then peta menampilkan extrusion sederhana dan pesan "Terrain belum tersedia".

**US-03 Menyalakan layer** (S, 2)
Sebagai operator, saya ingin menyalakan dan mematikan layer, agar peta tidak penuh.

- Given layer heatmap dimatikan, When operator menekan toggle, Then heatmap hilang dan legenda ikut disembunyikan.

**US-04 Melihat detail node** (M, 3)
Sebagai operator, saya ingin melihat detail node saat diklik, agar saya bisa menilai kondisinya.

- Given node diklik, When panel terbuka, Then panel menampilkan debit, TMA, status, dan sumber dengan timestamp WIB.
- Given fokus keyboard pada node, When Enter ditekan, Then panel detail terbuka.

## E-02 Simulasi skenario

**US-05 Menggeser intensitas hujan** (M, 5)
Sebagai operator, saya ingin menggeser slider hujan, agar saya melihat dampaknya langsung.

- Given slider digeser, When berhenti 300 ms, Then peta, grafik, dan rekomendasi diperbarui.
- Given slider digeser ke 200 mm/jam, When hasil tampil, Then nilai 200 mm/jam terlihat jelas dan batas maksimal ditandai.

**US-06 Memilih konversi lahan Depok** (M, 3)
Sebagai operator, saya ingin memilih tingkat konversi lahan, agar saya melihat pengaruh tata guna lahan.

- Given konversi 20% dipilih, When simulasi selesai, Then C-value segmen Depok berubah dan hasilnya tampil.

**US-07 Menggunakan skenario cepat** (S, 2)
Sebagai operator, saya ingin tombol skenario cepat, agar saya bisa mencoba kondisi tertentu tanpa mengatur slider.

- Given tombol "Hujan naik 20 mm/jam" ditekan, When simulasi selesai, Then slider berpindah ke nilai preset dan hasil diperbarui.

**US-08 Membandingkan baseline dan skenario** (S, 5)
Sebagai operator, saya ingin membandingkan baseline dan skenario, agar saya tahu seberapa besar perubahannya.

- Given mode perbandingan aktif, When skenario berbeda, Then selisih debit dan volume per segmen tampil.

## E-03 Beban & proyeksi

**US-09 Melihat beban debit per segmen** (M, 3)
Sebagai operator, saya ingin grafik debit per segmen, agar saya tahu segmen mana yang paling berisiko.

- Given hasil simulasi tersedia, When grafik tampil, Then garis ambang siaga dan waspada terlihat dengan label.

**US-10 Melihat proyeksi 3–6 jam** (M, 5)
Sebagai operator, saya ingin proyeksi akumulasi volume, agar saya punya waktu untuk bertindak.

- Given hasil simulasi tersedia, When grafik proyeksi tampil, Then sumbu waktu mencakup 3 sampai 6 jam dan pita confidence terlihat.
- Given confidence < 85%, When proyeksi tampil, Then label "Memerlukan Konfirmasi Petugas Lapangan" muncul.

## E-04 Rekomendasi & keputusan

**US-11 Membaca rekomendasi taktis** (M, 5)
Sebagai operator, saya ingin narasi rekomendasi, agar saya tahu tindakan yang disarankan.

- Given simulasi selesai, When LLM mengembalikan narasi, Then narasi tampil dengan badge "AI", model, waktu generasi, dan ringkasan input.
- Given narasi memuat angka yang tidak ada di hasil simulasi, When validasi berjalan, Then narasi ditolak dan fallback aktif.

**US-12 Fallback saat LLM gagal** (M, 5)
Sebagai operator, saya ingin tetap menerima rekomendasi saat LLM gagal, agar dashboard tidak kosong saat darurat.

- Given LLM tidak merespons dalam 5 detik, When timeout terjadi, Then rekomendasi rule-based tampil dengan badge "Rule-based" dan pesan singkat.
- Given toggle "paksa gagal LLM" aktif, When simulasi berjalan, Then fallback selalu aktif.

**US-13 Melihat confidence** (M, 3)
Sebagai operator, saya ingin melihat confidence setiap rekomendasi, agar saya tahu seberapa percaya pada hasilnya.

- Given confidence 92%, When narasi tampil, Then "Kepastian 92%" terlihat dengan ikon.
- Given confidence 80%, When narasi tampil, Then label konfirmasi lapangan terlihat dan tidak bisa disembunyikan.

**US-14 Memberi keputusan** (M, 5)
Sebagai operator, saya ingin memilih Diterima, Ditolak, atau Perlu Verifikasi, agar keputusan saya tercatat.

- Given rekomendasi berstatus Pending, When operator memilih Diterima, Then status berubah menjadi Diterima dan entri log ditambahkan.
- Given keputusan dipilih, When sistem menyimpan, Then tidak ada perintah yang dikirim ke node atau pompa.

**US-15 Melihat log keputusan** (S, 3)
Sebagai operator, saya ingin melihat riwayat keputusan, agar saya bisa menelusuri apa yang sudah diputuskan.

- Given ada tiga keputusan, When panel riwayat dibuka, Then ketiganya tampil dengan waktu WIB dan ID rekomendasi.

## E-05 Peringatan publik

**US-16 Meninjau draf peringatan publik** (M, 5)
Sebagai operator, saya ingin meninjau draf peringatan per kelurahan, agar saya bisa menyalinnya setelah yakin.

- Given level risiko kelurahan Bidara Cina Siaga, When draf dibuka, Then teks memuat level, estimasi waktu, dan sumber.
- Given operator menekan salin, When berhasil, Then teks tersalin dan toast konfirmasi tampil.
- Given draf tampil, When operator mencari tombol kirim, Then tidak ada tombol kirim ke warga.

## E-06 Historis

**US-17 Memutar kejadian historis** (S, 5)
Sebagai operator, saya ingin memutar data banjir 2020 atau 2021, agar saya memahami pola kejadian.

- Given kejadian 2020 dipilih, When play ditekan, Then peta dan grafik bergerak sesuai waktu.
- Given pause ditekan, When berjalan, Then animasi berhenti dan posisi waktu tetap.

## E-07 Transparansi & status

**US-18 Melihat sumber dan kesegaran data** (M, 3)
Sebagai operator, saya ingin melihat sumber dan waktu pembaruan data, agar saya tahu seberapa dapat dipercaya datanya.

- Given layer TMA ditampilkan, When status dibuka, Then sumber, waktu pembaruan, dan label `mock` atau `sintetis` tampil.

**US-19 Melihat mode latihan** (M, 1)
Sebagai operator, saya ingin banner mode di header, agar saya tidak mengira data mock sebagai data nyata.

- Given prototipe berjalan, When dashboard tampil, Then banner "Mode Latihan" terlihat di header pada semua layar.

**US-20 Melihat status layanan** (S, 2)
Sebagai operator, saya ingin status layanan simulasi dan LLM, agar saya tahu apakah sistem sedang terdegradasi.

- Given LLM gagal, When status dilihat, Then status LLM "Terdegradasi" dengan ikon dan teks.

**US-21 Melihat state kosong dan error** (M, 3)
Sebagai operator, saya ingin pesan yang jelas saat data kosong atau error, agar saya tahu apa yang harus dilakukan.

- Given data node kosong, When dashboard dimuat, Then state kosong tampil dengan tombol "Muat ulang".
- Given simulasi gagal, When error terjadi, Then hasil sebelumnya tetap tampil dengan label "Belum diperbarui".

## Ringkasan

| Epic | Jumlah story | Total estimasi |
|---|---|---|
| E-01 | 4 | 13 |
| E-02 | 4 | 15 |
| E-03 | 2 | 8 |
| E-04 | 5 | 21 |
| E-05 | 1 | 5 |
| E-06 | 1 | 5 |
| E-07 | 4 | 9 |
| **Total** | **21** | **76** |

Catatan: sebagian story diambil dari masukan tim (US-03, US-07, US-15, US-16, US-20, US-21). Estimasi perlu divalidasi saat sprint planning.
