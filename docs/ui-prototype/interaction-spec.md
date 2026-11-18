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
| Sumber | Badge "AI · (mock)" atau "Template" |
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

## 9. Peringatan Publik (O-06, W-01)

### O-06 — Tinjau, sunting, siarkan

| Aspek | Perilaku |
|---|---|
| Pilih wilayah | Dropdown, urut dari level tertinggi; hanya waspada/siaga |
| Teks awal | Teks AI atau template fallback, dapat disunting |
| Teks final | Disimpan terpisah dari teks awal |
| Sumber | Badge AI/template, model, waktu generasi |
| Siarkan | Mengubah status menjadi `disiarkan`; peringatan muncul di warga wilayah tersebut |
| Tolak | Mengubah status menjadi `ditolak`; tidak ada publikasi |
| Tarik | Mengubah status menjadi `ditarik`; peringatan hilang dari warga |
| Generate ulang | Meminta AI menyusun ulang pesan; hasil lama tetap di audit |
| Fallback | Timeout/error/validasi angka atau tone → template + alasan tampil |
| Empty state | Bila tidak ada wilayah waspada/siaga, tidak ada tombol siarkan |
| Keyboard | Sheet menjebak fokus; Esc menutup tanpa menyiarkan |
| Requirement | FR-26, FR-34–FR-37, FR-R6, FR-R9 |

### W-01 — Menerima peringatan

| Aspek | Perilaku |
|---|---|
| Sumber data | Hanya peringatan berstatus `disiarkan` dan belum kedaluwarsa |
| Wilayah | Pemilih wilayah dari peringatan aktif; bukan simulasi langsung |
| Isi | Level, estimasi tiba, puncak, teks final, langkah evakuasi, waktu siaran, sumber |
| Tanpa peringatan | Pesan "Belum ada peringatan resmi untuk wilayah ini" |
| Perubahan | Siarkan/tarik/kedaluwarsa diperbarui lewat channel; kartu hilang atau muncul |
| Aksesibilitas | Status tidak hanya warna; target sentuh 44 px; `aria-live` untuk perubahan |
| Requirement | FR-34, FR-38, FR-R10 |

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

## 13. Parameter Simulator (P-01)

| Aspek | Perilaku |
|---|---|
| Sumber kontrol | Registry parameter: label, satuan, batas, langkah, default, tipe |
| Perubahan | Setelah input berhenti 300 ms, peta, dampak, dan interpretasi diperbarui |
| Batas | Nilai di luar batas ditolak; kontrol kembali ke nilai valid terakhir |
| Reset | Kembali ke baseline tanpa menghapus riwayat interpretasi |
| Keyboard | Slider: panah, Shift+panah, Home, End; switch: Spasi |
| Requirement | FR-39, FR-40 |

## 14. Peta & Dampak Simulator (P-02, P-03)

| Aspek | Perilaku |
|---|---|
| Peta | Heatmap kedalaman per kelurahan; klik membuka detail |
| Dampak | Luas genangan, RW terdampak, puncak, keyakinan vs baseline |
| Grafik opsi | Empat opsi kebijakan; opsi aktif disorot |
| Loading | Skeleton tipis; hasil lama tetap terlihat dengan label |
| Requirement | FR-40 |

## 15. Pemilih Bahasa (Header dan Warga)

| Aspek | Perilaku |
|---|---|
| Pilihan | `ID` dan `EN` |
| Default | English |
| Penyimpanan | `localStorage` kunci `hydrotwin-bahasa` |
| Perubahan | Memuat ulang aplikasi agar UI, angka, dan narasi konsisten |
| Aksesibilitas | `role="group"`, `aria-label`, dan `aria-pressed` per tombol |
| Cakupan | UI, label peta, level risiko, status data, template/AI peringatan, rekomendasi, interpretasi, dan brief |
| Requirement | FR-31 |

## 16. Interpretasi & Executive Brief (P-04)

| Aspek | Perilaku |
|---|---|
| Interpretasi | Otomatis setelah parameter berhenti berubah; hasil usang dibatalkan |
| Sumber | Badge AI/template, model, waktu generasi, dan batasan model |
| Brief | Di-generate on-demand; label "draf, menunggu tinjauan analis" |
| Brief usang | Bila parameter berubah, brief ditandai usang dan perlu generate ulang |
| Ekspor | Salin ke clipboard atau unduh Markdown |
| Fallback | LLM gagal → template deterministik, tetap dapat dibaca dan diekspor |
| Requirement | FR-41–FR-43, FR-R11 |
