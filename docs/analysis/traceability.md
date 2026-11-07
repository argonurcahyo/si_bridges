# Traceability Matrix — Dashboard Operasional

Menghubungkan requirement ke use case, user story, layar prototipe, dan komponen.

Kolom: **FR/NFR** → **UC** → **US** → **Layar** → **Komponen (prototipe)**.

| FR/NFR | Use Case | User Story | Layar | Komponen |
|---|---|---|---|---|
| FR-01 | UC-01 | US-01 | O-01 | `MapView`, `NodeLayer`, `EdgeLayer` |
| FR-02 | UC-01 | US-02 | O-01 | `MapView`, `MapModeToggle` |
| FR-03 | UC-01 | US-03 | O-01 | `LayerToggle` |
| FR-04 | UC-01 | US-01 | O-01 | `HeatmapLayer`, `MapLegend` |
| FR-05 | UC-10 | US-04 | O-02 | `NodeDetailSheet` |
| FR-06 | UC-01 | US-01 | O-01 | `NodeStatusList` |
| FR-07 | UC-02 | US-05 | O-01 | `RainfallSlider` |
| FR-08 | UC-03 | US-06 | O-01 | `LandUseControl` |
| FR-09 | UC-06 | US-07 | O-01 | `ScenarioButtons` |
| FR-10 | UC-06 | US-08 | O-03 | `ScenarioCompare` |
| FR-11 | UC-02, UC-03 | US-05 | O-01 | `RainfallSlider`, `LandUseControl` |
| FR-12 | UC-02 | US-05 | O-01 | `useSimulation` (debounce) |
| FR-13 | UC-04 | US-09 | O-01 | `DischargeChart` |
| FR-14 | UC-05 | US-10 | O-01 | `ProjectionChart` |
| FR-15 | UC-11 | US-17 | O-05 | `TimelinePlayer` |
| FR-20 | UC-07 | US-11 | O-04 | `RecommendationCard` |
| FR-21 | UC-07, UC-14 | US-11, US-12 | O-04 | `NarrativeService`, `SourceBadge` |
| FR-22 | UC-05, UC-07 | US-13 | O-01, O-04 | `ConfidenceBadge` |
| FR-23 | UC-05, UC-07 | US-10, US-13 | O-01, O-04 | `ConfidenceBadge` (label konfirmasi) |
| FR-24 | UC-08 | US-14 | O-04 | `OperatorDecision` |
| FR-25 | UC-08, UC-13 | US-14, US-15 | O-04 | `operatorStore`, `AuditLogPanel` |
| FR-26 | UC-09 | US-16 | O-06 | `AlertDraftPanel` |
| FR-27 | UC-14 | US-12 | O-01 (toggle developer) | `DevFailureToggle` |
| FR-28 | UC-12 | US-18 | O-07 | `DataStatusPage` |
| FR-29 | UC-12 | US-19 | Semua layar (header) | `ModeBanner` |
| FR-30 | UC-12 | US-20 | O-07 | `ServiceStatusList` |
| FR-31 | Semua | — | Semua layar | `i18n/id.ts`, `formatters` |
| FR-32 | Semua | — | Semua layar | `DisclaimerBanner` |
| FR-33 | UC-01, UC-02 | US-21 | O-08 | `EmptyState`, `ErrorState`, `LoadingSkeleton` |
| FR-R1 | UC-08 | US-14 | O-04 | `OperatorDecision` (tanpa efek fisik) |
| FR-R2 | UC-05, UC-07 | US-13 | O-01, O-04 | `ConfidenceBadge` |
| FR-R3 | UC-14 | US-12 | O-04 | `NarrativeService` (fallback) |
| FR-R4 | UC-07 | US-11 | O-04 | `RecommendationCard` (meta) |
| FR-R5 | UC-07 | US-11 | O-04 | `validateNarrative` |
| FR-R6 | UC-09 | US-16 | O-06 | `AlertDraftPanel` (bahasa) |
| FR-R7 | Arsitektur | — | — | `04-deployment.md` (proxy) |
| NFR-01 | UC-02 | US-05 | O-01 | `useSimulation` |
| NFR-02 | UC-01 | — | O-01 | Code splitting |
| NFR-03 | Semua | — | Semua | Layout responsif |
| NFR-04 | Semua | — | Semua | `a11y-checklist.md` |
| NFR-05 | Arsitektur | — | — | `.env.example`, review |
| NFR-06 | Semua | — | — | Tidak ada pelacakan lokasi |
| NFR-07 | UC-14 | US-12 | O-01, O-08 | Fallback, cache |
| NFR-08 | Arsitektur | — | — | `03-component-frontend.md` |
| NFR-09 | Semua | — | — | Vitest, Playwright |
| NFR-10 | Semua | — | — | Matriks browser |
| NFR-11 | UC-13 | US-15 | O-04 | `AuditLogPanel` |
| NFR-12 | UC-01, UC-04 | US-09 | O-01 | Tipografi di `design-tokens.md` |

## Cakupan

- Setiap FR dan NFR minimal terhubung ke satu use case dan satu layar.
- Requirement tanpa user story (FR-31, FR-32, FR-R7, NFR-02 sampai NFR-12) adalah requirement lintas-cutting. Dicek di review, bukan lewat story.
- Setiap use case terhubung minimal ke satu user story.

## Pemeriksaan Ulang

Ulangi tabel ini setiap kali requirement, use case, atau layar berubah.
