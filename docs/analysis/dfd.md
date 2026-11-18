# Data Flow Diagram — HydroTwin-AI (EWS & Simulator)

Lingkup: dua use case, **Early Warning System (EWS)** dan **Simulator**, beserta batas dengan data serta layanan di sekitarnya. Pemodelan hidrologi di dalam "Sistem Simulasi" diperlakukan sebagai kotak hitam dengan kontrak tetap.

## 1. DFD Level 0 (Context)

```mermaid
flowchart LR
    OP((Operator BPBD/DSDA))
    WG((Warga))
    PR((Perencana))
    AD((Admin Data))
    EXT1[(Sumber TMA DSDA)]
    EXT2[(BMKG / CHIRPS)]
    EXT3[(GEE / Sentinel-2 / Landsat)]
    EXT4[(Peta Kita / Jakarta Satu)]
    LLM{{Layanan AI/LLM}}

    SYS[HydroTwin-AI<br/>EWS & Simulator]

    EXT1 -->|data TMA| SYS
    EXT2 -->|data hujan| SYS
    EXT3 -->|LULC & citra| SYS
    EXT4 -->|batas admin & DAS| SYS
    AD -->|SHP, DEMNAS| SYS
    OP -->|input skenario & keputusan| SYS
    SYS -->|peta, grafik, rekomendasi| OP
    SYS -->|pesan peringatan tersunting| LLM
    LLM -->|narasi peringatan| SYS
    SYS -->|peringatan disiarkan| WG
    PR -->|parameter kebijakan| SYS
    SYS -->|peta, dampak, interpretasi, brief| PR
    SYS -->|prompt konteks terhitung| LLM
    LLM -->|interpretasi & brief| SYS
```

## 2. DFD Level 1 — EWS

```mermaid
flowchart TB
    OP((Operator))
    WG((Warga))
    EXT_LLM{{Layanan AI/LLM}}

    subgraph EWS[Early Warning System]
        P1[1.0<br/>Muat data geospasial]
        P2[2.0<br/>Kelola input skenario]
        P3[3.0<br/>Jalankan simulasi]
        P4[4.0<br/>Hasilkan rekomendasi taktis]
        P5[5.0<br/>Catat keputusan operator]
        P6[6.0<br/>Susun pesan peringatan AI]
        P7[7.0<br/>Siarkan / tarik peringatan]
        P8[8.0<br/>Tampilkan status data]
        P9[9.0<br/>Tampilkan peringatan publik]
    end

    subgraph Penyimpanan
        D1[(D1 Data geospasial<br/>GeoJSON)]
        D2[(D2 Data node & edge)]
        D3[(D3 Hasil simulasi)]
        D4[(D4 Rekomendasi)]
        D5[(D5 Log audit)]
        D6[(D6 Peringatan per wilayah)]
        D7[(D7 Publikasi wilayah)]
    end

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

    D3 --> P6
    D4 --> P6
    P6 -->|prompt konteks| EXT_LLM
    EXT_LLM -->|pesan atau gagal| P6
    P6 -->|teks AI + template| OP
    OP -->|sunting, siarkan, tolak| P7
    P6 -->|draf| D6
    P7 -->|status + teks final| D6
    P7 -->|pointer aktif| D7
    P7 -->|entri| D5

    D7 --> P9
    D6 --> P9
    P9 -->|peringatan aktif| WG

    D3 --> P8
    D1 --> P8
    P8 -->|status| OP

    D3 -->|peta & grafik| OP
    D4 -->|narasi & confidence| OP
    D5 -->|riwayat| OP
```

## 3. DFD Level 1 — Simulator

```mermaid
flowchart TB
    PR((Perencana))
    EXT_LLM{{Layanan AI/LLM}}

    subgraph Sim[Simulator]
        P10[10.0<br/>Kelola parameter skenario]
        P11[11.0<br/>Jalankan simulasi kebijakan]
        P12[12.0<br/>Tampilkan peta & dampak]
        P13[13.0<br/>Susun interpretasi AI]
        P14[14.0<br/>Susun Executive Brief]
    end

    subgraph Penyimpanan
        D8[(D8 Skenario kebijakan)]
        D9[(D9 Interpretasi)]
        D10[(D10 Executive Brief)]
        D5[(D5 Log audit)]
    end

    PR -->|parameter| P10
    P10 -->|parameter valid| D8
    D8 --> P11
    P11 -->|hasil skenario| P12
    P12 -->|peta & dampak| PR
    P11 --> P13
    P13 -->|prompt konteks| EXT_LLM
    EXT_LLM -->|interpretasi atau gagal| P13
    P13 -->|interpretasi| D9
    D9 -->|teks + provenance| PR
    PR -->|generate brief| P14
    P11 --> P14
    P14 -->|prompt konteks| EXT_LLM
    EXT_LLM -->|brief atau gagal| P14
    P14 -->|brief| D10
    D10 -->|salin / unduh| PR
    P13 -->|entri| D5
    P14 -->|entri| D5
```

## 4. Kamus Data

| ID | Nama | Isi | Pemilik |
|---|---|---|---|
| D1 | Data geospasial | Kelurahan, DAS, jaringan sungai (GeoJSON WGS84) | Tim AI |
| D2 | Data node & edge | Pintu air, sensor, segmen, lag, ambang TMA | Tim AI |
| D3 | Hasil simulasi | Debit per node & segmen, proyeksi 3–6 jam, confidence | Sistem Simulasi |
| D4 | Rekomendasi taktis | Teks, sumber, confidence, waktu generasi, status | Tim SWE |
| D5 | Log audit | Keputusan, perubahan peringatan, pemanggilan LLM, fallback | Tim SWE |
| D6 | Peringatan per wilayah | Teks AI, teks final, level, status, operator, waktu | Tim SWE |
| D7 | Publikasi wilayah | Pointer peringatan aktif per wilayah | Tim SWE |
| D8 | Skenario kebijakan | Parameter registry, nilai, waktu | Tim SWE |
| D9 | Interpretasi | Teks interpretasi, sumber, model, waktu | Tim SWE |
| D10 | Executive Brief | Teks brief, sumber, model, status | Tim SWE |

## 5. Aturan Aliran

- Operator tidak berinteraksi langsung dengan D1 atau D2. Semua akses melalui proses.
- Prompt ke LLM hanya berisi konteks hasil yang sudah dihitung, tidak berisi data pribadi atau data mentah.
- Tidak ada aliran dari proses keputusan ke sistem fisik. Keputusan hanya berhenti di D5 (FR-R1).
- Tidak ada aliran langsung dari D3 ke warga. Warga hanya membaca D7/D6 yang sudah disiarkan operator (FR-34, FR-R10).
- Jika LLM gagal, proses 4.0, 6.0, 13.0, dan 14.0 menghasilkan keluaran template dan menandai sumbernya (FR-R3).
- AI tidak menentukan level risiko; level berasal dari D3 (FR-R8).
