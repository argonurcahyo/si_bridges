# Rencana Pengembangan — Web Publik

Status: **disetujui, direvisi 18 November 2026.** Publikasi peringatan mengikuti [`ews-simulator.md`](ews-simulator.md); dokumen ini mengatur perluasan halaman masyarakat (zonasi desa, GPS, offline).
Acuan requirement: FR-26, FR-34–FR-38, FR-R6, FR-R9, FR-R10 di [`docs/analysis/requirements.md`](../analysis/requirements.md).
Lingkup: halaman masyarakat. Dashboard operator dan simulator diatur di rencana terpisah.

---

## 1. Ringkasan

Web publik adalah halaman ringan untuk warga di bantaran Ciliwung. Isinya: peringatan resmi per wilayah, estimasi waktu tiba air, langkah evakuasi, kontak darurat, dan (pada fase perluasan) peta zonasi desa.

Prinsipnya: **informasi resmi dari operator, bukan langsung dari simulasi.** Warga hanya melihat peringatan per wilayah yang sudah disiarkan operator. AI boleh menyusun pesan, operator boleh menyunting, dan hanya status `disiarkan` yang dapat dibaca warga.

---

## 2. Keputusan Final

| # | Topik | Keputusan |
|---|---|---|
| D-01 | Sumber status | Peringatan per wilayah yang disiarkan operator (bukan simulasi langsung) |
| D-02 | Granularitas | Desa/kelurahan, dari SHP `idn_admbnda_adm4_bps_20200401.shp` |
| D-03 | Di luar koridor | Ditandai "di luar cakupan simulasi", tanpa level risiko |
| D-04 | Basemap | OSM, dengan fallback peta polos saat offline/tile gagal |
| D-05 | Nomor darurat | 112 (darurat, gratis 24 jam) dan (021) 6344766 (kantor BPBD DKI) |
| D-06 | Struktur aplikasi | Satu aplikasi, rute publik dengan lazy loading |
| D-07 | Cakupan publikasi | Per wilayah. Operator menyiarkan/menarik peringatan per kelurahan; satu wilayah hanya punya satu peringatan aktif. |
| D-08 | Penyusun pesan | AI menyusun pesan; operator dapat menyunting sebelum menyiarkan. Teks AI asli dan teks final disimpan. |
| D-09 | Kanal distribusi | Feed peringatan publik (localStorage + BroadcastChannel pada prototipe). Bukan SMS/WhatsApp/push. |

---

## 3. Batas Lingkup

### Termasuk
- Rute publik `/` dan `/tentang`.
- Kartu peringatan wilayah, peta zonasi, lokasi GPS, pilihan wilayah manual.
- Langkah evakuasi, kontak darurat.
- Sinkronisasi daftar peringatan aktif dari dashboard.
- Mode offline dasar (app shell, data, tile terbatas).
- Pengujian mobile dan aksesibilitas.

### Tidak termasuk
- Model hidrologi per desa (zona mengikuti node hilir).
- Pengiriman SMS/WhatsApp/push notification.
- Autentikasi warga.
- Halaman berita/edukasi selain Tentang.
- Penyusunan dan persetujuan peringatan; itu ada di dashboard operator (`ews-simulator.md`).

---

## 4. Rute & Layout

| Rute | Halaman | Catatan |
|---|---|---|
| `/` | Halaman publik | Menggantikan redirect ke `/ops` |
| `/tentang` | Tentang, sumber data, glosarium, disclaimer | Bisa diakses dari footer |
| `/warga` | Pratinjau PWA warga | Dipertahankan untuk demo dan pengujian mobile |
| `/ops` dan turunannya | Dashboard operator | Tidak berubah |

`/` saat ini berisi `<Navigate to="/ops">`. Akan diganti dengan `PublicPage`.

Layout publik (mobile-first, 360 px):
1. Header ringkas: nama sistem, badge "Peringatan resmi terakhir: HH:MM WIB", tombol "Lokasi saya".
2. Kartu peringatan utama: level besar + ikon, wilayah, estimasi air tiba, waktu siaran.
3. Peta zonasi (tinggi ± 40vh, tap untuk pilih wilayah).
4. Langkah evakuasi (checklist 3–5 poin sesuai level).
5. Kontak darurat (112 dan kantor BPBD).
6. Footer: disclaimer, sumber, tautan Tentang.

Desktop: kartu peringatan di kiri, peta di kanan.

Pemilihan wilayah manual memakai combobox pencarian desa (bukan dropdown 237 item). Wilayah tanpa peringatan aktif menampilkan empty state resmi, bukan simulasi.

---

## 5. Peringatan Publik per Wilayah

### 5.1 Bentuk data

```ts
type PeringatanPublik = {
  id: string;                    // PRG-<timestamp>
  wilayahKode: string;           // ADM4_PCODE
  wilayah: string;
  kecamatan: string;
  kota: string;
  nodeId: string;                // node hilir acuan
  level: "waspada" | "siaga";
  kedalamanM: number | null;
  estimasiTibaMenit: number | null;
  puncakJam: number;
  teks: string;                  // teks final setelah suntingan operator
  sumberNarasi: "llm" | "template";
  modelLabel: string;
  keyakinan: number;
  disiarkanPada: string;         // ISO, ditampilkan sebagai WIB
  disiarkanOleh: string;
  berlakuHingga: string;         // ISO, TTL 6 jam
};

type IndeksPeringatanPublik = {
  diperbaruiPada: string;
  peringatan: PeringatanPublik[]; // satu per wilayah
};
```

- Hanya peringatan level `waspada`/`siaga` yang masuk indeks.
- `estimasiTibaMenit` null untuk level waspada tanpa estimasi yang valid.
- Hanya desa di dalam 4 kota koridor yang dapat menerima peringatan.
- Desa di luar indeks dianggap "di luar cakupan" oleh UI.

### 5.2 Alur publikasi

1. Operator membuka panel peringatan (O-06) untuk hasil simulasi terkini.
2. AI menyusun pesan per wilayah; operator dapat menyunting.
3. Operator menekan **Siarkan** pada peringatan wilayah tertentu.
4. Sistem menyimpan peringatan berstatus `disiarkan`, teks final, operator, dan waktu.
5. Indeks peringatan aktif disimpan di `localStorage` kunci `hydrotwin-peringatan-publik`.
6. Perubahan disiarkan lewat `BroadcastChannel("hydrotwin-publik")`.
7. Halaman publik mendengar channel dan memuat ulang indeks.
8. Operator dapat menekan **Tarik**; peringatan hilang dari indeks dan halaman publik.

Aturan:
- Siaran baru untuk wilayah yang sama menggantikan peringatan lama.
- Peringatan kedaluwarsa setelah 6 jam atau saat digantikan siaran baru.
- Tombol siarkan nonaktif bila tidak ada kandidat waspada/siaga atau pesan gagal divalidasi.
- Setiap siarkan, tarik, sunting, dan kedaluwarsa dicatat di log audit.
- Tanpa peringatan aktif: halaman publik menampilkan "Belum ada peringatan resmi untuk wilayah ini."

### 5.3 Batasan prototipe

localStorage + BroadcastChannel hanya berlaku di browser yang sama. Untuk produksi, indeks peringatan dan kanal distribusi harus lewat backend. Ini dicatat di Tentang dan di dokumen arsitektur.

---

## 6. Data Desa

### 6.1 Sumber

`data/shp/idn_admbnda_adm4_bps_20200401.shp`

- 81.912 desa seluruh Indonesia, EPSG:4326.
- Kolom dipakai: `ADM4_EN`, `ADM4_PCODE`, `ADM3_EN`, `ADM2_EN`.
- Kolom pemilu (`paslon1..3`, `victor`, `total`, `victor_prc`) dibuang.
- Terverifikasi: 237 desa di 4 kota koridor (Depok 63, Jakpus 44, Jaksel 65, Jaktim 65).

### 6.2 Skrip `apps/dashboard/scripts/build-desa.py`

1. Baca SHP dengan filter `ADM2_EN` di 4 kota koridor.
2. Buang kolom yang tidak dipakai.
3. Simplifikasi geometri (target total < 1 MB).
4. Tulis `public/geo/desa-koridor.geojson` dengan field `desa`, `kode`, `kecamatan`, `kota`.
5. Hitung centroid desa, proyeksikan ke centerline Ciliwung (`ciliwung.geojson`).
6. Tentukan node hilir: node terdekat di hilir dari posisi proyeksi.
7. Simpan `public/geo/desa-node.json`: `{ desaId, nodeId, jarakKeSungaiM, posisiKm }`.
8. Cetak ringkasan: jumlah desa per node, desa tanpa node.

### 6.3 Estimasi tiba

`estimasiTibaMenit = lagKumulatif(node) + (posisiDesaKm - posisiNodeKm) / kecepatan`

- `kecepatan` = 3 m/s (asumsi sama dengan lag edge).
- Nilai dibulatkan ke 5 menit, minimal 15 menit.
- Hanya ditampilkan untuk level waspada/siaga.
- Di Tentang dijelaskan ini perkiraan, bukan hasil model per desa.

---

## 7. UI & Komponen

### Baru
| Komponen | Fungsi |
|---|---|
| `PublicLayout` | Header, footer, banner offline |
| `PublicAlertList` | Daftar peringatan aktif; pilih wilayah |
| `PublicAlertCard` | Level, kedalaman, puncak, teks peringatan final, waktu siaran, langkah evakuasi |
| `LocationPicker` | Tombol GPS + combobox cari desa |
| `PublicMap` | Peta zonasi desa, tap pilih, legenda |
| `EvacuationChecklist` | Langkah per level, target sentuh 44 px |
| `EmergencyContacts` | Telepon 112 dan kantor BPBD |
| `OfflineBanner` | Mode offline + waktu data terakhir |
| `AlertReviewSheet` | Di O-06 dashboard: sunting, siarkan, tarik per wilayah |

### Dipakai ulang
`riskLevel`, level → warna dan label, `ConfidenceBadge` (versi publik: "Informasi sedang diverifikasi petugas"), `ErrorBoundary`, `EmptyState`, `MapView` (varian baru lebih ringan).

### Bahasa
- Tidak memakai istilah TMA, C-value, debit, DAG.
- Contoh: "Estimasi air tiba ± 60 menit", "Siapkan dokumen penting dan naik ke lantai dua".
- Confidence < 85 menjadi "Informasi sedang diverifikasi petugas", bukan label internal.

---

## 8. Peta Zonasi

- Sumber: `desa-koridor.geojson` + indeks peringatan aktif.
- Fill desa: hijau/kuning/merah; opacity 0.55.
- Desa tanpa peringatan aktif: abu-abu, label "tidak ada peringatan aktif".
- Batas kecamatan sebagai garis tipis; kabupaten/provinsi sebagai garis lebih tebal.
- Tap desa → pilih wilayah → kartu berubah.
- Legenda 3 level + abu-abu.
- Zoom awal mengikuti lokasi terpilih; jika belum ada, seluruh koridor.
- Fallback offline: style polos (tanpa tile), poligon tetap tampil.

---

## 9. Offline

### Service worker
- Strategi: precache app shell, cache-first untuk GeoJSON, network-first untuk indeks peringatan (dengan fallback cache), stale-while-revalidate untuk tile.
- Batas cache tile: 300 tile, hapus yang paling lama.
- Versi cache dinaikkan saat build.

### Perilaku
- Offline dan indeks peringatan ada: tampilkan peringatan terakhir + banner.
- Offline dan indeks peringatan tidak ada: tampilkan pesan "Belum ada data tersimpan".
- Tile gagal: peta beralih ke style polos, poligon desa tetap.

Catatan: service worker hanya aktif di build produksi, bukan `pnpm dev`.

---

## 10. Kontak Darurat

| Label | Nomor | Keterangan |
|---|---|---|
| Darurat Jakarta Siaga | 112 | Bebas pulsa, 24 jam |
| Kantor BPBD DKI Jakarta | (021) 6344766 | Bukan nomor darurat |

- Tombol `tel:112` dan `tel:+62216344766`.
- Teks penjelas di bawah tombol.
- Tanggal verifikasi dicatat di halaman Tentang.
- Tautan resmi: bpbd.jakarta.go.id, jakarta.go.id, bmkg.go.id (diverifikasi saat implementasi).

---

## 11. Fase Pengerjaan

| Fase | Isi | Kriteria selesai |
|---|---|---|
| **Q0 Rute & layout** | Ganti `/` ke `PublicPage`, tambah `/tentang`, `PublicLayout`, lazy load | Halaman publik tampil 360 px; bundle operator tidak ikut dimuat |
| **Q1 Peringatan publik** | Tipe peringatan per wilayah, indeks localStorage, BroadcastChannel, tombol siarkan/tarik di O-06, catat di log audit | Test siarkan, replace per wilayah, tarik, kedaluwarsa, kosong |
| **Q2 Data desa** | `build-desa.py`, GeoJSON desa, `desa-node.json`, helper estimasi | 237 desa; test pemetaan dan estimasi lulus |
| **Q3 Lokasi & kartu** | GPS + point-in-polygon, fallback combobox, state ditolak/luar cakupan/kosong, `PublicStatusCard` | Kartu berubah sesuai lokasi dan izin |
| **Q4 Peta zonasi** | `PublicMap`, fill per level, tap pilih, legenda, abu-abu luar cakupan | Tap memperbarui kartu; legenda tampil |
| **Q5 Evakuasi & kontak** | Checklist, teks peringatan final, kontak darurat, halaman Tentang | Semua konten FR-34–FR-38 tampil |
| **Q6 Offline** | Service worker, cache tile, fallback style polos, banner | Uji offline: kartu dan peta tampil |
| **Q7 Kualitas** | Playwright mobile (lokasi, manual, izin ditolak, offline, publikasi), axe, screenshot | Semua test dan checklist lulus |

Catatan: Q1 (peringatan publik) sudah dikerjakan sebagai F1–F2 di [`ews-simulator.md`](ews-simulator.md); AI composer aktif sejak F2. Q0 dan Q2–Q7 tetap menjadi perluasan halaman publik.

---

## 12. Pengujian

### Unit (Vitest)
- Penyusun peringatan: hanya wilayah waspada/siaga, level sesuai node, estimasi null bila tidak valid.
- Store publikasi: siarkan, replace per wilayah, tarik, kedaluwarsa.
- Pemetaan desa → node: jumlah benar, tidak ada desa tanpa node.
- Estimasi tiba: naik sesuai jarak, minimal 15 menit.
- Point-in-polygon: desa dikenal dan tidak dikenal.

### E2E (Playwright, viewport 390×844)
1. Siarkan peringatan di dashboard → buka halaman publik → peringatan wilayah tersebut tampil.
2. Pilih desa manual → kartu dan peta berubah.
3. Tolak izin GPS → fallback combobox muncul, tanpa pesan menakutkan.
4. Offline → banner tampil, kartu dan poligon tetap ada.
5. Tarik peringatan → pesan "Belum ada peringatan resmi untuk wilayah ini".

### Aksesibilitas
- Target sentuh 44 px, teks 16 px.
- Kontras AA; status tidak hanya warna.
- Fokus keyboard terlihat; peta punya alternatif daftar desa.
- `prefers-reduced-motion` dihormati.

---

## 13. Risiko

| Risiko | Mitigasi |
|---|---|
| Warga mengira zona dihitung per desa | Keterangan jelas di Tentang; label "zona mengikuti node hilir" |
| Peringatan kedaluwarsa | TTL 6 jam, tampilkan waktu siaran dan label "terakhir diperbarui" |
| SHP desa besar | Clip + simplifikasi di build; target < 1 MB |
| Peta offline kosong | Cache tile terbatas + fallback polos |
| Nomor darurat berubah | Catat tanggal verifikasi; mudah diperbarui di satu file konstanta |
| localStorage tidak berlaku lintas perangkat | Dinyatakan sebagai batasan prototipe; produksi lewat backend |

---

## 14. Definition of Done

- Rute `/` menampilkan halaman publik dan `/tentang` lengkap.
- Peringatan hanya bisa berasal dari operator, dapat disunting, disiarkan, dan ditarik per wilayah.
- 237 desa terpetakan ke node; tidak ada desa tanpa zona saat publikasi.
- Semua requirement "M" web publik terpenuhi.
- `lint`, `typecheck`, `test`, `build` lulus.
- E2E mobile lulus, termasuk offline dan izin ditolak.
- Checklist aksesibilitas terisi.
- Screenshot publik masuk README.

---

## 15. Struktur File yang Diusulkan

```
apps/dashboard/src/
├─ pages/
│  ├─ PublicPage.tsx
│  └─ AboutPage.tsx
├─ layouts/
│  └─ PublicLayout.tsx
├─ features/public/
│  ├─ PublicStatusCard.tsx
│  ├─ LocationPicker.tsx
│  ├─ PublicMap.tsx
│  ├─ EvacuationChecklist.tsx
│  ├─ PublicAlertList.tsx
│  ├─ EmergencyContacts.tsx
│  └─ OfflineBanner.tsx
├─ services/
│  ├─ publicationService.ts
│  ├─ desaService.ts
│  └─ geoLocateService.ts
├─ data/
│  └─ kontak.ts
├─ schemas/
│  └─ publish.ts
└─ notifications/
   └─ publicationChannel.ts
scripts/
├─ build-desa.py
└─ screenshots-publik.mjs
public/
├─ geo/desa-koridor.geojson
├─ geo/desa-node.json
└─ sw.js (hasil build)
```
