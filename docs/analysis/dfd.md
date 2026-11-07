# Data Flow Diagram — HydroGraph-AI (Dashboard)

Lingkup: dashboard dan batas dengan data serta layanan di sekitarnya. Pemodelan hidrologi di dalam "Sistem Simulasi" diperlakukan sebagai kotak hitam dengan kontrak tetap.

## 1. DFD Level 0 (Context)

```mermaid
flowchart LR
    OP((Operator BPBD/DSDA))
    AD((Admin Data))
    EXT1[(Sumber TMA DSDA)]
    EXT2[(BMKG / CHIRPS)]
    EXT3[(GEE / Sentinel-2 / Landsat)]
    EXT4[(Peta Kita / Jakarta Satu)]
    LLM{{Layanan LLM}}

    SYS[HydroGraph-AI<br/>Dashboard Operasional]

    EXT1 -->|data TMA| SYS
    EXT2 -->|data hujan| SYS
    EXT3 -->|LULC & citra| SYS
    EXT4 -->|batas admin & DAS| SYS
    AD -->|SHP, DEMNAS | SYS
    OP -->|input skenario & keputusan| SYS
    SYS -->|peta, grafik, rekomendasi| OP
    SYS -->|prompt ringkasan hasil| LLM
    LLM -->|narasi| SYS
```

## 2. DFD Level 1

```mermaid
flowchart TB
    OP((Operator))

    subgraph Proses
        P1[1.0<br/>Muat data geospasial]
        P2[2.0<br/>Kelola input skenario]
        P3[3.0<br/>Jalankan simulasi]
        P4[4.0<br/>Hasilkan rekomendasi]
        P5[5.0<br/>Catat keputusan]
        P6[6.0<br/>Susun draf peringatan]
        P7[7.0<br/>Tampilkan status data]
    end

    subgraph Penyimpanan
        D1[(D1 Data geospasial<br/>GeoJSON)]
        D2[(D2 Data node & edge)]
        D3[(D3 Hasil simulasi)]
        D4[(D4 Rekomendasi)]
        D5[(D5 Log audit)]
    end

    EXT_LLM{{Layanan LLM}}

    AD((Admin Data)) -->|SHP/DEMNAS terkonversi| P1
    P1 -->|simpan| D1
    P1 -->|simpan| D2

    OP -->|slider, konversi, skenario| P2
    P2 -->|input valid| P3
    D2 --> P3
    D1 --> P3
    P3 -->|hasil| D3
    D3 --> P4
    P4 -->|prompt| EXT_LLM
    EXT_LLM -->|narasi atau gagal| P4
    P4 -->|rekomendasi| D4

    OP -->|Diterima/Ditolak/Verifikasi| P5
    D4 --> P5
    P5 -->|entri| D5

    D4 --> P6
    D3 --> P6
    P6 -->|draf| OP

    D3 --> P7
    D1 --> P7
    P7 -->|status| OP

    D3 -->|peta & grafik| OP
    D4 -->|narasi & confidence| OP
    D5 -->|riwayat| OP
```

## 3. Kamus Data

| ID | Nama | Isi | Pemilik |
|---|---|---|---|
| D1 | Data geospasial | Kelurahan, DAS, jaringan sungai (GeoJSON WGS84) | Tim AI |
| D2 | Data node & edge | Pintu air, sensor, segmen, lag, ambang TMA | Tim AI |
| D3 | Hasil simulasi | Debit per node & segmen, proyeksi 3–6 jam, confidence | Sistem Simulasi |
| D4 | Rekomendasi | Teks, sumber, confidence, waktu generasi, status | Tim SWE |
| D5 | Log audit | ID rekomendasi, keputusan, waktu WIB, sumber | Tim SWE |

## 4. Aturan Aliran

- Operator tidak berinteraksi langsung dengan D1 atau D2. Semua akses melalui proses.
- Prompt ke LLM hanya berisi ringkasan hasil simulasi, tidak berisi data pribadi.
- Tidak ada aliran dari proses 5.0 ke sistem fisik. Keputusan hanya berhenti di D5 (FR-R1).
- Jika LLM gagal, proses 4.0 menghasilkan rekomendasi rule-based dan menandai sumbernya (FR-R3).
