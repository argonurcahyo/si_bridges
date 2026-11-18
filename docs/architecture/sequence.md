# Sequence Diagram

Alur utama EWS dan Simulator. Setiap diagram merujuk ke use case di `docs/analysis/use-cases.md`.

## S-1 — Geser Slider Hujan (UC-02)

```mermaid
sequenceDiagram
    actor OP as Operator
    participant SL as RainfallSlider
    participant SS as simulationStore
    participant HK as useSimulation
    participant SIM as simulationService
    participant MAP as MapView
    participant CH as DischargeChart
    participant RC as RecommendationCard

    OP->>SL: geser ke 80 mm/jam
    SL->>SS: setIntensitas(80)
    SS-->>SL: nilai baru (langsung tampil)
    Note over HK: debounce 300 ms
    HK->>SIM: run({ intensitasMmJam: 80, konversi: 20 })
    SIM-->>HK: hasil (debit, proyeksi, confidence)
    HK-->>MAP: update layer node & segmen
    HK-->>CH: update seri debit
    HK-->>RC: trigger narasi (S-2)
    Note over OP,RC: target ≤ 300 ms untuk peta & grafik (NFR-01)
```

## S-2 — Narasi AI dengan Fallback (UC-07, UC-14)

```mermaid
sequenceDiagram
    participant HK as useSimulation
    participant NS as LLM pipeline
    participant LLM as LLM Adapter (mock)
    participant RB as Template fallback
    participant VA as validator
    participant RC as RecommendationCard

    HK->>NS: generate(rekomendasi_operator, hasil)
    NS->>LLM: konteks ringkasan (timeout 5 s)
    alt LLM merespons
        LLM-->>NS: teks narasi
        NS->>VA: cek angka terhadap hasil
        alt angka cocok
            VA-->>NS: lolos
            NS-->>RC: teks, sumber = llm, confidence
        else angka tidak cocok
            VA-->>NS: gagal
            NS->>RB: buat dari template
            RB-->>NS: teks, sumber = template
            NS-->>RC: teks, sumber = template
        end
    else timeout atau error
        LLM--xNS: gagal / timeout
        NS->>RB: buat dari template
        RB-->>NS: teks, sumber = template
        NS-->>RC: teks, sumber = template + pesan singkat
    end
    Note over RC: confidence < 85% → label konfirmasi lapangan
```

## S-3 — Keputusan Operator (UC-08)

```mermaid
sequenceDiagram
    actor OP as Operator
    participant OD as OperatorDecision
    participant OS as operatorStore
    participant AL as AuditLogPanel
    participant AU as Audit (mock / API)

    OP->>OD: pilih "Perlu Verifikasi"
    OD->>OS: setKeputusan(rekomendasiId, perluVerifikasi)
    OS->>OS: status = Perlu Verifikasi
    OS->>AU: append(keputusan, waktu WIB, rekomendasiId)
    AU-->>OS: ok
    OS-->>AL: entri baru
    OS-->>OD: status tersimpan
    OD-->>OP: toast "Keputusan tercatat"
    Note over OD,OP: tidak ada perintah ke node, pintu air, atau pompa (FR-R1)
```

## S-4 — Menyusun, Menyunting, dan Menyiarkan Peringatan (UC-09)

```mermaid
sequenceDiagram
    actor OP as Operator
    participant AR as AlertReviewSheet
    participant AS as alertService
    participant NS as LLM pipeline
    participant LLM as LLM Adapter (mock)
    participant PS as publicationService
    participant AU as Audit
    participant WG as WargaPage

    OP->>AR: buka O-06
    AR->>AS: build(hasil, network, catchments)
    AS-->>AR: kandidat peringatan per wilayah (waspada/siaga)
    AR->>NS: generate(peringatan_publik, konteks)
    NS->>LLM: minta pesan bahasa awam (timeout 5 s)
    alt LLM dan validasi lolos
        LLM-->>NS: teks
        NS-->>AR: teks, sumber = llm, provenance
    else gagal / menyimpang
        NS-->>AR: teks template, sumber = template
    end
    OP->>AR: sunting teks (opsional)
    OP->>AR: tekan "Siarkan"
    AR->>PS: publish(peringatanId, teksFinal, operator)
    PS->>AU: append(peringatan_disiarkan, waktu WIB)
    PS-->>WG: BroadcastChannel event
    WG-->>OP: halaman warga menampilkan peringatan wilayah
    Note over PS,WG: hanya status disiarkan yang dibaca warga (FR-34)
```

## S-5 — Menarik atau Kedaluwarsa Peringatan (UC-16)

```mermaid
sequenceDiagram
    actor OP as Operator
    participant AR as AlertReviewSheet
    participant PS as publicationService
    participant AU as Audit
    participant WG as WargaPage

    alt Operator menarik
        OP->>AR: tekan "Tarik"
        AR->>PS: retract(peringatanId, operator)
        PS->>AU: append(peringatan_ditarik)
    else TTL 6 jam / digantikan siaran baru
        PS->>PS: tandai kedaluwarsa
        PS->>AU: append(peringatan_kedaluwarsa)
    end
    PS-->>WG: BroadcastChannel event
    WG-->>OP: kartu peringatan hilang / empty state
    Note over PS,WG: riwayat tetap tersimpan di audit (FR-37)
```

## S-6 — Simulator: Parameter, Interpretasi, Brief (UC-20–UC-23)

```mermaid
sequenceDiagram
    actor PR as Perencana
    participant SP as ScenarioPanel
    participant REG as plannerRegistry
    participant ENG as planner engine
    participant NS as LLM pipeline
    participant IP as InterpretationPanel
    participant EB as ExecutiveBrief
    participant LLM as LLM Adapter (mock)

    PR->>SP: buka /rencana
    SP->>REG: daftar parameter
    REG-->>SP: label, satuan, batas, default
    PR->>SP: ubah parameter
    Note over SP,ENG: debounce setelah input berhenti
    SP->>ENG: run(parameter)
    ENG-->>SP: peta, dampak, ringkasan
    SP->>NS: generate(interpretasi_skenario, hasil + baseline)
    NS->>LLM: konteks terhitung
    alt LLM dan validasi lolos
        LLM-->>NS: interpretasi
        NS-->>IP: teks AI + provenance
    else gagal
        NS-->>IP: template
    end
    PR->>EB: tekan "Generate brief"
    EB->>NS: generate(executive_brief, konteks)
    NS->>LLM: konteks terhitung
    LLM-->>NS: brief
    NS-->>EB: brief + provenance
    EB-->>PR: brief draf, salin / unduh Markdown
    Note over PR,EB: brief adalah draf, bukan keputusan kebijakan (FR-R11)
```
