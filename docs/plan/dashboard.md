# Rencana Pengembangan — Dashboard Operasional

Status: **P0–P5 selesai; P6 sebagian (E2E, a11y, screenshot, demo selesai; performa/responsif tersisa).** Rencana lanjutan dua use case ada di [`ews-simulator.md`](ews-simulator.md).
Acuan requirement: FR-01–FR-26, FR-34–FR-38, FR-R1–R10.

---

## 1. Status Fase

| Fase | Isi | Status |
|---|---|---|
| P0 Setup | Vite, React, TypeScript strict, Tailwind v4, shadcn, lint/format, alias `@/` | Selesai |
| P1 Shell & data | Rute `/ops`, layout, banner mode latihan, data node/edge dengan Zod | Selesai |
| P2 Peta | MapLibre, node/edge, layer, 2D/3D, detail node | Selesai |
| P3 Simulasi & grafik | Slider hujan, konversi lahan, skenario cepat, debit, proyeksi | Selesai |
| P4 Rekomendasi | Narasi mock, fallback rule-based, confidence, keputusan, log audit | Selesai |
| P5 Draf & status | Draf peringatan publik (template), status data/layanan, state khusus | Selesai |
| **P6 Kualitas** | E2E, aksesibilitas, performa, skrip demo, dokumentasi | **Sebagian (F5)** |

---

## 2. Yang Sudah Berjalan

- Peta 2D/3D dengan centerline Ciliwung dari OSM, alur simulasi mengikuti sungai, batas kecamatan/kabupaten/provinsi, hillshade dan terrain DEMNAS.
- Pilihan tampilan koridor: Ciliwung, Pesanggrahan, Jabodetabek.
- Simulasi Rational Method (mock) dengan routing DAG, proyeksi 3–6 jam, dan skor kepastian.
- Rekomendasi taktis lewat adapter LLM mock, timeout 5 detik, validasi angka, fallback rule-based.
- Keputusan operator dan log audit.
- Draf peringatan publik per wilayah (template; belum ada siarkan/tarik ke halaman publik).
- 102 unit test, lint/typecheck/build hijau.

---

## 3. Status Pekerjaan P6

| # | Tugas | Kriteria selesai | Status |
|---|---|---|---|
| P6.1 | E2E (Puppeteer) alur EWS + Simulator | Test lulus lokal | Selesai F5 |
| P6.2 | Audit aksesibilitas axe, isi `docs/ui-prototype/a11y-checklist.md` | Tidak ada pelanggaran serius | Selesai F5 |
| P6.3 | Code splitting: pisahkan Recharts dan halaman; target bundle awal ≤ 500 kB | Build report membaik | Belum |
| P6.4 | Uji responsif 360/768/1280/1440 px | Tidak ada overflow/terpotong | Sebagian |
| P6.5 | Uji 2 tema (gelap/terang) untuk semua panel | Kontras AA | Selesai F5 (axe) |
| P6.6 | Skrip demo 7–8 menit (`docs/ui-prototype/demo-script.md`) diperbarui | Bisa dijalankan tanpa error | Selesai F5 |
| P6.7 | README screenshot versi final | Galeri sinkron | Selesai F5 |
| P6.8 | Bersihkan warning Fast Refresh (`SKENARIO_CEPAT` diekspor dari file komponen) | Warning hilang | Belum |

---

## 4. Batasan yang Diketahui

| Batasan | Dampak | Rencana |
|---|---|---|
| Semua angka simulasi mock | Tidak bisa dikutip sebagai hasil ilmiah | Ganti `simulationService` dengan layanan nyata |
| Koordinat pintu air hasil snap OSM | Belum terverifikasi DSDA | Verifikasi dengan data resmi |
| Log audit dan keputusan hanya di memori | Hilang saat refresh | Tambah localStorage atau backend |
| Publikasi peringatan per wilayah belum ada | Halaman publik belum membaca peringatan tersiar | Dikerjakan di `ews-simulator.md` F1–F2 |
| Terrain di luar koridor resolusi kasar (z10–11) | Relief kurang detail di Jabodetabek | Tambah tile bila perlu |
| Service worker belum ada | Belum ada mode offline | Dikerjakan di `web-publik.md` Q6, bisa dipakai ulang |

---

## 5. Peta File Utama

```
apps/dashboard/src/
├─ pages/OpsDashboardPage.tsx       Halaman dashboard
├─ features/map/                    MapView, MapPanel, layer
├─ features/simulation/             Slider, konversi, skenario, panel
├─ features/charts/                 DischargeChart, ProjectionChart
├─ features/recommendation/         Narasi, keputusan, log audit
├─ features/alerts/                 Panel peringatan publik
├─ features/status/                 Status data & layanan
├─ services/                        simulation, llm, geo, alert, publication, network, catchment
├─ engine/                          runoff, routing, projection, confidence, riskLevel
├─ store/                           simulationStore, operatorStore
└─ data/                            network.json, catchments.json
scripts/                            build-geo, build-sungai-osm, build-terrain, screenshots
```

---

## 6. Definisi Selesai Dashboard

- Semua FR prioritas "M" terpenuhi.
- E2E dan audit aksesibilitas lulus.
- Build produksi berjalan dan ukuran bundle terkendali.
- Panduan demo dan screenshot final tersedia.

---

## 7. Integrasi HydroTwin-AI

Dashboard operator tetap berjalan. Sejak 18 November 2026, pengembangan diarahkan ke dua use case: **Early Warning System** dan **Simulator** (lihat [`ews-simulator.md`](ews-simulator.md)).

| Bagian | Status | Catatan |
|---|---|---|
| Data kelurahan | Selesai | 237 kelurahan dari SHP BPS 2020, dipotong ke koridor; `scripts/build-kelurahan-geo.py` |
| Heatmap kedalaman | Selesai | Layer MapLibre `kelurahan-fill`, warna sesuai `kedalamanM`, hover dan klik |
| Parameter skenario | Selesai | Hujan 24 jam, pasang, RTH, moratorium; store terpisah dari simulasi operator |
| Dampak skenario | Selesai | Luas genangan, RW terdampak, puncak, keyakinan, grafik empat opsi |
| Executive Brief | Selesai F4 | AI mock + fallback template, provenance, ekspor Markdown |
| PWA warga | Selesai F1–F2 | Rute `/warga`, kartu mobile, hanya peringatan per wilayah yang disiarkan, teks AI/template, empty state resmi |
| Navigasi | Selesai | Header: Operator, Perencana, Warga |
| Publikasi peringatan per wilayah | Selesai F1–F2 | AI composer, validator angka/tone, fallback template, sunting, siarkan/tarik, kedaluwarsa, audit per wilayah |
| Registry parameter simulator | Selesai F3 | Panel dinamis dari registry; tambah parameter tanpa ubah struktur panel |
| Interpretasi AI simulator | Selesai F4 | Otomatis per skenario, provenance, fallback template |
| Kualitas | Sebagian | E2E, axe, screenshot, demo selesai; performa, responsif penuh, warning Fast Refresh tersisa |

### Batasan yang disengaja

- Model kedalaman masih mock (`engine/planner.ts`), bukan HEC-RAS/GNN.
- Angka RW adalah perkiraan dari luas kelurahan, bukan data RW resmi.
- PWA warga belum memakai service worker atau cache offline.
- Peringatan F2 memakai AI mock dengan validator angka/tone dan fallback template; provider produksi belum dipasang.
- Payload peringatan belum mengisi kedalaman karena simulasi operator berbasis debit; `kedalamanM` masih `null`.
- Interpretasi dan Executive Brief memakai AI mock dengan validator dan fallback template; provider produksi belum dipasang.
- Tidak ada SMS/WhatsApp/push notification; "siarkan" berarti publikasi ke feed prototipe.

