# C4 Level 3 — Component Diagram (Frontend Dashboard)

Komponen di dalam Dashboard SPA. Prototipe mengimplementasikan layanan dengan mock, tetapi kontraknya sama dengan layanan produksi.

```mermaid
flowchart TB
    subgraph APP["App Shell"]
        ROUTER["Router<br/>/ops"]
        LAYOUT["OpsLayout<br/>header, ModeBanner,<br/>DisclaimerBanner"]
    end

    subgraph FEAT["Feature Modules"]
        MAPF["map/<br/>MapView, NodeLayer,<br/>EdgeLayer, HeatmapLayer,<br/>MapLegend, LayerToggle"]
        SIMF["simulation/<br/>RainfallSlider,<br/>LandUseControl,<br/>ScenarioButtons, ScenarioCompare"]
        CHARTF["charts/<br/>DischargeChart,<br/>ProjectionChart"]
        RECF["recommendation/<br/>RecommendationCard,<br/>ConfidenceBadge, SourceBadge,<br/>OperatorDecision, AuditLogPanel"]
        ALERTF["alerts/<br/>AlertDraftPanel"]
        HISTF["history/<br/>TimelinePlayer"]
        STATUSF["status/<br/>DataStatusPage,<br/>ServiceStatusList"]
    end

    subgraph STATE["State"]
        SIMSTORE["simulationStore<br/>Zustand: input, skenario aktif"]
        OPSTORE["operatorStore<br/>Zustand: keputusan, log"]
        QUERY["TanStack Query<br/>hasil simulasi, narasi"]
    end

    subgraph SVC["Service Layer (services/)"]
        SIMSVC["simulationService<br/>interface: run(scenario)"]
        NARR["narrativeService<br/>provider: llm → timeout → rule-based"]
        DATASVC["dataService<br/>GeoJSON, node, edge, status"]
        DRAFT["draftService<br/>susun teks peringatan"]
    end

    subgraph ADAPT["Adapter"]
        MOCKSIM["mockSimulation<br/>(prototipe)"]
        MOCKLLM["mockLlm<br/>delay & gagal acak"]
        RULE["ruleBasedNarrative<br/>template"]
        VALID["validateNarrative<br/>cek angka (FR-R5)"]
    end

    subgraph SHARED["Shared"]
        SCHEMA["schemas/ (Zod)"]
        I18N["i18n/id.ts"]
        FMT["lib/format.ts<br/>angka, WIB"]
        RISK["lib/risk.ts<br/>warna & label level"]
        UI["components/ui/<br/>shadcn"]
    end

    ROUTER --> LAYOUT
    LAYOUT --> MAPF
    LAYOUT --> SIMF
    LAYOUT --> CHARTF
    LAYOUT --> RECF
    LAYOUT --> ALERTF
    LAYOUT --> HISTF
    LAYOUT --> STATUSF

    SIMF --> SIMSTORE
    RECF --> OPSTORE
    MAPF --> QUERY
    CHARTF --> QUERY
    RECF --> QUERY

    QUERY --> SIMSVC
    QUERY --> NARR
    MAPF --> DATASVC
    ALERTF --> DRAFT
    STATUSF --> DATASVC

    SIMSVC --> MOCKSIM
    NARR --> MOCKLLM
    NARR --> RULE
    NARR --> VALID
    DATASVC --> SCHEMA
    MOCKSIM --> SCHEMA
    DRAFT --> RISK

    MAPF --> UI
    SIMF --> UI
    RECF --> UI
    CHARTF --> UI
    RECF --> FMT
    RECF --> I18N
```

## Aturan Dependensi

- Feature tidak boleh mengimpor feature lain. Berbagi lewat store atau `shared/`.
- Komponen tidak memanggil adapter langsung. Selalu lewat service.
- `services/` tidak mengimpor React.
- Adapter mock dan adapter produksi memiliki interface yang sama. Berganti implementasi cukup mengubah binding di satu tempat.
- Tidak ada `fetch` di komponen (sesuai `01-rules.md`).

## Kontrak Layanan (ringkas)

| Layanan | Input | Output |
|---|---|---|
| `simulationService.run` | `{ intensitasMmJam, konversiLahanPersen, scenarioId? }` | `{ hasilId, debitPerNode, debitPerSegmen, proyeksi[], confidence, dihitungPada }` |
| `narrativeService.generate` | `hasil` | `{ teks, sumber: 'llm' \| 'rule_based', confidence, modelLabel, dibuatPada }` |
| `dataService.getNodes` | — | `Node[]` + `status` |
| `draftService.build` | `rekomendasi, segmen` | `{ level, teksPublik, estimasiTibaMenit }` |

Detail lengkap ada di Zod schema (`schemas/`).
