# UI Prototipe — HydroTwin-AI

Dokumen ini mendeskripsikan prototipe frontend HydroTwin-AI. Kode ada di `apps/dashboard/`.

| Item | Isi |
|---|---|
| Lingkup | Dashboard Operasional (`/ops`), Konsol Perencana (`/rencana`), PWA Warga (`/warga`) |
| Tim | Tim SWE: Yovi Maulana Nugraha (UI/UX & mockup), Argo Nurcahyo (arsitektur & review) |
| Fidelity | Mockup visual lengkap, prototipe React interaktif |
| Stack | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, MapLibre GL JS, Recharts |
| Data | Mock dari SHP dan DEMNAS; 237 poligon kelurahan dari BPS 2020 |
| Bahasa | Indonesia |

![Konsol Perencana](screenshots/12-konsol-perencana.png)

*Tampilan utama: Konsol Perencana — parameter skenario, heatmap kedalaman per kelurahan, dampak skenario, dan Executive Brief.*

## 1. Site Map

```mermaid
flowchart TB
    ROOT["/ops<br/>Dashboard Operasional"]
    PLAN["/rencana<br/>Konsol Perencana"]
    WARGA["/warga<br/>PWA Warga"]
    ROOT --> O01["O-01 Dashboard utama<br/>(default)"]
    O01 -->|klik node atau segmen| O02["O-02 Detail node/segmen<br/>(sheet samping)"]
    O01 -->|mode perbandingan| O03["O-03 Perbandingan skenario"]
    O01 -->|panel rekomendasi| O04["O-04 Rekomendasi & keputusan"]
    O04 -->|tombol Draf| O06["O-06 Draf peringatan publik"]
    O01 -->|menu Historis| O05["O-05 Playback historis"]
    O01 -->|menu Status| O07["O-07 Status data & layanan"]
    O01 -.->|kondisi khusus| O08["O-08 Kosong, loading, error"]
    O04 -->|riwayat| LOG["Log audit<br/>(panel di O-04)"]
    PLAN --> P01["P-01 Parameter skenario"]
    PLAN --> P02["P-02 Heatmap kelurahan"]
    PLAN --> P03["P-03 Dampak & Executive Brief"]
    WARGA --> W01["W-01 Kartu peringatan RW"]
```

Navigasi utama berada di header: **Operator**, **Perencana**, dan **Warga**. O-02 dan O-03 terbuka sebagai panel di atas O-01.

## 2. Struktur Layar

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Header: logo · MODE LATIHAN · status layanan · waktu WIB · tema · menu   │
├──────────────┬──────────────────────────────────────┬─────────────────────┤
│ Panel kontrol│ PETA (2D/3D, node, edge, heatmap)    │ Panel rekomendasi   │
│ - hujan      │                                      │ - narasi AI/rule    │
│ - konversi   │                                      │ - confidence        │
│ - skenario   │                                      │ - keputusan         │
├──────────────┴──────────────────────────────────────┴─────────────────────┤
│ Grafik: debit per segmen | proyeksi 3–6 jam                             │
├───────────────────────────────────────────────────────────────────────────┤
│ Footer: disclaimer DSS · sumber data · versi prototipe                  │
└───────────────────────────────────────────────────────────────────────────┘
```

Detail ada di `wireframes.md`.

## 3. Prinsip Prototipe

1. **Satu layar utama.** Operator tidak harus berpindah halaman untuk simulasi.
2. **Hasil langsung terlihat.** Setiap perubahan input memperbarui peta, grafik, dan rekomendasi.
3. **Status selalu jelas.** Mode latihan, sumber narasi, dan confidence selalu terlihat.
4. **Keputusan tercatat.** Tidak ada aksi yang tidak meninggalkan jejak.
5. **Ramah kondisi darurat.** Warna, ikon, dan teks membawa informasi yang sama.

## 4. Tangkapan Layar Dashboard Operator

Semua gambar diambil dari prototipe yang berjalan (mode terang, 1440 px) memakai `apps/dashboard/scripts/screenshots.mjs`.

### Tampilan keseluruhan

![Tampilan keseluruhan dashboard](screenshots/01-overview.png)

Satu layar memuat header dengan status dan waktu WIB, banner mode latihan, KPI risiko, panel simulasi, peta, panel rekomendasi, grafik, dan tabel monitoring.

### Panel simulasi

![Panel simulasi](screenshots/02-panel-simulasi.png)

Slider intensitas hujan, konversi lahan Depok, tiga skenario cepat, serta debit hilir dan skor kepastian. Perubahan input memicu perhitungan ulang dengan debounce 300 ms.

### Peta jaringan (2D)

![Peta 2D](screenshots/03-panel-peta.png)

Ciliwung sebagai centerline, alur simulasi mengikuti sungai, node berwarna sesuai level risiko, batas kecamatan/kabupaten/provinsi, basemap OSM di luar cakupan, dan pilihan koridor Ciliwung/Pesanggrahan/Jabodetabek.

### Grafik debit dan proyeksi

![Grafik](screenshots/04-panel-grafik.png)

Debit per node (baseline vs skenario) dan proyeksi volume 3–6 jam dengan pita keyakinan.

### Rekomendasi taktis

![Rekomendasi](screenshots/05-panel-rekomendasi.png)

Narasi AI atau rule-based, badge sumber, skor kepastian, ringkasan input, tombol keputusan operator, dan toggle paksa gagal LLM.

### Log keputusan

![Log keputusan](screenshots/06-log-keputusan.png)

Setiap keputusan tercatat dengan waktu WIB, ID rekomendasi, sumber narasi, dan ringkasan input. Log tidak menimpa entri lama.

### Detail node

![Detail node](screenshots/07-detail-node.png)

Panel samping berisi TMA, level risiko, debit simulasi, C-value, ambang, koordinat, dan status data.

### Draf peringatan publik

![Draf peringatan](screenshots/08-draf-peringatan.png)

Draf per wilayah dengan level, estimasi waktu tiba, instruksi evakuasi, dan tombol salin. Tidak ada tombol kirim otomatis.

### Status data dan layanan

![Status data](screenshots/09-status-data.png)

Sumber tiap layer, label open data/sintetis/mock, waktu pembaruan, status layanan, dan catatan validasi koordinat.

### Mode 3D

![Mode 3D](screenshots/10-mode-3d.png)

Terrain DEMNAS dengan skala vertikal yang dapat diatur (2× sampai 8×), hillshade dari DEM, dan alur Ciliwung yang mengikuti lembah.

## 5. Konsol Perencana dan PWA Warga

Dua tampilan baru mengikuti konsep HydroTwin-AI dan memakai data yang sama dengan dashboard operator.

### Konsol perencana (`/rencana`)

![Konsol perencana](screenshots/12-konsol-perencana.png)

Parameter skenario (hujan 24 jam, pasang laut, RTH Depok, moratorium), heatmap kedalaman per kelurahan dari 237 poligon BPS, dampak skenario (luas genangan, RW terdampak, puncak, keyakinan), grafik perbandingan opsi, dan Executive Brief. Angka dari model mock, bukan HEC-RAS.

Diambil dengan `apps/dashboard/scripts/screenshots-hydrotwin.mjs` (Puppeteer, 1440 px, mode terang).

### PWA warga (`/warga`)

![PWA warga](screenshots/11-warga-pwa.png)

Tampilan mobile berisi level siaga, kisaran kedalaman, puncak, peta kelurahan dengan posisi di perangkat, langkah evakuasi, dan status persetujuan operator. GPS tidak dikirim ke server.

## 6. Dokumen Terkait

| Dokumen | Fungsi |
|---|---|
| `screen-inventory.md` | Daftar layar dan requirement |
| `wireframes.md` | Struktur layar (low fidelity) |
| `design-tokens.md` | Warna, tipografi, spacing |
| `interaction-spec.md` | Perilaku setiap kontrol |
| `demo-script.md` | Urutan demo |
| `a11y-checklist.md` | Checklist aksesibilitas |
| `usability-notes.md` | Catatan uji pengguna |
| `../analysis/requirements.md` | Requirement |

