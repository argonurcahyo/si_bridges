# Checklist Review Responsible AI

Dipakai sebelum setiap gate dan sebelum demo. Status: `[ ]` belum, `[~]` sebagian, `[x]` lulus.

Pemeriksa: Argo Nurcahyo (Lead Architect), Yovi Maulana Nugraha (UI/UX), Tim AI.

## 1. Human-in-the-loop

- [ ] Tidak ada tombol atau fungsi yang menjalankan aksi pada node, pintu air, atau pompa (FR-R1).
- [ ] Keputusan operator hanya mengubah status dan tercatat di log (FR-25).
- [ ] Teks di UI menyebut sistem sebagai alat bantu keputusan (FR-32).
- [ ] Peringatan publik hanya dapat dibaca warga setelah operator menekan **Siarkan** (FR-34, FR-R10).
- [ ] Operator dapat menyunting pesan AI; teks AI asli dan teks final tercatat (FR-R9).
- [ ] Keputusan rekomendasi taktis tidak otomatis menjadi persetujuan peringatan publik.

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
- [ ] Pesan peringatan tetap tersedia memakai template saat LLM gagal/timeout/menyimpang.
- [ ] Alasan fallback dan sumber template tampil di panel operator.

## 4. Transparansi

- [ ] Setiap narasi menampilkan model, waktu generasi, dan ringkasan input (FR-R4).
- [ ] Badge sumber data dan status mock/sintetis tampil di layer terkait (FR-28).
- [ ] Banner "Mode Latihan" tampil di semua layar (FR-29).

## 5. Akurasi & Validasi

- [ ] Angka dalam narasi dicocokkan dengan hasil simulasi (FR-R5).
- [ ] Angka yang tidak cocok memicu fallback.
- [ ] Data mock diberi label dan tidak disajikan sebagai data resmi.

## 6. Bahasa & Dampak Publik

- [ ] Pesan peringatan memakai level dan langkah tindakan, bukan kalimat menakutkan (FR-R6).
- [ ] Istilah teknis tidak muncul di pesan publik.
- [ ] Setiap peringatan menyebut sumber dan waktu siaran.
- [ ] AI tidak menaikkan atau menurunkan level risiko; level berasal dari hasil pemodelan (FR-R8).
- [ ] Hanya level waspada/siaga yang dapat disiarkan.
- [ ] Validator tone menolak kalimat yang menimbulkan kepanikan dan memicu template.

## 7. Publikasi & Konsistensi

- [ ] Hanya peringatan berstatus `disiarkan` yang tampil di halaman warga (FR-34).
- [ ] Satu wilayah hanya memiliki satu peringatan aktif (NFR-13).
- [ ] Menarik peringatan langsung menghilangkannya dari warga (FR-35).
- [ ] Peringatan kedaluwarsa setelah 6 jam atau saat digantikan siaran baru (FR-36).
- [ ] Perubahan siarkan/tarik tercatat di audit (FR-37).
- [ ] Halaman warga tanpa peringatan menampilkan pesan resmi, bukan simulasi (FR-38).

## 8. Simulator & Executive Brief

- [ ] Interpretasi dan brief diberi label draf AI, bukan keputusan kebijakan (FR-R11).
- [ ] Angka interpretasi dan brief divalidasi terhadap hasil simulasi (FR-R5).
- [ ] Fallback template tersedia saat LLM gagal (FR-R3).
- [ ] Keterbatasan model mock dinyatakan di brief.
- [ ] Brief yang sudah usang ditandai dan tidak disajikan sebagai hasil final.

## 9. Keamanan & Privasi

- [ ] Tidak ada API key di kode client (FR-R7, NFR-05).
- [ ] Prompt ke LLM tidak berisi data pribadi.
- [ ] Tidak ada pelacakan lokasi pengguna (NFR-06).

## 10. Ketergantungan

- [ ] Sistem tetap berfungsi tanpa koneksi ke LLM (NFR-07).
- [ ] Model LLM dapat diganti tanpa mengubah UI (adapter).

## Hasil Review

| Tanggal | Pemeriksa | Lulus | Catatan | Tindak lanjut |
|---|---|---|---|---|
| | | | | |
