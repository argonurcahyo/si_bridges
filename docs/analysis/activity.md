# Activity Diagram — Alur Kerja Operator

Alur utama dari membuka dashboard sampai menyalin draf peringatan.

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
    L -- Ya --> N[Narasi AI tampil]
    M --> O{Confidence >= 85%?}
    N --> O
    O -- Tidak --> P[Tampilkan label<br/>Memerlukan Konfirmasi<br/>Petugas Lapangan]
    O -- Ya --> Q[Tampilkan confidence]
    P --> R[Operator membaca rekomendasi]
    Q --> R
    R --> S{Keputusan operator}
    S -- Diterima --> T[Catat di log audit]
    S -- Ditolak --> T
    S -- Perlu Verifikasi --> T
    S -- Belum memutuskan --> G
    T --> U{Perlu peringatan publik?}
    U -- Tidak --> G
    U -- Ya --> V[Buka draf peringatan O-06]
    V --> W[Tinjau teks<br/>per kelurahan]
    W --> X{Teks sudah sesuai?}
    X -- Tidak --> W
    X -- Ya --> Y[Salin teks]
    Y --> Z([Selesai])
    Y -.->|sistem tidak mengirim| Z
```

## Catatan

- Operator dapat kembali ke simulasi kapan saja. Keputusan lama tetap tercatat di log.
- Jalur fallback (M) selalu tersedia. Operator tidak pernah menerima layar kosong saat LLM gagal.
- Penyalinan teks adalah satu-satunya bentuk "distribusi" pada prototipe.
