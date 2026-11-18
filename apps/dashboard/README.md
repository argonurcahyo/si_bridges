# HydroTwin-AI · Prototipe Frontend

Prototipe frontend HydroTwin-AI dengan dua use case dan tiga tampilan:

| Rute | Tampilan | Use case | Isi |
|---|---|---|---|
| `/ops` | Dashboard Operasional | EWS | Monitoring TMA, simulasi debit, peta 2D/3D, rekomendasi, keputusan operator, log audit |
| `/warga` | PWA Warga | EWS | Kartu peringatan mobile: level, estimasi tiba, puncak, teks final, langkah evakuasi |
| `/rencana` | Konsol Perencana | Simulator | Parameter skenario, heatmap kedalaman per kelurahan, dampak skenario, Executive Brief |

Data dan simulasi masih mock (mode latihan). Semua angka diberi label mock atau ilustratif.

Bahasa default adalah **English**; tombol ID/EN di header dan halaman warga menyimpan preferensi di `localStorage` (`hydrotwin-bahasa`) lalu memuat ulang aplikasi.

Dokumen acuan ada di `docs/` (requirements, ui-prototype, architecture, plan). Rencana dua use case: `docs/plan/ews-simulator.md`.

## Menjalankan

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

## Skrip

| Perintah            | Fungsi                                    |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Server pengembangan                       |
| `pnpm build`        | Typecheck lalu build produksi             |
| `pnpm lint`         | oxlint                                    |
| `pnpm typecheck`    | `tsc -b`                                  |
| `pnpm test`         | Vitest                                    |
| `pnpm test:e2e`     | E2E EWS + Simulator (Puppeteer, Chrome)   |
| `pnpm audit:a11y`   | Audit axe-core, laporan Markdown          |
| `pnpm format`       | Prettier (termasuk urutan class Tailwind) |
| `pnpm format:check` | Cek format tanpa mengubah file            |

## Stack

React 19, Vite, TypeScript (strict), Tailwind CSS v4, shadcn/ui (radix, warna slate), MapLibre GL JS, Recharts, Zustand, TanStack Query, oxlint, Prettier.

## Data kelurahan

`public/geo/kelurahan-koridor.geojson` berisi 237 kelurahan dari empat kota/kabupaten koridor (Jakarta Selatan, Jakarta Timur, Jakarta Pusat, Kota Depok), dipotong dari SHP BPS 2020. Bangun ulang dengan:

```bash
python scripts/build-kelurahan-geo.py
```

Properti: `kelurahan`, `kecamatan`, `kota`, `luasHa`, `jarakSungaiM`, dan `rw` (perkiraan mock).

## Status fase

- [x] P0 Setup
- [x] P1 Shell & data mock
- [x] P2 Peta
- [x] P3 Simulasi & grafik
- [x] P4 Rekomendasi & keputusan
- [x] P5 Draf & status
- [x] P6 Konsol perencana & heatmap kelurahan
- [x] P7 PWA warga
- [~] P8 Kualitas (E2E & a11y selesai; performa tersisa)
- [x] F0 Dokumen EWS & Simulator (18 November 2026)
- [x] F1 Publikasi peringatan per wilayah (18 November 2026)
- [x] F2 AI composer peringatan (18 November 2026)
- [x] F3 Registry parameter simulator (18 November 2026)
- [x] F4 AI interpretasi & Executive Brief (18 November 2026)
- [x] F5 E2E, audit aksesibilitas, screenshot, demo (19 November 2026)
- [x] F6 Bilingual UI English/Indonesia (19 November 2026)

## Tangkapan layar

![Konsol perencana](../../docs/ui-prototype/screenshots/12-konsol-perencana.png)

![PWA warga](../../docs/ui-prototype/screenshots/11-warga-pwa.png)

![Dashboard operator](../../docs/ui-prototype/screenshots/01-overview.png)

Galeri lengkap dan penjelasan per komponen ada di `docs/ui-prototype/README.md`.
