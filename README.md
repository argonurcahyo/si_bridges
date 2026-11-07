# HydroGraph-AI

Sistem informasi pemantauan, prediksi limpasan mikro, dan generator skenario mitigasi banjir Jakarta berbasis jaringan graf hidrologi dan foundation model AI.

Repositori ini berisi **artefak analisis, arsitektur, dan prototipe Dashboard Operasional** untuk tim HydroAI Labs (SI Bridges Indonesia). Fokus tahap ini: dashboard operator BPBD/DSDA. Web publik dan pemodelan hidrologi penuh berada di luar lingkup.

> **Semua data pada prototipe adalah mock.** Sistem ini alat bantu keputusan (DSS); keputusan akhir ada pada petugas berwenang.

## Tangkapan Layar

### Tampilan keseluruhan

![Tampilan keseluruhan dashboard](docs/ui-prototype/screenshots/01-overview.png)

### Panel simulasi

![Panel simulasi](docs/ui-prototype/screenshots/02-panel-simulasi.png)

### Peta jaringan (2D)

![Peta 2D](docs/ui-prototype/screenshots/03-panel-peta.png)

### Grafik debit dan proyeksi

![Grafik debit dan proyeksi](docs/ui-prototype/screenshots/04-panel-grafik.png)

### Rekomendasi taktis

![Rekomendasi taktis](docs/ui-prototype/screenshots/05-panel-rekomendasi.png)

### Log keputusan

![Log keputusan](docs/ui-prototype/screenshots/06-log-keputusan.png)

### Detail node

![Detail node](docs/ui-prototype/screenshots/07-detail-node.png)

### Draf peringatan publik

![Draf peringatan publik](docs/ui-prototype/screenshots/08-draf-peringatan.png)

### Status data dan layanan

![Status data dan layanan](docs/ui-prototype/screenshots/09-status-data.png)

### Mode 3D (terrain DEMNAS)

![Mode 3D](docs/ui-prototype/screenshots/10-mode-3d.png)

Penjelasan tiap komponen ada di [`docs/ui-prototype/README.md`](docs/ui-prototype/README.md).

## Fitur Prototipe

- Peta interaktif 2D/3D: centerline Ciliwung, alur simulasi mengikuti sungai, node berwarna level risiko, batas kecamatan/kabupaten/provinsi, basemap OSM di luar cakupan.
- Pilihan tampilan koridor: Ciliwung, Pesanggrahan, Jabodetabek.
- Simulasi: slider intensitas hujan, konversi lahan Depok, tiga skenario cepat, debit hilir, dan skor kepastian.
- Grafik debit per node (baseline vs skenario) dan proyeksi volume 3–6 jam.
- Rekomendasi taktis dari adapter LLM (mock) dengan fallback rule-based, timeout 5 detik, dan validasi angka.
- Keputusan operator (Diterima/Ditolak/Perlu Verifikasi) dan log audit.
- Draf peringatan publik per wilayah, hanya untuk disalin, tanpa pengiriman otomatis.
- Status data & layanan, label data mock/sintetis/open data.
- Mode 3D memakai terrain DEMNAS (skala vertikal 2×–8×).

## Menjalankan Prototipe

Prasyarat: Node.js 22+, pnpm 9+.

```bash
cd apps/dashboard
cp .env.example .env.local
pnpm install
pnpm dev
```

Buka `http://localhost:5173/ops`.

Perintah lain:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Struktur Repositori

```
apps/dashboard/        Prototipe React (Vite, Tailwind, shadcn/ui, MapLibre)
  public/geo/          GeoJSON hasil build (kecamatan, kabupaten, provinsi, Ciliwung, alur)
  public/terrain/      Tile terrain-RGB dari DEMNAS
  scripts/             Skrip pembangunan data dan screenshot
docs/                  Artefak analisis, arsitektur, dan UI
  analysis/            Requirement, use case, user story, DFD, state, ERD
  architecture/        C4, deployment, sequence, ADR
  diagrams/            Diagram .drawio
  ui-prototype/        Wireframe, design token, interaksi, screenshot
data/                  Data sumber lokal (SHP, DEMNAS) — tidak masuk repo
```

## Data

| Data | Sumber | Status |
|---|---|---|
| Batas kecamatan/kabupaten/provinsi | Peta Kita (SHP) | Open data |
| Elevasi | DEMNAS (BIG) | Open data |
| Centerline Ciliwung | OpenStreetMap (ODbL) | Open data |
| Sungai Pesanggrahan | OpenStreetMap (ODbL) | Open data |
| TMA, hujan, tutupan lahan, debit | Generator internal | Mock/sintetis |

Catatan:
- Koordinat pintu air hasil snap ke centerline OSM dan **belum diverifikasi DSDA**.
- Basemap OSM memerlukan internet.
- Data sumber berukuran besar berada di `data/` dan diabaikan git.

## Dokumentasi

- [Dokumentasi lengkap](docs/README.md)
- [Requirement](docs/analysis/requirements.md)
- [Arsitektur](docs/architecture/01-context.md)
- [UI prototipe & screenshot](docs/ui-prototype/README.md)

## Tim

HydroAI Labs — Argo Nurcahyo, Yovi Maulana Nugraha, Jhonathan Putro Siahaan, Eka Miftakhul Rachmawati, Meidiana Rahmawati.
