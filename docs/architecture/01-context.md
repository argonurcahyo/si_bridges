# C4 Level 1 — System Context

Menunjukkan HydroGraph-AI sebagai satu kotak dengan pengguna dan sistem eksternal di sekitarnya.

```mermaid
flowchart TB
    OP["Operator BPBD/DSDA<br/>(pengguna)"]
    AD["Admin Data<br/>(pengguna)"]
    PUB["Masyarakat<br/>(web publik, tahap berikutnya)"]

    SYS["HydroGraph-AI<br/>Super Intelligence (SI) untuk pemantauan,<br/>prediksi limpasan mikro, dan<br/>skenario mitigasi banjir"]

    LLM["Layanan LLM<br/>Gemini (mock pada prototipe)"]
    GEE["Google Earth Engine<br/>Sentinel-2, Landsat"]
    BMKG["BMKG & CHIRPS<br/>Data hujan & prakiraan"]
    TMA["Sensor TMA DSDA<br/>Katulampa, Depok, Manggarai"]
    BIG["BIG / Peta Kita<br/>DEMNAS, batas admin, DAS"]

    OP -->|pantau, simulasi, keputusan| SYS
    AD -->|impor & kelola data| SYS
    SYS -->|narasi rekomendasi| OP
    SYS -.->|draf peringatan, tahap berikutnya| PUB

    SYS -->|prompt ringkasan hasil| LLM
    LLM -->|narasi| SYS
    GEE -->|LULC & citra| SYS
    BMKG -->|data hujan| SYS
    TMA -->|TMA real-time & historis| SYS
    BIG -->|DEM & geometri| SYS
```

## Batas Sistem

| Di dalam | Di luar |
|---|---|
| Dashboard operasional | Pemodelan hidrologi lanjutan (kalibrasi, Manning penuh) |
| Layanan simulasi dan graf | Pengiriman peringatan ke warga |
| Adapter LLM dan fallback | Kontrol pintu air dan pompa fisik |
| Log audit keputusan | Sistem SMS/broadcast BPBD |

## Catatan

- Sistem tidak memberikan kendali fisik ke sistem lain. Panah dari sistem ke infrastruktur sengaja tidak ada (FR-R1).
- Web publik ditampilkan dengan garis putus-putus karena di luar lingkup tahap ini.
