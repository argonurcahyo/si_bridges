# ADR-006 — Stack Backend: Python, FastAPI, PostgreSQL + PostGIS

| Status | Diusulkan (belum dibahas tim) |
|---|---|
| Tanggal | 2026-11 |
| Pengambil keputusan | Tim SWE (Argo), Tim AI |

## Konteks

Proposal menyebut "microservices/REST API (Python/Laravel)". Pipeline data dan simulasi memakai GeoPandas, NetworkX, dan GEE Python API, yang semuanya berada di ekosistem Python. Dashboard hanya membutuhkan API untuk prototipe nyata di masa depan.

## Keputusan yang Diusulkan

- **Python 3.12** dengan **FastAPI** untuk API Gateway dan layanan simulasi.
- **PostgreSQL 16 + PostGIS** untuk data relasional dan spasial.
- Layanan dipisah minimal menjadi: API Gateway, Simulation & Graph, LLM Adapter, Audit.
- Kontrak API ditulis dalam OpenAPI dan skema Zod di frontend dibuat dari kontrak yang sama.

## Alternatif

| Opsi | Kelebihan | Kekurangan | Status |
|---|---|---|---|
| Laravel (PHP) | Familiar bagi sebagian anggota | Ekosistem GIS dan graf lebih lemah | Ditolak untuk simulasi, bisa untuk admin |
| Django | Lengkap, ORM kuat | Lebih berat dari kebutuhan | Dicadangkan |
| Node.js (Fastify/NestJS) | Satu bahasa dengan frontend | Ekosistem GeoPandas dan GEE tidak ada | Ditolak |

## Konsekuensi

- Perlu keputusan final dari tim sebelum implementasi backend.
- Prototipe tidak membutuhkan backend, sehingga keputusan ini tidak menghambat Fase UI.
- Jika proposal mensyaratkan Laravel, keputusan dibuka ulang dan dibahas di `risks.md`.
