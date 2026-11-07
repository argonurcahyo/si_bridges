# Spesifikasi Interaksi

Setiap kontrol dijelaskan dengan perilaku, status, dan kriteria keyboard. Acuan requirement ada di kolom terakhir.

## 1. Slider Intensitas Hujan

| Aspek | Perilaku |
|---|---|
| Rentang | 0–200 mm/jam, langkah 1 mm/jam |
| Nilai default | 60 mm/jam (baseline) |
| Tampilan nilai | Angka besar di atas slider, berubah real-time |
| Batas | Label "0" dan "200" di bawah. Di 200, tampil "Batas maksimum simulasi" |
| Debounce | 300 ms setelah input berhenti sebelum simulasi dijalankan |
| Saat simulasi berjalan | Peta dan grafik menampilkan skeleton tipis, bukan kosong |
| Keyboard | Panah kiri/kanan ±1, Shift+panah ±10, Home 0, End 200 |
| Screen reader | `aria-valuetext="80 milimeter per jam"` |
| Requirement | FR-07, FR-11, FR-12, NFR-01 |

## 2. Kontrol Konversi Lahan Depok

| Aspek | Perilaku |
|---|---|
| Pilihan | 0%, 10%, 20%, 30% (ToggleGroup) |
| Default | 0% |
| Efek | Mengubah C-value segmen Depok, lalu simulasi dihitung ulang |
| Tooltip | "Persentase area resapan yang berubah menjadi terbangun" |
| Keyboard | Panah untuk memilih, Enter atau Spasi untuk aktif |
| Requirement | FR-08, FR-11 |

## 3. Tombol Skenario Cepat

| Tombol | Aksi |
|---|---|
| Baseline | Hujan 60 mm/jam, konversi 0% |
| Hujan +20 mm/jam | Hujan = baseline + 20, konversi tidak berubah |
| Konversi 20% | Konversi 20%, hujan tidak berubah |
| Reset | Kembali ke baseline |

- Tombol yang sedang aktif menampilkan `aria-pressed="true"`.
- Setelah tombol ditekan, slider dan toggle ikut berpindah sehingga state tetap konsisten.
- Requirement: FR-09

## 4. Peta

| Aksi | Perilaku |
|---|---|
| Klik node | Membuka O-02 sebagai sheet kanan. Node yang dipilih berbingkai tebal |
| Klik segmen (kelurahan) | Membuka O-02 untuk kelurahan. Segmen disorot |
| Hover node | Tooltip ringan: nama dan level |
| Zoom dan geser | Mouse, scroll, dan keyboard (panah dan +/-) |
| Toggle 2D/3D | Tombol segmented di pojok kanan bawah peta. Saat terrain tidak tersedia, tampil pesan |
| Toggle layer | Panel kecil "Layer" dengan switch: Sungai, Batas DAS, Heatmap, Sensor TMA |
| Legenda | Dapat dilipat, default terbuka |
| Keyboard | Fokus peta berpindah ke tabel alternatif bila peta gagal (O-08a) |
| Requirement | FR-01–FR-05, FR-10, NFR-04 |

## 5. Grafik Debit

| Aspek | Perilaku |
|---|---|
| Seri | Maksimal 3: debit baseline, debit skenario, dan ambang |
| Ambang | Garis putus-putus dengan label "siaga" dan "waspada" |
| Tooltip | Nilai, satuan, waktu WIB |
| Klik batang | Membuka O-02 untuk segmen tersebut |
| Mode perbandingan | Dua seri ditampilkan berdampingan |
| Requirement | FR-13, FR-10 |

## 6. Grafik Proyeksi 3–6 Jam

| Aspek | Perilaku |
|---|---|
| Sumbu X | Jam ke depan: 3, 4, 5, 6 (WIB) |
| Sumbu Y | Volume akumulasi (juta m³) |
| Pita confidence | Area transparan dari batas bawah sampai atas |
| Label konfirmasi | Muncul di atas grafik bila confidence < 85% |
| Requirement | FR-14, FR-22, FR-23 |

## 7. Panel Rekomendasi (O-04)

| Aspek | Perilaku |
|---|---|
| Narasi | Tampil setelah simulasi selesai. Skeleton saat menunggu |
| Sumber | Badge "AI · Gemini (mock)" atau "Rule-based" |
| Confidence | Selalu tampil. Jika < 85%, label konfirmasi di atas narasi dan tidak bisa disembunyikan |
| Timeout | Setelah 5 detik, fallback otomatis dengan pesan singkat |
| Tombol keputusan | Diterima, Ditolak, Perlu Verifikasi. Hanya satu aktif |
| Setelah keputusan | Toast "Keputusan tercatat. Tidak ada tindakan otomatis." |
| Log | Tab "Log keputusan" menampilkan entri terbaru di atas |
| Requirement | FR-20–FR-25, FR-R1–FR-R5 |

## 8. Keputusan Operator

| Aturan | Detail |
|---|---|
| Status awal | Pending |
| Perubahan keputusan | Diizinkan. Setiap perubahan menambah entri log |
| Input simulasi berubah | Rekomendasi lama berstatus Kedaluwarsa, dan keputusan baru dibutuhkan |
| Tidak ada efek fisik | Tidak ada tombol "Jalankan" atau "Kirim ke pintu air" |
| Requirement | FR-24, FR-25, FR-R1 |

## 9. Draf Peringatan Publik (O-06)

| Aspek | Perilaku |
|---|---|
| Pilih kelurahan | Dropdown, urut dari level tertinggi |
| Teks | Read-only, dapat diseleksi |
| Salin | Menyalin ke clipboard, toast konfirmasi |
| Kirim | Tidak ada. Sengaja tidak disediakan |
| Sumber | Ditampilkan di bawah teks |
| Requirement | FR-26, FR-R6 |

## 10. Playback Historis (O-05)

| Aspek | Perilaku |
|---|---|
| Pilih kejadian | Dropdown: 2020, 2021 |
| Play dan pause | Tombol toggle, Spasi juga berfungsi |
| Scrub | Slider waktu, langkah 15 menit |
| Kecepatan | 1×, 2×, 4× |
| Batas | Berhenti otomatis di akhir kejadian |
| Reduced motion | Tidak berjalan otomatis; hanya scrub manual |
| Requirement | FR-15 |

## 11. Header

| Elemen | Perilaku |
|---|---|
| Banner MODE LATIHAN | Selalu tampil, tidak bisa ditutup |
| Status layanan | Klik membuka O-07 |
| Waktu WIB | Diperbarui setiap menit |
| Toggle tema | Gelap (default) dan terang |
| Menu Pantau, Historis, Status, Log | Navigasi dalam satu halaman, dengan indikator aktif |
| Requirement | FR-29, FR-30 |

## 12. Konflik Keputusan dan Data Lama

| Situasi | Perilaku |
|---|---|
| Simulasi gagal | Hasil lama tetap tampil dengan label "Belum diperbarui" |
| Peta gagal | O-08a |
| Data kosong | O-08b |
| Koneksi hilang | Banner "Koneksi terputus, menampilkan data terakhir" |
| Fallback aktif | Badge rule-based dan pesan singkat |
