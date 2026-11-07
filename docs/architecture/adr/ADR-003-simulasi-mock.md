# ADR-003 — Simulasi Menggunakan Layanan Mock dengan Kontrak Tetap

| Status | Diterima |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim SWE, Tim AI |

## Konteks

Pemodelan hidrologi (Rational Method, routing graf, kalibrasi) dikerjakan terpisah dan belum siap. Dashboard harus bisa didemokan dan dikembangkan sekarang.

## Keputusan

- Dashboard hanya bergantung pada **interface** `simulationService` dengan kontrak tetap (lihat `03-component-frontend.md`).
- Pada prototipe, implementasi berupa mock yang menghasilkan data deterministik dari input slider dan konversi lahan.
- Mock tidak menjelaskan dirinya sebagai model fisik. Label "Mode Latihan" dan status `mock` tampil di UI.
- Ketika model asli siap, cukup membuat implementasi kedua yang memanggil API Simulation Service.

## Alternatif

| Opsi | Alasan ditolak |
|---|---|
| Menulis engine hidrologi lengkap di frontend | Di luar lingkup dashboard; bertentangan dengan pemisahan tugas |
| Data statis untuk semua skenario | Slider tidak responsif; tidak memenuhi FR-07 |
| Menunggu model asli | Menghambat pengembangan UI |

## Konsekuensi

- Kontrak harus stabil. Perubahan kontrak perlu persetujuan Tim AI dan Tim SWE.
- Angka dari mock tidak boleh dikutip sebagai hasil ilmiah di laporan.
- Pengujian UI memakai fixture deterministik agar hasil konsisten.
