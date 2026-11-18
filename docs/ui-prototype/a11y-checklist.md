# Checklist Aksesibilitas — HydroTwin-AI (EWS & Simulator)

Acuan: WCAG 2.1 AA (NFR-04). Status: `[ ]` belum, `[~]` sebagian, `[x]` lulus.

Audit otomatis F5: **2026-11-19**, axe-core 4.14.1, 5 target (termasuk tema gelap), **0 pelanggaran serious/critical**. Detail: [`a11y-report.md`](a11y-report.md).

## 1. Kontras

- [x] Teks normal ≥ 4,5:1 di tema gelap dan terang (axe).
- [x] Teks besar (≥ 18 px atau ≥ 14 px tebal) ≥ 3:1 (axe).
- [x] Ikon status dan batas komponen ≥ 3:1 (axe).
- [x] Warna level (Aman, Waspada, Siaga) juga diberi ikon dan teks.
- [~] Heatmap diuji dengan simulasi buta warna merah-hijau; belum ada uji khusus.

## 2. Keyboard

- [~] Semua kontrol bisa dijangkau dengan Tab dan Shift+Tab; belum diuji penuh.
- [~] Urutan fokus mengikuti urutan visual; belum diuji penuh.
- [x] Fokus terlihat (outline minimal 2 px) pada komponen utama.
- [x] Slider dapat dikontrol dengan panah, Shift+panah, Home, dan End.
- [x] Sheet dan dialog memakai Radix: fokus terjebak dan kembali ke pemicu.
- [~] Tidak ada keyboard trap di peta; tombol lewati peta belum diuji manual.
- [x] Tidak ada shortcut global yang perlu dinonaktifkan.

## 3. Screen Reader

- [x] Setiap tombol dan ikon memiliki nama yang jelas (axe).
- [x] Slider memiliki nama dan `aria-valuetext` dengan satuan.
- [x] Badge sumber dan confidence dibacakan sebagai teks.
- [x] Toast/status memakai `role="status"` atau `aria-live="polite"`.
- [x] Perubahan siarkan/tarik diumumkan lewat area live.
- [~] Peta memiliki alternatif daftar; pembacaan layar penuh belum diuji.
- [x] Grafik memiliki ringkasan teks atau label.

## 4. Struktur

- [x] Heading dengan urutan benar di halaman utama (axe).
- [x] Landmark: header, main, nav, aside, footer (axe).
- [x] Tabel memiliki header kolom.
- [x] Bahasa halaman diatur ke `id`.

## 5. Gerak & Waktu

- [x] Animasi dapat dimatikan (`prefers-reduced-motion`).
- [x] Tidak ada animasi berkedip lebih dari 3 kali per detik.
- [x] Playback historis dapat dijeda.
- [x] Notifikasi tidak hilang sebelum 6 detik.

## 6. Bahasa & Teks

- [x] Teks UI tersedia dalam English dan Bahasa Indonesia; default English.
- [~] Istilah teknis (TMA, LULC, C-value) memiliki tooltip penjelasan; sebagian.
- [x] Satuan selalu ditulis.
- [x] Pesan error menjelaskan langkah berikutnya.

## 7. Target Sentuh (Mobile)

- [~] Target sentuh minimal 44 × 44 px; kontrol utama warga sudah besar, audit ukuran menyeluruh belum.
- [~] Jarak antartombol minimal 8 px; belum diukur menyeluruh.
- [x] Slider thumb memiliki area sentuh yang cukup.

## 8. Responsif

- [x] Layout operator diuji di 1440 px dan audit desktop.
- [x] Halaman warga diuji di 430 px pada E2E dan audit.
- [~] 360 px, 768 px, dan zoom 200% belum diuji menyeluruh.
- [x] Teks dapat diperbesar tanpa kehilangan fungsi utama.

## Hasil

| Tanggal | Pemeriksa | Lulus | Gagal | Catatan |
|---|---|---|---|---|
| 2026-11-19 | Tim SWE | 5 target axe | 0 serious/critical | Uji keyboard, screen reader, dan buta warna manual belum lengkap |
