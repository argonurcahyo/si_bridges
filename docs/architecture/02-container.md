# C4 Level 2 — Container Diagram

Menunjukkan komponen deployable utama dan bagaimana mereka berkomunikasi.

```mermaid
flowchart TB
    OP["Operator<br/>(browser)"]

    subgraph FE["Frontend — Dashboard SPA"]
        UI["React + Vite + shadcn/ui<br/>Peta MapLibre, grafik, panel"]
        STORE["State lokal<br/>Zustand + TanStack Query"]
    end

    subgraph BE["Backend — Layanan Inti"]
        GW["API Gateway / BFF<br/>FastAPI, autentikasi (tahap lanjut)"]
        SIM["Simulation Service<br/>Python, perhitungan debit,<br/>proyeksi, confidence"]
        GRAPH["Graph Engine<br/>NetworkX, routing DAG<br/>node & edge, lag"]
        LLMA["LLM Adapter<br/>timeout 5 s, validasi angka,<br/>rule-based fallback"]
        AUD["Audit Service<br/>log keputusan & pemanggilan LLM"]
    end

    subgraph DATA["Data"]
        PG[("PostgreSQL + PostGIS<br/>node, edge, segmen, keputusan, log")]
        OBJ[("Object storage<br/>GeoJSON, raster DEMNAS, tile")]
        CACHE[("Cache<br/>hasil simulasi")]
    end

    subgraph PIPE["Data Pipeline (offline)"]
        ING["Ingest & konversi<br/>SHP → GeoJSON WGS84<br/>GeoPandas"]
        LULC["Ekstraksi LULC<br/>GEE Python API"]
        TMAJ["Penjadwalan TMA & hujan<br/>BMKG, CHIRPS, TMA DSDA"]
    end

    LLMEXT["Layanan LLM eksternal<br/>(mock pada prototipe)"]

    OP --> UI
    UI <--> STORE
    UI -->|HTTPS JSON| GW
    GW --> SIM
    GW --> AUD
    GW --> LLMA
    SIM --> GRAPH
    SIM --> CACHE
    GRAPH --> PG
    SIM --> PG
    LLMA -->|prompt| LLMEXT
    LLMEXT -->|narasi| LLMA
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
| Dashboard SPA | React 19, Vite, TypeScript, Tailwind, shadcn/ui, MapLibre | Semua UI operator, state UI | Prototipe sekarang |
| API Gateway / BFF | FastAPI (Python) | Kontrak API ke frontend, validasi input, orkestrasi | Produksi |
| Simulation Service | Python, NumPy, Pandas | Rational Method, routing, proyeksi, confidence | Produksi (mock pada prototipe) |
| Graph Engine | NetworkX | Representasi DAG node dan edge | Produksi |
| LLM Adapter | Python, httpx | Panggilan LLM, timeout, validasi, fallback | Produksi (mock pada prototipe) |
| Audit Service | Python, PostgreSQL | Log keputusan dan pemanggilan LLM | Produksi |
| PostgreSQL + PostGIS | PostgreSQL 16, PostGIS | Data relasional dan spasial | Produksi |
| Object storage | S3-compatible | GeoJSON, raster DEMNAS, tile | Produksi |
| Data pipeline | GeoPandas, GEE Python API, penjadwal | Ingest dan pembaruan data | Di luar tahap ini |

## Protokol

| Dari | Ke | Protokol | Catatan |
|---|---|---|---|
| Browser | API Gateway | HTTPS, JSON | Kontrak di `docs/architecture/api-contract.md` (tahap berikutnya) |
| LLM Adapter | LLM eksternal | HTTPS | API key hanya di server (FR-R7) |
| Pipeline | PostgreSQL | SQL | Upsert idempoten |

## Keputusan Terkait

- ADR-004 (LLM adapter dan fallback)
- ADR-006 (stack backend)
- Detail komponen frontend: `03-component-frontend.md`
