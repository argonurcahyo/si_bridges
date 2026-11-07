# Checklist Aksesibilitas — Dashboard Operasional

Acuan: WCAG 2.1 AA (NFR-04). Dicek sebelum demo dan sebelum setiap gate.

Pemeriksa: Yovi Maulana Nugraha (UI/UX), Argo Nurcahyo (review).

## 1. Kontras

- [ ] Teks normal ≥ 4,5:1 di tema gelap dan terang.
- [ ] Teks besar (≥ 18 px atau ≥ 14 px tebal) ≥ 3:1.
- [ ] Ikon status dan batas komponen ≥ 3:1.
- [ ] Warna level (Aman, Waspada, Siaga) juga diberi ikon dan teks.
- [ ] Heatmap diuji dengan simulasi buta warna merah-hijau.

## 2. Keyboard

- [ ] Semua kontrol bisa dijangkau dengan Tab dan Shift+Tab.
- [ ] Urutan fokus mengikuti urutan visual.
- [ ] Fokus terlihat (outline minimal 2 px).
- [ ] Slider dapat dikontrol dengan panah, Shift+panah, Home, dan End.
- [ ] Sheet dan dialog menjebak fokus dan kembali ke pemicu saat ditutup.
- [ ] Tidak ada keyboard trap di peta. Peta dapat dilewati dengan tombol "Lewati peta".
- [ ] Shortcut (jika ada) dapat dinonaktifkan.

## 3. Screen Reader

- [ ] Setiap tombol dan ikon memiliki nama yang jelas.
- [ ] Slider memiliki `aria-valuetext` dengan satuan.
- [ ] Badge sumber dan confidence dibacakan sebagai teks.
- [ ] Toast diumumkan dengan `role="status"` atau `aria-live="polite"`.
- [ ] Perubahan simulasi diumumkan secara ringkas (tidak setiap ketukan slider).
- [ ] Peta memiliki alternatif daftar segmen (O-08a) dan dapat dibaca.
- [ ] Grafik memiliki ringkasan teks di bawahnya.

## 4. Struktur

- [ ] Heading dengan urutan benar (h1, h2, h3).
- [ ] Landmark: header, main, nav, aside, footer.
- [ ] Tabel memiliki header kolom.
- [ ] Bahasa halaman diatur ke `id`.

## 5. Gerak & Waktu

- [ ] Animasi dapat dimatikan (`prefers-reduced-motion`).
- [ ] Tidak ada animasi berkedip lebih dari 3 kali per detik.
- [ ] Playback historis dapat dijeda.
- [ ] Notifikasi tidak hilang sebelum 6 detik.

## 6. Bahasa & Teks

- [ ] Teks UI dalam Bahasa Indonesia.
- [ ] Istilah teknis (TMA, LULC, C-value) memiliki tooltip penjelasan.
- [ ] Satuan selalu ditulis.
- [ ] Pesan error menjelaskan langkah berikutnya.

## 7. Target Sentuh (Tablet)

- [ ] Target sentuh minimal 44 × 44 px.
- [ ] Jarak antartombol minimal 8 px.
- [ ] Slider thumb minimal 24 px.

## 8. Responsif

- [ ] Layout diuji di 768 px, 1280 px, dan 1440 px.
- [ ] Zoom 200% tidak menyebabkan konten terpotong.
- [ ] Teks dapat diperbesar tanpa kehilangan fungsi.

## Hasil

| Tanggal | Pemeriksa | Lulus | Gagal | Catatan |
|---|---|---|---|---|
| | | | | |
