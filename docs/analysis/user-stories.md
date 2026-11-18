# User Stories — HydroTwin-AI (EWS & Simulator)

Format: **Sebagai** [peran], **saya ingin** [tujuan], **agar** [manfaat].
Kriteria penerimaan memakai **Given / When / Then**.
Prioritas mengikuti `requirements.md`. Estimasi memakai story point Fibonacci (1, 2, 3, 5, 8).

## Epic

| ID | Epic | Use case | Tujuan |
|---|---|---|---|
| E-01 | Pemantauan jaringan | EWS | Operator melihat kondisi sungai secara spasial |
| E-02 | Simulasi skenario | EWS | Operator mencoba hujan dan konversi lahan |
| E-03 | Beban & proyeksi | EWS | Operator membaca debit dan volume ke depan |
| E-04 | Rekomendasi & keputusan | EWS | Operator menilai dan memutuskan rekomendasi AI |
| E-05 | Peringatan publik | EWS | Operator menyunting dan menyiarkan peringatan; warga menerima yang disiarkan |
| E-06 | Historis | EWS | Operator mempelajari kejadian banjir sebelumnya |
| E-07 | Transparansi & status | Keduanya | Pengguna tahu sumber dan kesegaran data |
| E-08 | Simulator kebijakan | Simulator | Perencana mengolah parameter, membaca interpretasi AI, dan menghasilkan Executive Brief |

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
Sebagai operator, saya ingin melihat riwayat keputusan dan perubahan peringatan, agar saya bisa menelusuri apa yang sudah diputuskan.

- Given ada tiga keputusan, When panel riwayat dibuka, Then ketiganya tampil dengan waktu WIB dan ID rekomendasi.
- Given ada sunting/siarkan/tarik peringatan, When log dibuka, Then entri tersebut tampil dengan referensi peringatan.

## E-05 Peringatan publik

**US-16 Meninjau pesan peringatan AI** (M, 5)
Sebagai operator, saya ingin meninjau pesan peringatan yang disusun AI per kelurahan, agar saya bisa memastikan isinya sebelum disiarkan.

- Given level risiko kelurahan Bidara Cina Siaga, When sheet peringatan dibuka, Then teks memuat level, estimasi waktu, langkah tindakan, dan sumber.
- Given AI gagal merespons, When pesan disusun, Then template tampil dengan badge sumber.
- Given teks tampil, When operator membaca, Then teks AI asli terlihat dan dapat disunting.

**US-22 Menyunting pesan peringatan** (M, 5)
Sebagai operator, saya ingin menyunting pesan AI, agar bahasa dan konteksnya sesuai dengan kondisi lapangan.

- Given pesan AI tampil, When operator mengubah teks dan menyimpan, Then teks final tersimpan terpisah dari teks AI asli.
- Given operator menyunting, When audit dibuka, Then perubahan tercatat dengan waktu WIB.

**US-23 Menyiarkan peringatan** (M, 5)
Sebagai operator, saya ingin menyiarkan peringatan per wilayah, agar warga hanya menerima informasi resmi yang sudah saya setujui.

- Given peringatan berstatus draf dan level siaga, When operator menekan Siarkan, Then status berubah menjadi disiarkan dan halaman warga menampilkan peringatan tersebut.
- Given peringatan wilayah A disiarkan, When warga memilih wilayah B, Then peringatan A tidak tampil untuk wilayah B.
- Given operator menyiarkan, When audit dibuka, Then entri siaran tercatat dengan operator dan waktu.

**US-24 Menarik peringatan** (S, 3)
Sebagai operator, saya ingin menarik peringatan yang sudah tidak berlaku, agar warga tidak membaca informasi kedaluwarsa.

- Given peringatan berstatus disiarkan, When operator menekan Tarik, Then peringatan hilang dari halaman warga dan status berubah menjadi ditarik.

**US-25 Menerima peringatan resmi** (M, 5)
Sebagai warga, saya ingin melihat peringatan resmi untuk wilayah saya, agar saya tahu langkah yang harus dilakukan.

- Given operator sudah menyiarkan peringatan, When warga membuka `/warga` dan memilih wilayahnya, Then level, estimasi tiba, puncak, langkah evakuasi, dan waktu siaran tampil; kedalaman tampil bila tersedia.
- Given belum ada peringatan aktif, When halaman dibuka, Then pesan "Belum ada peringatan resmi untuk wilayah ini" tampil.
- Given peringatan ditarik atau kedaluwarsa, When halaman diperbarui, Then kartu peringatan hilang.

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

## E-08 Simulator kebijakan

**US-26 Mengatur parameter simulator** (M, 5)
Sebagai perencana, saya ingin mengatur parameter skenario dari daftar yang tersedia, agar saya bisa menguji kebijakan sebelum diterapkan.

- Given halaman simulator dibuka, When registry parameter dimuat, Then setiap parameter tampil dengan label, satuan, batas, dan nilai default.
- Given parameter diubah, When input berhenti 300 ms, Then peta dan panel dampak diperbarui.
- Given parameter tambahan ditambahkan ke registry, When halaman dimuat ulang, Then kontrol baru tampil tanpa mengubah struktur panel.

**US-27 Melihat interpretasi AI** (M, 5)
Sebagai perencana, saya ingin AI membantu menginterpretasikan hasil skenario, agar saya memahami trade-off kebijakan.

- Given parameter berhenti berubah, When interpretasi selesai, Then teks menampilkan dampak vs baseline, sumber AI/template, model, waktu, dan batasan.
- Given AI gagal, When interpretasi diminta, Then template tampil dengan badge sumber.
- Given parameter berubah lagi, When interpretasi lama belum selesai, Then hasil usang dibatalkan dan tidak ditampilkan.

**US-28 Menghasilkan Executive Brief** (M, 5)
Sebagai perencana, saya ingin menghasilkan Executive Brief dari skenario aktif, agar saya punya bahan perancangan kebijakan.

- Given skenario aktif tersedia, When perencana menekan Generate brief, Then brief tampil dengan ringkasan, dampak, opsi kebijakan, rekomendasi, dan batasan.
- Given brief tampil, When perencana menekan Salin atau Unduh, Then teks tersalin atau file Markdown terunduh.
- Given brief dihasilkan AI, When brief dibaca, Then label "draf, menunggu tinjauan analis" dan provenance tampil.

## Ringkasan

| Epic | Jumlah story | Total estimasi |
|---|---|---|
| E-01 | 4 | 13 |
| E-02 | 4 | 15 |
| E-03 | 2 | 8 |
| E-04 | 5 | 21 |
| E-05 | 5 | 23 |
| E-06 | 1 | 5 |
| E-07 | 4 | 9 |
| E-08 | 3 | 15 |
| **Total** | **28** | **109** |

Catatan: sebagian story diambil dari masukan tim (US-03, US-07, US-15, US-16, US-20, US-21). US-22–US-28 ditambahkan dari keputusan dua use case 18 November 2026. Estimasi perlu divalidasi saat sprint planning.
