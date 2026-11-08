# Rencana Pengembangan — Dashboard Operasional

Status: **P0–P5 selesai, P6 belum.**
Acuan requirement: FR-01 sampai FR-19, FR-20 sampai FR-25 (panel operator), FR-R1–R5.

---

## 1. Status Fase

| Fase | Isi | Status |
|---|---|---|
| P0 Setup | Vite, React, TypeScript strict, Tailwind v4, shadcn, lint/format, alias `@/` | Selesai |
| P1 Shell & data | Rute `/ops`, layout, banner mode latihan, data node/edge dengan Zod | Selesai |
| P2 Peta | MapLibre, node/edge, layer, 2D/3D, detail node | Selesai |
| P3 Simulasi & grafik | Slider hujan, konversi lahan, skenario cepat, debit, proyeksi | Selesai |
| P4 Rekomendasi | Narasi mock, fallback rule-based, confidence, keputusan, log audit | Selesai |
| P5 Draf & status | Draf peringatan publik, status data/layanan, state khusus | Selesai |
| **P6 Kualitas** | E2E, aksesibilitas, performa, skrip demo, dokumentasi | **Belum** |

---

## 2. Yang Sudah Berjalan

- Peta 2D/3D dengan centerline Ciliwung dari OSM, alur simulasi mengikuti sungai, batas kecamatan/kabupaten/provinsi, hillshade dan terrain DEMNAS.
- Pilihan tampilan koridor: Ciliwung, Pesanggrahan, Jabodetabek.
- Simulasi Rational Method (mock) dengan routing DAG, proyeksi 3–6 jam, dan skor kepastian.
- Rekomendasi taktis lewat adapter LLM mock, timeout 5 detik, validasi angka, fallback rule-based.
- Keputusan operator dan log audit.
- Draf peringatan publik per wilayah (belum terhubung ke halaman publik).
- 50 unit test, lint/typecheck/build hijau.

---

## 3. Sisa Pekerjaan P6

| # | Tugas | Kriteria selesai |
|---|---|---|
| P6.1 | Playwright e2e 3 alur: ubah hujan → peta/grafik berubah; paksa gagal LLM → fallback; keputusan operator → log | Test lulus di CI lokal |
| P6.2 | Audit aksesibilitas (axe + keyboard + kontras), isi `docs/ui-prototype/a11y-checklist.md` | Tidak ada pelanggaran serius |
| P6.3 | Code splitting: pisahkan Recharts dan halaman; target bundle awal ≤ 500 kB | Build report membaik |
| P6.4 | Uji responsif 360/768/1280/1440 px | Tidak ada overflow/terpotong |
| P6.5 | Uji 2 tema (gelap/terang) untuk semua panel | Kontras AA |
| P6.6 | Skrip demo 6–7 menit (`docs/ui-prototype/demo-script.md`) diperbarui sesuai fitur terbaru | Bisa dijalankan tanpa error |
| P6.7 | README screenshot versi final | Galeri sinkron |
| P6.8 | Bersihkan warning Fast Refresh (`SKENARIO_CEPAT` diekspor dari file komponen) | Warning hilang |

---

## 4. Batasan yang Diketahui

| Batasan | Dampak | Rencana |
|---|---|---|
| Semua angka simulasi mock | Tidak bisa dikutip sebagai hasil ilmiah | Ganti `simulationService` dengan layanan nyata |
| Koordinat pintu air hasil snap OSM | Belum terverifikasi DSDA | Verifikasi dengan data resmi |
| Log audit dan keputusan hanya di memori | Hilang saat refresh | Tambah localStorage atau backend |
| Snapshot publik belum ada | Halaman publik belum terhubung | Dikerjakan di `web-publik.md` Q1 |
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
├─ features/alerts/                 Draf peringatan publik
├─ features/status/                 Status data & layanan
├─ services/                        simulation, llm, geo, draft, network, catchment
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
