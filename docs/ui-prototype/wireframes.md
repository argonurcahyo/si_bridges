# Wireframe (Low Fidelity)

Struktur layar untuk review awal. Mockup visual ada di tahap berikutnya dan mengikuti `design-tokens.md`.

Keterangan simbol: `[ ]` tombol, `( )` pilihan, `[=====o==]` slider, `{ }` input, `▲▼` indikator.

## O-01 — Dashboard Utama (Desktop ≥ 1280 px)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ HydroTwin-AI   │ ◉ MODE LATIHAN │ Pantau  Historis  Status  Log │ ● Layanan OK │ 14:30 WIB │ ☾ │
├────────────────┬───────────────────────────────────────────────┬────────────────────────┤
│ SIMULASI       │                                               │ REKOMENDASI TAKTIS     │
│                │                                               │ [AI · (mock)]          │
│ Intensitas     │                 PETA                          │ Kepastian 92%          │
│ hujan          │          (2D/3D · node · edge)                │                        │
│ 80 mm/jam      │                                               │ "Buka Pintu Air        │
│ [=====o======] │   ◉ Katulampa ─── ◉ Depok ─── ◉ Manggarai     │  Manggarai 15% dalam   │
│ 0      200     │                      │                        │  45 menit untuk        │
│                │                      ◉ Kp. Melayu ─ ◉ Cawang  │  mencegah limpasan di  │
│ Konversi lahan │                                               │  Kp. Melayu."          │
│ Depok          │  [Legenda]                  [2D | 3D] [Layer] │                        │
│ ( ) 0%         │                                               │ Keputusan:             │
│ ( ) 10%        │                                               │ [Diterima]             │
│ (•) 20%        │                                               │ [Ditolak]              │
│ ( ) 30%        │                                               │ [Perlu Verifikasi]     │
│                │                                               │                        │
│ Skenario cepat │                                               │ Peringatan       ▸     │
│ [Hujan +20]    │                                               │ Log keputusan    ▸     │
│ [Baseline]     │                                               │                        │
├────────────────┴───────────────────────────────────────────────┴────────────────────────┤
│ DEBIT PER SEGMEN (m³/s)                       │ PROYEKSI VOLUME 3–6 JAM                   │
│  ▲                                            │  ▲                                        │
│  │      ┄┄┄┄┄┄┄┄┄┄┄┄ siaga                   │  │          ╱╲  band confidence              │
│  │  ▇▇     ┄┄┄┄┄ waspada                     │  │       ╱──╱  ╲──                          │
│  │  ▇▇ ▇▇                                     │  │   ╱──╱                                    │
│  └──────────────────────────────▶            │  └────────────────────────▶                │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Disclaimer: Sistem ini alat bantu keputusan. Keputusan akhir ada pada petugas berwenang. │
│ Sumber: TMA DSDA (mock) · Hujan BMKG (mock) · DEMNAS · SHP batas admin · v0.1 prototipe │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Catatan layout:
- Panel kiri lebar tetap ±300 px. Panel kanan ±320 px. Peta mengisi sisa ruang.
- Grafik bawah tinggi ±240 px, dapat dilipat.
- Header menampilkan MODE LATIHAN selalu (FR-29).

## O-02 — Detail Node/Segmen (Sheet Samping)

```
                                                  ┌──────────────────────────────┐
                                                  │ Pintu Air Manggarai     ✕    │
                                                  │ ● SIAGA                      │
                                                  │                              │
                                                  │ TMA          4,25 m          │
                                                  │ Debit        312,5 m³/s      │
                                                  │ Ambang siaga 4,00 m          │
                                                  │ C-value      0,68            │
                                                  │                              │
                                                  │ Sumber: TMA DSDA (mock)      │
                                                  │ Diperbarui: 14:28 WIB        │
                                                  │                              │
                                                  │ [Lihat grafik debit]         │
                                                  └──────────────────────────────┘
```

## O-03 — Perbandingan Skenario

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ PERBANDINGAN SKENARIO                                              [Tutup ✕]  │
├──────────────────────────────────────┬────────────────────────────────────────┤
│ BASELINE (60 mm/jam, 0%)             │ SKENARIO (80 mm/jam, 20%)              │
│  Debit total   1.120 m³/s            │  Debit total   1.480 m³/s   ▲ +32%     │
│  Volume 6 jam  9,8 juta m³           │  Volume 6 jam  13,1 juta m³ ▲ +34%     │
│                                      │                                        │
│  Segmen      Baseline   Skenario     │                                        │
│  Kp. Melayu    312       401   ▲      │                                        │
│  Bidara Cina   288       369   ▲      │                                        │
│  Cawang        201       236   ▲      │                                        │
└──────────────────────────────────────┴────────────────────────────────────────┘
```

## O-04 — Rekomendasi & Keputusan

```
┌─────────────────────────────────────────────────────────────────────┐
│ REKOMENDASI TAKTIS                                       [Tutup ✕]  │
│ [Narasi] [Log keputusan]                                            │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠ Memerlukan Konfirmasi Petugas Lapangan                           │
│ Kepastian 78%                                                       │
│                                                                     │
│ Sumber: AI · (mock) · dibuat 14:30 WIB · ID REK-0042                │
│                                                                     │
│ "Buka Pintu Air Manggarai 15% dalam 45 menit untuk mencegah         │
│  limpasan di Kampung Melayu. Pantau TMA Katulampa setiap 15 menit." │
│                                                                     │
│ Ringkasan input: hujan 80 mm/jam · konversi Depok 20% · horizon 6 j │
│                                                                     │
│ Keputusan operator (wajib diisi):                                   │
│ [ Diterima ]  [ Ditolak ]  [ Perlu Verifikasi ]                     │
│                                                                     │
│ Status saat ini: ◌ Pending                                          │
└─────────────────────────────────────────────────────────────────────┘
```

Varian O-04a (LLM gagal):

```
│ Sumber: ■ Rule-based                                                │
│ ℹ Narasi AI tidak tersedia, menggunakan aturan standar.             │
```

## O-06 — Tinjau & Siarkan Peringatan Publik

```
┌────────────────────────────────────────────────────────────────────────┐
│ TINJAU PERINGATAN PUBLIK                                    [Tutup ✕]  │
│ Pesan disusun dari hasil model. Anda dapat menyunting sebelum siarkan. │
├────────────────────────────────────────────────────────────────────────┤
│ Wilayah: [ Bidara Cina ▾ ]            Level: ● SIAGA                   │
│ Sumber: AI · OpenAI (mock) · dibuat 14:30 WIB                         │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ SIAGA — Kelurahan Bidara Cina                                      │ │
│ │ Estimasi air tiba ± 60 menit. Segera naik ke lantai dua atau       │ │
│ │ lokasi aman terdekat. Ikuti informasi resmi BPBD DKI Jakarta.      │ │
│ │ [ teks dapat disunting ]                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Teks AI asli disimpan di audit. Status: ◌ Draf                         │
│                                                                        │
│ [ Generate ulang ]  [ Tolak ]  [ Siarkan ke warga ]                    │
└────────────────────────────────────────────────────────────────────────┘
```

Varian O-06a (AI gagal): badge `■ Template`, pesan "AI tidak tersedia, memakai template".

Varian O-06b (tidak ada wilayah waspada/siaga): "Belum ada peringatan yang perlu disiarkan."

## W-01 — Kartu Peringatan Warga (Mobile)

```
┌──────────────────────────────────────┐
│ HydroTwin Siaga        [Pilih wilayah]│
│ Peringatan resmi · 14:32 WIB          │
├──────────────────────────────────────┤
│            SIAGA                     │
│   Estimasi air tiba ± 60 menit       │
│   Puncak sekitar 3 jam lagi          │
│                                      │
│ Teks peringatan final                │
│ (hasil suntingan operator)           │
│                                      │
│ Langkah cepat                        │
│ 1. Naikkan dokumen ke lantai atas    │
│ 2. Siapkan tas siaga dan obat        │
│ 3. Menuju posko terdekat             │
│                                      │
│ Peringatan resmi operator BPBD       │
└──────────────────────────────────────┘
```

Varian W-01a (belum ada peringatan): "Belum ada peringatan resmi untuk wilayah ini."

## P-01 — Parameter Simulator

```
┌──────────────────────────────────────────────────────────────────┐
│ PARAMETER SKENARIO                                               │
├──────────────────────────────────────────────────────────────────┤
│ Hujan 24 jam       [====o====] 180 mm                            │
│ Pasang laut        [==o======] 0,4 m                             │
│ RTH Depok          [===o=====] 15%                               │
│ Moratorium air     [ on ]                                       │
│ (parameter tambahan mengikuti registry)                          │
│ [ Reset skenario ]                                               │
└──────────────────────────────────────────────────────────────────┘
```

## P-04 — Interpretasi & Executive Brief

```
┌──────────────────────────────────────────────────────────────────┐
│ INTERPRETASI SKENARIO              [AI · Claude (mock) · 14:35]  │
│ Skenario ini menurunkan luas genangan 12% dibanding dasar...     │
│ Batasan: model mock, bukan HEC-RAS.                              │
├──────────────────────────────────────────────────────────────────┤
│ EXECUTIVE BRIEF                    [Generate brief]              │
│ Draf · menunggu tinjauan analis                                  │
│ Ringkasan | Dampak | Opsi kebijakan | Rekomendasi | Batasan      │
│ [ Salin ] [ Unduh Markdown ]                                     │
└──────────────────────────────────────────────────────────────────┘
```

## O-07 — Status Data & Layanan

```
┌────────────────────────────────────────────────────────────────────┐
│ STATUS DATA & LAYANAN                                    [Tutup ✕] │
├────────────────────────────────────────────────────────────────────┤
│ SUMBER DATA                                                        │
│ Layer            Sumber           Status     Diperbarui            │
│ TMA Katulampa    DSDA             mock       14:28 WIB             │
│ Hujan            BMKG / CHIRPS    mock       14:00 WIB             │
│ Batas kelurahan  Peta Kita (SHP)  open_data  01-11-2026            │
│ DEM              DEMNAS           open_data  —                     │
│ LULC             Sentinel-2 (GEE) sintetis   10-11-2026            │
│                                                                    │
│ LAYANAN                                                            │
│ ● Simulasi        Normal                                           │
│ ▲ Layanan LLM     Terdegradasi — fallback rule-based aktif         │
│ ● Data geospasial Normal                                           │
└────────────────────────────────────────────────────────────────────┘
```

## O-08 — Kondisi Khusus

### O-08a Peta gagal dimuat

```
┌──────────────────────────────────────────┐
│ ⚠ Peta belum dapat ditampilkan           │
│ Daftar segmen tetap tersedia di bawah.   │
│ [Muat ulang peta]                        │
│                                          │
│ Segmen         Level       Debit         │
│ Kp. Melayu     ● Siaga     312 m³/s      │
│ Bidara Cina    ▲ Waspada   288 m³/s      │
│ Cawang         ● Aman      201 m³/s      │
└──────────────────────────────────────────┘
```

### O-08b Data kosong

```
┌──────────────────────────────────────────┐
│ Belum ada data node untuk ditampilkan.   │
│ Periksa status data di menu Status.      │
│ [Muat ulang]                             │
└──────────────────────────────────────────┘
```

### O-08c Simulasi gagal

Hasil lama tetap tampil dengan label di atas grafik:
`Belum diperbarui — simulasi gagal pada 14:32 WIB. [Coba lagi]`

## O-01b — Tablet (768 px)

```
┌──────────────────────────────────────────────────────────┐
│ HydroTwin-AI · MODE LATIHAN             14:30 WIB  ☾ ☰   │
├──────────────────────────────────────────────────────────┤
│                    PETA                                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Hujan [====o====] 80 mm/jam   Konversi [ 20% ▾ ]         │
├──────────────────────────────────────────────────────────┤
│ [Grafik debit]  [Proyeksi]  [Rekomendasi ▸]              │
└──────────────────────────────────────────────────────────┘
```

Di tablet, panel kiri dan kanan berpindah menjadi kontrol di bawah peta, dan rekomendasi menjadi drawer (FR-R1 tetap berlaku).
