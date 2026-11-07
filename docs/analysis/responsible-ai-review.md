# Checklist Review Responsible AI

Dipakai sebelum setiap gate dan sebelum demo. Status: `[ ]` belum, `[~]` sebagian, `[x]` lulus.

Pemeriksa: Argo Nurcahyo (Lead Architect), Yovi Maulana Nugraha (UI/UX), Tim AI.

## 1. Human-in-the-loop

- [ ] Tidak ada tombol atau fungsi yang menjalankan aksi pada node, pintu air, atau pompa (FR-R1).
- [ ] Keputusan operator hanya mengubah status dan tercatat di log (FR-25).
- [ ] Teks di UI menyebut sistem sebagai alat bantu keputusan (FR-32).
- [ ] Draf peringatan publik hanya bisa disalin, tidak bisa dikirim (FR-26).

## 2. Confidence

- [ ] Setiap narasi dan proyeksi menampilkan confidence (FR-22).
- [ ] Confidence < 85% memunculkan label "Memerlukan Konfirmasi Petugas Lapangan" (FR-23, FR-R2).
- [ ] Label tersebut tidak bisa disembunyikan oleh pengguna.
- [ ] Cara confidence dihitung dijelaskan singkat di tooltip.

## 3. Fallback

- [ ] Timeout LLM 5 detik diuji (US-12).
- [ ] Fallback rule-based menampilkan badge "Rule-based" (FR-R3).
- [ ] Toggle "paksa gagal" dapat dipakai untuk demo.
- [ ] Dashboard tetap menampilkan rekomendasi saat LLM gagal.

## 4. Transparansi

- [ ] Setiap narasi menampilkan model, waktu generasi, dan ringkasan input (FR-R4).
- [ ] Badge sumber data dan status mock/sintetis tampil di layer terkait (FR-28).
- [ ] Banner "Mode Latihan" tampil di semua layar (FR-29).

## 5. Akurasi & Validasi

- [ ] Angka dalam narasi dicocokkan dengan hasil simulasi (FR-R5).
- [ ] Angka yang tidak cocok memicu fallback.
- [ ] Data mock diberi label dan tidak disajikan sebagai data resmi.

## 6. Bahasa & Dampak Publik

- [ ] Draf peringatan memakai level dan langkah tindakan, bukan kalimat menakutkan (FR-R6).
- [ ] Istilah teknis tidak muncul di draf publik.
- [ ] Setiap draf menyebut sumber dan waktu.

## 7. Keamanan & Privasi

- [ ] Tidak ada API key di kode client (FR-R7, NFR-05).
- [ ] Prompt ke LLM tidak berisi data pribadi.
- [ ] Tidak ada pelacakan lokasi pengguna (NFR-06).

## 8. Ketergantungan

- [ ] Sistem tetap berfungsi tanpa koneksi ke LLM (NFR-07).
- [ ] Model LLM dapat diganti tanpa mengubah UI (adapter).

## Hasil Review

| Tanggal | Pemeriksa | Lulus | Catatan | Tindak lanjut |
|---|---|---|---|---|
| | | | | |
