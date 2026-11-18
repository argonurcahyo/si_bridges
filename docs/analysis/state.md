# State Diagram

## 1. Status Rekomendasi (Operator)

Status keputusan operator untuk satu rekomendasi.

```mermaid
stateDiagram-v2
    [*] --> Pending: rekomendasi dibuat
    Pending --> Diterima: operator memilih Diterima
    Pending --> Ditolak: operator memilih Ditolak
    Pending --> PerluVerifikasi: operator memilih Perlu Verifikasi
    PerluVerifikasi --> Diterima: verifikasi selesai, diterima
    PerluVerifikasi --> Ditolak: verifikasi selesai, ditolak
    Pending --> Kedaluwarsa: simulasi berubah
    Diterima --> Kedaluwarsa: simulasi berubah
    Ditolak --> Kedaluwarsa: simulasi berubah
    PerluVerifikasi --> Kedaluwarsa: simulasi berubah
    Kedaluwarsa --> [*]
```

Catatan:
- Status `Kedaluwarsa` dipicu saat input simulasi berubah dan rekomendasi baru dibuat. Riwayat tetap ada di log audit.
- Keputusan hanya mengubah status. Tidak ada efek ke node atau pompa (FR-R1).
- Status rekomendasi taktis **tidak** otomatis menjadi status peringatan publik. Persetujuan peringatan diatur di bagian 6.

## 2. Status Sumber Narasi

```mermaid
stateDiagram-v2
    [*] --> Memuat
    Memuat --> AI: LLM merespons dan validasi lolos
    Memuat --> RuleBased: timeout 5 detik
    Memuat --> RuleBased: LLM error
    Memuat --> RuleBased: validasi angka gagal
    AI --> Memuat: input simulasi berubah
    RuleBased --> Memuat: input simulasi berubah
    RuleBased --> AI: LLM pulih dan diminta ulang
```

## 3. Level Risiko per Node/Segmen

```mermaid
stateDiagram-v2
    [*] --> Aman
    Aman --> Waspada: debit >= ambang waspada
    Waspada --> Siaga: debit >= ambang siaga
    Siaga --> Waspada: debit < ambang siaga
    Waspada --> Aman: debit < ambang waspada
    Aman --> Siaga: debit >= ambang siaga
```

Catatan: transisi berbasis ambang dengan histeresis (margin 5%) agar warna tidak berkedip saat nilai berada di batas.

## 4. Status Layanan

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> Terdegradasi: LLM gagal atau data terlambat
    Terdegradasi --> Normal: layanan pulih
    Normal --> Gagal: simulasi tidak merespons
    Terdegradasi --> Gagal: kegagalan berlanjut
    Gagal --> Normal: layanan pulih
```

## 5. Mode Dashboard

```mermaid
stateDiagram-v2
    [*] --> Latihan
    Latihan --> Operasional: data nyata terhubung (di luar prototipe)
    Operasional --> Latihan: fallback ke data mock
```

Pada prototipe, mode selalu `Latihan`.

## 6. Status Peringatan Publik

Per wilayah, hanya satu peringatan yang boleh aktif.

```mermaid
stateDiagram-v2
    [*] --> Draf: AI menyusun pesan
    Draf --> Disiarkan: operator menyetujui dan menyiarkan
    Draf --> Ditolak: operator menolak
    Disiarkan --> Ditarik: operator menarik
    Disiarkan --> Kedaluwarsa: TTL 6 jam atau digantikan siaran baru
    Ditarik --> [*]
    Ditolak --> [*]
    Kedaluwarsa --> [*]
```

Catatan:
- `Disiarkan` adalah satu-satunya status yang dapat dibaca halaman warga (FR-34, FR-R10).
- Teks AI asli (`teksAi`) dan teks final (`teksFinal`) disimpan terpisah; suntingan operator tercatat (FR-R9).
- Setiap transisi menambah entri log audit (FR-37).
- Peringatan wilayah A tidak boleh muncul di wilayah B (NFR-13).

## 7. Status Interpretasi & Executive Brief

```mermaid
stateDiagram-v2
    [*] --> Memuat: parameter berubah / generate ditekan
    Memuat --> AI: LLM merespons dan validasi lolos
    Memuat --> Template: timeout, error, atau validasi gagal
    AI --> Usang: parameter berubah
    Template --> Usang: parameter berubah
    Usang --> Memuat: interpretasi diminta ulang
```

Catatan:
- Interpretasi skenario diperbarui otomatis setelah input berhenti berubah; hasil usang dibatalkan.
- Executive Brief di-generate on-demand dan ditandai usang bila parameter berubah.
- Baik interpretasi maupun brief adalah draf AI, bukan keputusan kebijakan (FR-R11).
