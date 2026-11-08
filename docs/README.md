# Dokumentasi HydroTwin-AI

Dokumentasi untuk prototipe HydroTwin-AI: Dashboard Operasional, Konsol Perencana, dan PWA Warga. Status: **draf v0.2** (belum ditinjau tim).

![Konsol Perencana](ui-prototype/screenshots/12-konsol-perencana.png)

Pemilik: Tim SWE (Argo Nurcahyo, Yovi Maulana Nugraha). Tim AI (Jhonathan Putro Siahaan, Eka Miftakhul Rachmawati, Meidiana Rahmawati) memberi masukan untuk data, simulasi, dan LLM.

## Peta Dokumen

### Analisis (`analysis/`)

| Dokumen | Isi |
|---|---|
| `requirements.md` | Requirement fungsional (FR) dan non-fungsional (NFR) |
| `use-cases.md` | Aktor, diagram use case, dan spesifikasi UC-01 sampai UC-14 |
| `user-stories.md` | Epic, 21 user story, dan kriteria penerimaan |
| `traceability.md` | Keterkaitan requirement, use case, story, layar, dan komponen |
| `dfd.md` | Data flow diagram level 0 dan 1 |
| `activity.md` | Alur kerja operator |
| `state.md` | Status rekomendasi, sumber narasi, level risiko, layanan, mode |
| `data-model.md` | ERD dan kamus data |
| `risks.md` | Risiko, asumsi, dan isu terbuka |
| `glossary.md` | Istilah dan singkatan |
| `responsible-ai-review.md` | Checklist Responsible AI |

### Arsitektur (`architecture/`)

| Dokumen | Isi |
|---|---|
| `01-context.md` | C4 level 1, konteks sistem |
| `02-container.md` | C4 level 2, kontainer dan protokol |
| `03-component-frontend.md` | C4 level 3, komponen frontend dan kontrak layanan |
| `04-deployment.md` | Deployment prototipe, staging, dan produksi |
| `05-arsitektur-si.md` | Tiga lapisan SI, status komponen, pipeline pemodelan |
| `06-arsitektur-spbe.md` | Arsitektur SPBE 6 domain untuk HydroTwin-AI |
| `sequence.md` | Sequence diagram: slider, narasi & fallback, keputusan, draf |
| `adr/ADR-001` sampai `ADR-006` | Keputusan arsitektur |

### UI Prototipe (`ui-prototype/`)

| Dokumen | Isi |
|---|---|
| `README.md` | Site map dan prinsip prototipe |
| `screen-inventory.md` | Daftar layar O-01 sampai O-08 dan varian |
| `wireframes.md` | Struktur layar (low fidelity) |
| `design-tokens.md` | Warna, tipografi, spacing, peta |
| `interaction-spec.md` | Perilaku setiap kontrol |
| `demo-script.md` | Skrip demo 6–7 menit |
| `a11y-checklist.md` | Checklist aksesibilitas WCAG 2.1 AA |
| `usability-notes.md` | Template uji pengguna |
| `screenshots/` | Tangkapan layar prototipe (10 gambar) |
| `hydrotwin/` | Mockup HydroTwin-AI: konsol perencana + PWA, sumber HTML dan PNG |

## Urutan Membaca

1. `analysis/requirements.md`
2. `analysis/use-cases.md`
3. `architecture/01-context.md`
4. `architecture/02-container.md`
5. `ui-prototype/README.md`
6. Sisanya sesuai kebutuhan

### Rencana (`plan/`)

| Dokumen | Isi |
|---|---|
| `plan/README.md` | Indeks rencana dan cara pakai |
| `plan/web-publik.md` | Rencana web publik: snapshot, data desa, zonasi, offline (Q0–Q7) |
| `plan/dashboard.md` | Status dashboard P0–P5 dan sisa pekerjaan P6 |

### Diagram Editable (`diagrams/`)
File `.drawio` dapat dibuka di [diagrams.net](https://app.diagrams.net) atau ekstensi VS Code "Draw.io Integration".

| File | Diagram |
|---|---|
| `01-context.drawio` | Context (C4 L1) |
| `02-container.drawio` | Container (C4 L2) |
| `03-component-frontend.drawio` | Component frontend (C4 L3) |
| `04-deployment-produksi.drawio` | Deployment produksi |
| `05-dfd-level-0.drawio` | DFD level 0 |
| `06-dfd-level-1.drawio` | DFD level 1 |
| `07-use-case.drawio` | Use case |
| `08-activity.drawio` | Activity, alur operator |

Sequence, state, dan ERD masih tersedia dalam Mermaid di `analysis/` dan `architecture/`.

## Konvensi

- Diagram ditulis dalam Mermaid dan dapat dirender langsung di GitHub.
- ID requirement mengikuti `analysis/requirements.md`. Jangan mengubah ID yang sudah dipakai di traceability.
- Data demo selalu diberi label mock atau sintetis.
- Bahasa dokumen Indonesia. Istilah teknis tetap Inggris bila lazim.

## Belum Ada (Tahap Berikutnya)

- Kontrak API (`api-contract.md`)
- Hasil uji usability
- Halaman web publik (rencana: `plan/web-publik.md`)
- Playwright e2e dan audit aksesibilitas (P6 dashboard)
