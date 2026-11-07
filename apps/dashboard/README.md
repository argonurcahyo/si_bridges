# HydroGraph-AI · Dashboard Operasional

Prototipe frontend dashboard operator BPBD/DSDA. Data dan simulasi masih mock (mode latihan).

Dokumen acuan ada di `docs/` (requirements, ui-prototype, architecture).

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
| `pnpm format`       | Prettier (termasuk urutan class Tailwind) |
| `pnpm format:check` | Cek format tanpa mengubah file            |

## Stack

React 19, Vite, TypeScript (strict), Tailwind CSS v4, shadcn/ui (radix, warna slate), oxlint, Prettier.

## Status fase

- [x] P0 Setup
- [x] P1 Shell & data mock
- [x] P2 Peta
- [x] P3 Simulasi & grafik
- [ ] P4 Grafik & rekomendasi
- [ ] P5 Draf & status
- [ ] P6 Kualitas
