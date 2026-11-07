# Sequence Diagram

Empat alur utama dashboard. Setiap diagram merujuk ke use case di `docs/analysis/use-cases.md`.

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
    participant NS as narrativeService
    participant LLM as LLM Adapter (mock)
    participant RB as Rule-based
    participant VA as validateNarrative
    participant RC as RecommendationCard

    HK->>NS: generate(hasil)
    NS->>LLM: prompt ringkasan (timeout 5 s)
    alt LLM merespons
        LLM-->>NS: teks narasi
        NS->>VA: cek angka terhadap hasil
        alt angka cocok
            VA-->>NS: lolos
            NS-->>RC: teks, sumber = llm, confidence
        else angka tidak cocok
            VA-->>NS: gagal
            NS->>RB: buat dari template
            RB-->>NS: teks, sumber = rule_based
            NS-->>RC: teks, sumber = rule_based
        end
    else timeout atau error
        LLM--xNS: gagal / timeout
        NS->>RB: buat dari template
        RB-->>NS: teks, sumber = rule_based
        NS-->>RC: teks, sumber = rule_based + pesan singkat
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

## S-4 — Meninjau Draf Peringatan Publik (UC-09)

```mermaid
sequenceDiagram
    actor OP as Operator
    participant AP as AlertDraftPanel
    participant DS as draftService
    participant DATA as dataService
    participant CLIP as Clipboard

    OP->>AP: buka O-06
    AP->>DS: build(rekomendasi, segmen)
    DS->>DATA: ambil level & estimasi tiba
    DATA-->>DS: data segmen
    DS-->>AP: draf per kelurahan (level, teks, sumber, waktu)
    AP-->>OP: tampilkan draf
    OP->>AP: tekan "Salin"
    AP->>CLIP: writeText(teks)
    CLIP-->>AP: berhasil
    AP-->>OP: toast "Teks tersalin"
    Note over AP,OP: tidak ada pengiriman ke warga (FR-26)
```
