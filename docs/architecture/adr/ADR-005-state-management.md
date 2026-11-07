# ADR-005 — State Management: Zustand dan TanStack Query

| Status | Diterima |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim SWE |

## Konteks

Dashboard memiliki dua jenis state: state UI (input slider, skenario aktif, keputusan operator) dan state server (hasil simulasi, narasi, data node). Keduanya tidak boleh dicampur.

## Keputusan

- **Zustand** untuk state UI dan keputusan operator (`simulationStore`, `operatorStore`).
- **TanStack Query** untuk state server: hasil simulasi, narasi, data geospasial. Mendukung cache, retry, dan timeout.
- Hasil simulasi dicache dengan key `['simulation', hash(input)]`.
- Input yang sama tidak dihitung ulang.

## Alternatif

| Opsi | Alasan ditolak |
|---|---|
| Redux Toolkit | Terlalu berat untuk skala ini |
| Context API saja | Re-render berlebihan pada peta dan grafik |
| Jotai | Setara, tetapi tim sudah memilih Zustand |
| Hanya TanStack Query | Keputusan operator bukan state server |

## Konsekuensi

- Store tidak menyimpan data server. Jika sumber data berubah, cache diperbarui.
- Keputusan operator dapat disimpan di `localStorage` untuk demo (opsional).
