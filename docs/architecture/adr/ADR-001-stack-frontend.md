# ADR-001 — Stack Frontend: React, Vite, TypeScript, Tailwind, shadcn/ui

| Status | Diterima |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim SWE |

## Konteks

Dashboard operator harus interaktif (peta, slider, grafik), mudah dikembangkan oleh dua anggota tim SWE, dan menghasilkan mockup visual yang bisa langsung menjadi prototipe. Anggota tim belum sepenuhnya familiar dengan semua framework.

## Keputusan

- **React 19** dengan **TypeScript strict**.
- **Vite** sebagai bundler.
- **Tailwind CSS v4** untuk styling.
- **shadcn/ui** sebagai sumber komponen. Kode komponen disalin ke repo, bukan dependency.
- **React Router** untuk routing.

## Alternatif

| Opsi | Kelebihan | Kekurangan | Alasan ditolak |
|---|---|---|---|
| Next.js | SSR, routing bawaan | Berat untuk SPA dashboard tanpa SSR | Tidak ada kebutuhan SEO di dashboard |
| Vue + Vuetify | Ekosistem baik | Komponen shadcn tidak tersedia | Bertentangan dengan keputusan UI |
| Angular | Lengkap | Kurva belajar tinggi | Tidak sesuai waktu proyek |
| Svelte | Ringan | Ekosistem komponen lebih kecil | Komponen shadcn tidak tersedia |

## Konsekuensi

- Tim dapat mengubah komponen shadcn secara langsung. Perubahan besar dicatat di commit.
- Build statis sehingga mudah dihosting.
- Dokumen `01-rules.md` dan `03-dependencies.md` berlaku.
