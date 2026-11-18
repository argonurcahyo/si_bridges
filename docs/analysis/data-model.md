# Model Data (ERD)

Model logis untuk dua use case: **Early Warning System (EWS)** dan **Simulator**. Entitas data geospasial dan observasi memiliki `sumber` dan `status` (`open_data`, `sintetis`, `mock`) sesuai FR-28; entitas keputusan dan peringatan memiliki status alur sendiri.

```mermaid
erDiagram
    NODE ||--o{ EDGE : "dari"
    NODE ||--o{ EDGE : "ke"
    NODE ||--o{ OBSERVASI : "dipantau"
    SEGMENT ||--o{ FORECAST : "diproyeksi"
    SCENARIO ||--o{ HASIL_SIMULASI : "menghasilkan"
    HASIL_SIMULASI ||--o{ FORECAST : "memuat"
    HASIL_SIMULASI ||--o{ REKOMENDASI : "menghasilkan"
    REKOMENDASI ||--o{ KEPUTUSAN : "menerima"
    REKOMENDASI ||--o{ PERINGATAN : "menurunkan"
    SEGMENT ||--o{ PERINGATAN : "untuk"
    PERINGATAN ||--o| PUBLIKASI_WILAYAH : "menjadi aktif"
    PERINGATAN ||--o{ LOG_AUDIT : "dicatat di"
    REKOMENDASI ||--o{ LOG_AUDIT : "dicatat di"
    SKENARIO_KEBIJAKAN ||--o{ INTERPRETASI : "menghasilkan"
    SKENARIO_KEBIJAKAN ||--o{ EXECUTIVE_BRIEF : "menghasilkan"
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
    PERINGATAN {
        string id PK
        string rekomendasi_id FK
        string segment_id FK
        string wilayah_kode
        string wilayah_nama
        string node_id FK
        string level "aman | waspada | siaga"
        float kedalaman_m "nullable sampai model menyediakan"
        int estimasi_tiba_menit
        float puncak_jam
        float keyakinan
        string teks_ai
        string teks_final
        string sumber "llm | template"
        string model_label
        string status "draf | disiarkan | ditarik | ditolak | kedaluwarsa"
        datetime dibuat_pada
        datetime narasi_dibuat_pada
        string alasan_fallback "timeout | error | validasi"
        datetime disunting_pada
        datetime disiarkan_pada
        string disiarkan_oleh
        datetime ditarik_pada
        datetime kedaluwarsa_pada
        string versi_simulasi
    }
    PUBLIKASI_WILAYAH {
        string wilayah_kode PK
        string peringatan_id FK
        datetime disiarkan_pada
        string disiarkan_oleh
    }
    LOG_AUDIT {
        string id PK
        string jenis "keputusan | llm_call | fallback | peringatan_disusun | peringatan_disunting | peringatan_disiarkan | peringatan_ditolak | peringatan_ditarik | peringatan_kedaluwarsa"
        string referensi_id
        datetime waktu_wib
        string detail
    }
    SKENARIO_KEBIJAKAN {
        string id PK
        string nama
        string parameter_json
        datetime dibuat_pada
        string dibuat_oleh
    }
    INTERPRETASI {
        string id PK
        string skenario_id FK
        string teks
        string sumber "llm | template"
        string model_label
        datetime dibuat_pada
    }
    EXECUTIVE_BRIEF {
        string id PK
        string skenario_id FK
        string teks
        string sumber "llm | template"
        string model_label
        datetime dibuat_pada
        string status "draf | ditinjau"
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

- `SCENARIO` adalah skenario simulasi operator EWS. `SKENARIO_KEBIJAKAN` adalah skenario simulator perencana.
- `parameter_json` pada `SKENARIO_KEBIJAKAN` mengikuti registry parameter (FR-39); kunci dan batasnya divalidasi sebelum disimpan.
- `REKOMENDASI.status_operator` disalin dari `KEPUTUSAN` terakhir untuk tampilan cepat. Sumber kebenaran tetap di `KEPUTUSAN`.
- `PERINGATAN.status` adalah sumber kebenaran publikasi. `PUBLIKASI_WILAYAH` menyimpan pointer peringatan aktif per wilayah; satu wilayah hanya boleh punya satu baris.
- `PERINGATAN.teks_ai` tidak boleh ditimpa saat operator menyunting; teks final disimpan di `teks_final` (FR-R9).
- Peringatan berstatus `disiarkan` adalah satu-satunya yang boleh dibaca halaman warga (FR-34, FR-R10).
- `LOG_AUDIT` bersifat append-only. Entri tidak boleh diubah atau dihapus (NFR-11).
- Pada prototipe, semua entitas berasal dari JSON/GeoJSON mock dan divalidasi dengan Zod. Tidak ada tabel database.
- Tipe `geometry` mengacu pada GeoJSON; implementasi backend akan memakai PostGIS.
