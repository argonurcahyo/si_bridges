# Model Data (ERD)

Model logis untuk dashboard. Semua entitas memiliki `sumber` dan `status` (`open_data`, `sintetis`, `mock`) sesuai FR-28.

```mermaid
erDiagram
    NODE ||--o{ EDGE : "dari"
    NODE ||--o{ EDGE : "ke"
    NODE ||--o{ OBSERVASI : "dipantau"
    SEGMENT ||--o{ FORECAST : "diproyeksi"
    SCENARIO ||--o{ HASIL_SIMULASI : "menghasilkan"
    HASIL_SIMULASI ||--o{ FORECAST : "memuat"
    HASIL_SIMULASI ||--|| REKOMENDASI : "menghasilkan"
    REKOMENDASI ||--o{ KEPUTUSAN : "menerima"
    REKOMENDASI ||--o{ DRAF_PERINGATAN : "menurunkan"
    SEGMENT ||--o{ DRAF_PERINGATAN : "untuk"
    KEPUTUSAN ||--|| LOG_AUDIT : "dicatat di"
    REKOMENDASI ||--o{ LOG_AUDIT : "dicatat di"
    SUMBER_DATA ||--o{ NODE : "menyediakan"
    SUMBER_DATA ||--o{ SEGMENT : "menyediakan"
    KEJADIAN_HISTORIS ||--o{ OBSERVASI : "berisi"

    NODE {
        string id PK
        string nama
        string tipe "pintu_air | penampungan | sensor"
        float lat
        float lng
        float ambang_siaga_m
        float ambang_waspada_m
        string sumber_id FK
        string status
    }
    EDGE {
        string id PK
        string dari_node FK
        string ke_node FK
        float panjang_km
        int lag_menit
        string sumber_id FK
        string status
    }
    SEGMENT {
        string id PK
        string kelurahan
        string kota
        geometry geometri
        float luas_ha
        float c_value_dasar
        string sumber_id FK
        string status
    }
    OBSERVASI {
        string id PK
        string node_id FK
        datetime waktu_wib
        float tma_m
        float debit_m3s
    }
    SCENARIO {
        string id PK
        string nama
        float intensitas_mm_jam
        int konversi_lahan_persen
        int durasi_jam
        bool is_baseline
    }
    HASIL_SIMULASI {
        string id PK
        string scenario_id FK
        datetime dihitung_pada
        float confidence
        string status
    }
    FORECAST {
        string id PK
        string hasil_id FK
        string segment_id FK
        int horizon_jam
        float volume_m3
        float confidence
    }
    REKOMENDASI {
        string id PK
        string hasil_id FK
        string teks
        string sumber "llm | rule_based"
        string model_label
        float confidence
        datetime dibuat_pada
        string status_operator
    }
    KEPUTUSAN {
        string id PK
        string rekomendasi_id FK
        string pilihan "diterima | ditolak | perlu_verifikasi"
        datetime waktu_wib
        string operator
    }
    DRAF_PERINGATAN {
        string id PK
        string rekomendasi_id FK
        string segment_id FK
        string level "aman | waspada | siaga"
        string teks_publik
        int estimasi_tiba_menit
        datetime dibuat_pada
    }
    LOG_AUDIT {
        string id PK
        string jenis "keputusan | llm_call | fallback"
        string referensi_id
        datetime waktu_wib
        string detail
    }
    KEJADIAN_HISTORIS {
        string id PK
        string nama
        date tanggal
        string deskripsi
        string status
    }
    SUMBER_DATA {
        string id PK
        string nama
        string jenis "TMA | hujan | citra | DEM | batas_admin"
        datetime terakhir_diperbarui
        string status
    }
```

## Catatan

- `SCENARIO.is_baseline` menandai skenario acuan untuk FR-10.
- `REKOMENDASI.status_operator` disalin dari `KEPUTUSAN` terakhir untuk tampilan cepat. Sumber kebenaran tetap di `KEPUTUSAN`.
- `LOG_AUDIT` bersifat append-only. Entri tidak boleh diubah atau dihapus (NFR-11).
- Pada prototipe, semua entitas berasal dari JSON/GeoJSON mock dan divalidasi dengan Zod. Tidak ada tabel database.
- Tipe `geometry` mengacu pada GeoJSON; implementasi backend akan memakai PostGIS.
