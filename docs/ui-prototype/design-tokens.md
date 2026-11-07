# Design Tokens — Dashboard Operasional

Sumber: `docs/analysis/requirements.md` (NFR-04, NFR-12) dan `02-style.md` dari rencana awal. Nilai di bawah adalah titik awal dan harus diverifikasi kontrasnya sebelum finalisasi.

## 1. Tema

| Mode | Default | Catatan |
|---|---|---|
| Gelap | Ya | Operator bekerja lama, layar kontrol |
| Terang | Opsional | Toggle di header |

## 2. Warna Dasar

| Token | Terang | Gelap | Pemakaian |
|---|---|---|---|
| `background` | slate-50 `#F8FAFC` | slate-950 `#020617` | Latar halaman |
| `card` | white `#FFFFFF` | slate-900 `#0F172A` | Panel |
| `foreground` | slate-900 `#0F172A` | slate-100 `#F1F5F9` | Teks utama |
| `muted-foreground` | slate-600 `#475569` | slate-400 `#94A3B8` | Teks sekunder |
| `border` | slate-200 `#E2E8F0` | slate-800 `#1E293B` | Garis pemisah |
| `primary` | sky-700 `#0369A1` | sky-400 `#38BDF8` | Aksi utama |
| `water` | cyan-600 `#0891B2` | cyan-400 `#22D3EE` | Sungai, edge |

## 3. Level Risiko

Warna risiko selalu disertai ikon dan teks.

| Level | Teks | Warna | Ikon | Hex (gelap) |
|---|---|---|---|---|
| Aman | "Aman" | emerald-500 | ShieldCheck | `#10B981` |
| Waspada | "Waspada" | amber-400 | TriangleAlert | `#FBBF24` |
| Siaga | "Siaga" | red-500 | OctagonAlert | `#EF4444` |

Catatan: di tema terang, gunakan varian yang lebih gelap (emerald-700, amber-600, red-700) agar kontrasnya memenuhi 4,5:1.

## 4. Status Sumber dan Confidence

| Elemen | Gaya | Teks contoh |
|---|---|---|
| Sumber AI | Outline sky | "AI · Gemini (mock)" |
| Sumber rule-based | Solid slate | "Rule-based" |
| Confidence ≥ 85% | Teks emerald | "Kepastian 92%" |
| Confidence < 85% | Background amber tipis + ikon | "Memerlukan Konfirmasi Petugas Lapangan" |
| Data mock | Outline putus-putus slate | "Data Mock" |
| Data sintetis | Outline violet | "Data Sintetis" |
| Mode latihan | Banner amber di header | "MODE LATIHAN" |

## 5. Tipografi

| Token | Ukuran | Berat | Pemakaian |
|---|---|---|---|
| `text-display` | 32 px | 700 | Angka KPI utama (debit total) |
| `text-title` | 18 px | 600 | Judul panel |
| `text-body` | 14 px | 400 | Teks umum |
| `text-label` | 12 px | 500 | Label, satuan |
| `text-mono-num` | 14 px | 500, tabular-nums | Angka di tabel dan grafik |

- Font: Inter, fallback system-ui dan Segoe UI.
- Angka selalu `tabular-nums` agar tidak bergeser saat slider berubah.
- Format angka Indonesia: `1.250,5 m³/s`.
- Waktu: `14:30 WIB`.

## 6. Spacing & Ukuran

| Token | Nilai |
|---|---|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-6` | 24 px |
| `radius-md` | 8 px |
| `radius-lg` | 12 px |
| Target sentuh minimum | 44 × 44 px (tablet) |
| Slider thumb | ≥ 20 px (desktop), ≥ 24 px (tablet) |

## 7. Elevasi & Border

- Panel: border 1 px `border`, tanpa shadow berat.
- Sheet dan dialog: shadow lembut, backdrop 60% hitam.

## 8. Motion

| Token | Nilai |
|---|---|
| `duration-fast` | 150 ms |
| `duration-base` | 200 ms |
| `duration-chart` | 300 ms maksimum |

Hormati `prefers-reduced-motion`: matikan transisi chart dan animasi playback otomatis.

## 9. Peta

| Elemen | Gaya |
|---|---|
| Node aman | Lingkaran emerald, radius 6 px |
| Node waspada | Lingkaran amber, radius 8 px |
| Node siaga | Lingkaran red, radius 10 px, ring |
| Edge | Garis cyan, lebar sesuai debit (2–8 px) |
| Heatmap kelurahan | Fill opacity 0,5–0,7 dengan skala sequential |
| Batas DAS | Garis putus-putus, tanpa fill |
| Label | Muncul di zoom ≥ 12 |
| Legenda | Pojok kiri bawah, dapat dilipat |

## 10. Ikon

- Sumber: `lucide-react`.
- Ukuran: 16 px (inline), 20 px (tombol), 24 px (status panel).
- Setiap ikon status wajib memiliki teks atau `aria-label`.
