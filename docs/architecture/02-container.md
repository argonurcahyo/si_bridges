# C4 Level 2 — Container Diagram

Menunjukkan komponen deployable utama dan bagaimana mereka berkomunikasi untuk dua use case: EWS dan Simulator.

```mermaid
flowchart TB
    OP["Operator<br/>(browser)"]
    WG["Warga<br/>(browser mobile)"]
    PR["Perencana<br/>(browser)"]

    subgraph FE["Frontend — HydroTwin-AI SPA"]
        UI["React + Vite + shadcn/ui<br/>peta MapLibre, grafik, panel"]
        EWS["EWS UI<br/>/ops + /warga"]
        SIM["Simulator UI<br/>/rencana"]
        STORE["State lokal<br/>Zustand + TanStack Query"]
        PUB["Publication channel<br/>localStorage + BroadcastChannel<br/>(prototipe)"]
    end

    subgraph BE["Backend — Layanan Inti (produksi)"]
        GW["API Gateway / BFF<br/>FastAPI, autentikasi (tahap lanjut)"]
        SIMSVC["Simulation Service<br/>debit, proyeksi, kedalaman, confidence"]
        GRAPH["Graph Engine<br/>NetworkX, routing DAG"]
        ALERT["Alert Service<br/>siklus peringatan + publikasi per wilayah"]
        LLMA["LLM Adapter<br/>timeout 5 s, validasi angka/tone,<br/>template fallback"]
        AUD["Audit Service<br/>keputusan, peringatan, LLM"]
    end

    subgraph DATA["Data"]
        PG[("PostgreSQL + PostGIS<br/>node, edge, segmen, keputusan,<br/>peringatan, log")]
        OBJ[("Object storage<br/>GeoJSON, raster DEMNAS, tile")]
        CACHE[("Cache<br/>hasil simulasi")]
    end

    subgraph PIPE["Data Pipeline (offline)"]
        ING["Ingest & konversi<br/>SHP → GeoJSON WGS84"]
        LULC["Ekstraksi LULC<br/>GEE Python API"]
        TMAJ["Penjadwalan TMA & hujan"]
    end

    LLMEXT["Layanan AI/LLM eksternal<br/>(mock pada prototipe)<br/>pesan, interpretasi, brief"]

    OP --> EWS
    WG --> EWS
    PR --> SIM
    EWS <--> STORE
    SIM <--> STORE
    EWS <--> PUB
    EWS -->|HTTPS JSON| GW
    SIM -->|HTTPS JSON| GW
    GW --> SIMSVC
    GW --> ALERT
    GW --> AUD
    GW --> LLMA
    SIMSVC --> GRAPH
    SIMSVC --> CACHE
    GRAPH --> PG
    SIMSVC --> PG
    ALERT --> PG
    ALERT --> AUD
    LLMA -->|konteks terhitung| LLMEXT
    LLMEXT -->|narasi / interpretasi / brief| LLMA
    LLMA --> AUD
    AUD --> PG
    GW --> PG
    GW --> OBJ
    ING --> OBJ
    ING --> PG
    LULC --> PG
    TMAJ --> PG
```

## Daftar Kontainer

| Kontainer | Teknologi | Tanggung jawab | Tahap |
|---|---|---|---|
| EWS UI | React, Vite, TypeScript, Tailwind, shadcn/ui, MapLibre | Dashboard operator, panel peringatan, halaman warga | Prototipe sekarang; publikasi per wilayah F1 dan AI composer F2 selesai |
| Simulator UI | React, Recharts, MapLibre | Parameter, peta kedalaman, dampak, interpretasi, brief | Prototipe sekarang; registry F3 dan AI F4 selesai |
| State lokal + publication channel | Zustand, TanStack Query, localStorage, BroadcastChannel | State UI dan feed peringatan prototipe | Prototipe sekarang |
| API Gateway / BFF | FastAPI | Kontrak API, validasi input, orkestrasi | Produksi |
| Simulation Service | Python, NumPy, Pandas | Rational Method, routing, proyeksi, kedalaman, confidence | Produksi (mock pada prototipe) |
| Graph Engine | NetworkX | Representasi DAG node dan edge | Produksi |
| Alert Service | Python, PostgreSQL | Siklus peringatan, publikasi per wilayah, retract/expiry | Produksi |
| LLM Adapter | Python, httpx | Panggilan LLM, timeout, validasi angka/tone, fallback | Produksi (mock pada prototipe) |
| Audit Service | Python, PostgreSQL | Log keputusan, perubahan peringatan, pemanggilan LLM | Produksi |
| PostgreSQL + PostGIS | PostgreSQL 16, PostGIS | Data relasional dan spasial | Produksi |
| Object storage | S3-compatible | GeoJSON, raster DEMNAS, tile | Produksi |
| Data pipeline | GeoPandas, GEE Python API, penjadwal | Ingest dan pembaruan data | Di luar tahap ini |

## Protokol

| Dari | Ke | Protokol | Catatan |
|---|---|---|---|
| Browser | API Gateway | HTTPS, JSON | Kontrak di `docs/architecture/api-contract.md` (tahap berikutnya) |
| Publication channel | Halaman warga | BroadcastChannel | Prototipe satu browser; produksi lewat backend |
| LLM Adapter | LLM eksternal | HTTPS | API key hanya di server (FR-R7) |
| Pipeline | PostgreSQL | SQL | Upsert idempoten |

## Keputusan Terkait

- ADR-004 (LLM adapter dan fallback)
- ADR-006 (stack backend)
- Detail komponen frontend: `03-component-frontend.md`
- Rencana EWS dan Simulator: `docs/plan/ews-simulator.md`
