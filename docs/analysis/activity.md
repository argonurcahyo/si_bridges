# Activity Diagram — Alur EWS & Simulator

## 1. Alur EWS — Operator dan Warga

Alur utama dari membuka dashboard operator sampai warga menerima peringatan.

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka dashboard /ops]
    B --> C{Data node tersedia?}
    C -- Tidak --> C1[Tampilkan state error<br/>dan tombol muat ulang]
    C1 --> B
    C -- Ya --> D[Lihat peta dan status data]
    D --> E{Ada kondisi perlu dicek?}
    E -- Ya --> F[Klik node atau segmen<br/>lihat detail]
    F --> D
    E -- Tidak --> G[Geser slider hujan<br/>atau pilih konversi lahan]
    G --> H[Sistem menghitung ulang<br/>setelah 300 ms]
    H --> I{Simulasi berhasil?}
    I -- Tidak --> I1[Pertahankan hasil lama<br/>label Belum diperbarui]
    I1 --> G
    I -- Ya --> J[Tampilkan debit, proyeksi,<br/>dan peta]
    J --> K{LLM merespons<br/>dalam 5 detik?}
    K -- Ya --> L{Validasi angka lolos?}
    K -- Tidak --> M[Rule-based fallback<br/>badge Rule-based]
    L -- Tidak --> M
    L -- Ya --> N[Narasi rekomendasi AI tampil]
    M --> O{Confidence >= 85%?}
    N --> O
    O -- Tidak --> P[Tampilkan label<br/>Memerlukan Konfirmasi<br/>Petugas Lapangan]
    O -- Ya --> Q[Tampilkan confidence]
    P --> R[Operator membaca rekomendasi]
    Q --> R
    R --> S{Keputusan rekomendasi taktis}
    S -- Diterima/Ditolak/Verifikasi --> T[Catat di log audit]
    S -- Belum memutuskan --> G
    T --> U{Ada wilayah waspada/siaga?}
    U -- Tidak --> G
    U -- Ya --> V[Buka panel peringatan O-06]
    V --> W[AI menyusun pesan peringatan<br/>dari konteks terhitung]
    W --> X{LLM dan validasi lolos?}
    X -- Tidak --> X1[Template + badge sumber]
    X -- Ya --> X2[Pesan AI + provenance]
    X1 --> Y[Operator meninjau dan menyunting]
    X2 --> Y
    Y --> Z{Keputusan operator}
    Z -- Siarkan --> AA[Status disiarkan<br/>feed publik per wilayah]
    Z -- Tolak --> AB[Status ditolak]
    Z -- Tutup --> AC[Status tetap draf]
    AA --> AD[Warga memilih wilayah]
    AD --> AE[Warga melihat peringatan resmi]
    AE --> AF{Ditarik / kedaluwarsa /<br/>digantikan?}
    AF -- Ya --> AG[Peringatan hilang dari warga]
    AF -- Tidak --> AE
    AB --> AH([Selesai])
    AC --> AH
    AG --> AH
```

## 2. Alur Simulator — Perencana

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka /rencana]
    B --> C{Data kelurahan tersedia?}
    C -- Tidak --> C1[Tampilkan error<br/>dan tombol muat ulang]
    C1 --> B
    C -- Ya --> D[Render parameter dari registry]
    D --> E[Perencana mengubah parameter]
    E --> F[Setelah input berhenti<br/>simulasi dihitung ulang]
    F --> G[Tampilkan peta kedalaman<br/>dan panel dampak]
    G --> H[AI menyusun interpretasi otomatis]
    H --> I{LLM dan validasi lolos?}
    I -- Tidak --> I1[Interpretasi template]
    I -- Ya --> I2[Interpretasi AI + provenance]
    I1 --> J[Perencana membaca interpretasi]
    I2 --> J
    J --> K{Generate Executive Brief?}
    K -- Tidak --> E
    K -- Ya --> L[AI menyusun brief dari konteks skenario]
    L --> M{LLM dan validasi lolos?}
    M -- Tidak --> M1[Brief template]
    M -- Ya --> M2[Brief AI + provenance]
    M1 --> N[Brief tampil sebagai draf]
    M2 --> N
    N --> O[Perencana menyalin / mengunduh Markdown]
    O --> P{Parameter berubah?}
    P -- Ya --> Q[Brief dan interpretasi ditandai usang]
    Q --> E
    P -- Tidak --> R([Selesai])
```

## Catatan

- Operator dapat kembali ke simulasi kapan saja. Keputusan dan peringatan lama tetap tercatat di log.
- Jalur fallback selalu tersedia; operator tidak pernah menerima layar kosong saat LLM gagal.
- Peringatan publik tidak pernah berasal langsung dari simulasi. Hanya peringatan yang disiarkan operator yang dapat dibaca warga (FR-34, FR-R10).
- Menyunting pesan tidak menimpa teks AI asli. Keduanya disimpan untuk audit (FR-R9).
