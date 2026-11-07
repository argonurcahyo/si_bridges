# ADR-002 — Library Peta: MapLibre GL JS

| Status | Diterima (sementara untuk mode 3D) |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim SWE, disetujui Argo Nurcahyo |

## Konteks

Dashboard membutuhkan peta 2D dan mode 3D sederhana dengan terrain DEMNAS, banyak polygon kelurahan, dan node/edge graf. Proposal menyebut Mapbox GL JS, tetapi memerlukan token dan lisensi.

## Keputusan

**MapLibre GL JS** sebagai library peta utama.

- Gratis dan open source, tanpa token.
- Mendukung vector tile, GeoJSON, dan terrain (`raster-dem`).
- API hampir sama dengan Mapbox GL JS, sehingga perpindahan tetap mungkin.
- Dibungkus dalam `MapProvider` agar library dapat diganti dengan mudah.

Mode 3D bersifat sementara: pakai terrain DEMNAS bila tile tersedia, jika tidak, gunakan extrusion sederhana. Dievaluasi ulang saat data DEMNAS siap (lihat `risks.md` I-02).

## Alternatif

| Opsi | Kelebihan | Kekurangan | Alasan ditolak |
|---|---|---|---|
| Mapbox GL JS | Sesuai proposal, fitur lengkap | Butuh token dan kredit | Biaya dan ketergantungan vendor |
| Leaflet | Sederhana, banyak plugin | Tidak ada 3D, performa turun pada banyak polygon | Mode 3D tidak tercapai |
| OpenLayers | Kemampuan GIS paling lengkap | API kompleks | Kurva belajar tinggi |
| MapLibre + deck.gl | Layer besar sangat kuat | Bundle besar | Belum dibutuhkan, dicadangkan bila performa kurang |

## Konsekuensi

- Basemap perlu sumber tile yang lisensinya jelas. Dicatat di `risks.md`.
- Heatmap kelurahan dibuat dengan fill layer, bukan heatmap native.
- Jika mode 3D terbukti berat, keputusan ditinjau ulang dan 3D dikeluarkan dari MVP.
