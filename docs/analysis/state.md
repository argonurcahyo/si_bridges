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
