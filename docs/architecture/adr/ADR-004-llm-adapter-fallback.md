# ADR-004 — LLM Adapter dengan Timeout dan Rule-based Fallback

| Status | Diterima |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim AI, Tim SWE |

## Konteks

Proposal menetapkan Gemini sebagai mesin narasi, dengan risiko halusinasi, latensi, dan gangguan API saat badai (proposal §6). Narasi harus tetap tersedia.

## Keputusan

- Semua pemanggilan LLM melewati **LLM Adapter** dengan interface `NarrativeProvider`.
- Timeout **5 detik**. Setelah itu fallback ke rule-based.
- Setiap narasi divalidasi (`validateNarrative`): angka dalam teks harus ada di hasil simulasi (FR-R5). Jika tidak, fallback.
- Sumber narasi (`llm` atau `rule_based`) dan confidence wajib ditampilkan.
- Pada prototipe, LLM adalah mock dengan delay acak 0,5–1,5 detik, dan toggle "paksa gagal" tersedia.
- Model yang dipakai (misalnya Gemini) dikonfigurasi, tidak ditulis keras di kode. Versi model diperbarui sesuai ketersediaan saat implementasi.
- API key hanya di server (FR-R7).

## Alternatif

| Opsi | Alasan ditolak |
|---|---|
| Memanggil Gemini langsung dari browser | API key terbuka (FR-R7) |
| Tanpa fallback, tampilkan pesan error | Dashboard kosong saat darurat |
| Hanya rule-based tanpa LLM | Tidak memenuhi proposal (narasi dari LLM) |

## Konsekuensi

- Adapter menjadi komponen kritis. Perlu uji fallback otomatis (US-12).
- Validasi angka sederhana belum menangkap semua kesalahan logika. Review manusia tetap diperlukan (FR-R1).
- Log pemanggilan LLM disimpan di audit (NFR-11).
