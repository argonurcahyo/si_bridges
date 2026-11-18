# Risiko & Asumsi

Skala: Dampak dan Probabilitas masing-masing Rendah (R), Sedang (S), Tinggi (T).

## 1. Risiko

| ID | Risiko | Kategori | Dampak | Prob. | Mitigasi | Pemilik |
|---|---|---|---|---|---|---|
| R-01 | LLM menghasilkan rekomendasi, pesan peringatan, atau interpretasi yang salah/tidak sesuai SOP | Responsible AI | T | S | Human-in-the-loop, validasi angka/tone (FR-R5, FR-R6), confidence (FR-23), tinjauan domain expert | Tim AI, Argo |
| R-02 | Operator terlalu percaya pada narasi AI | Responsible AI | T | S | Label sumber, confidence visibel, tombol "Perlu Verifikasi" | Yovi (UI/UX) |
| R-03 | Peringatan publik terlalu sensitif dan menimbulkan kepanikan | Responsible AI | T | S | Tinjauan operator, validator tone, template bahasa tenang (FR-R6) | Yovi, Tim AI |
| R-04 | Layanan LLM tidak tersedia saat darurat | Teknis | T | S | Fallback rule-based dalam 5 detik (FR-21) | Tim SWE |
| R-05 | Koordinat pintu air atau TMA tidak akurat | Data | T | S | Verifikasi dengan sumber resmi DSDA dan BIG | Tim AI |
| R-06 | Geometri kelurahan dari SHP terlalu berat untuk peta | Teknis | S | S | Simplifikasi geometri, uji performa, pertimbangkan tile | Tim SWE |
| R-07 | Konversi SHP ke WGS84 salah proyeksi (UTM 48S ke 4326) | Data | S | S | Cek CRS sebelum konversi, uji dengan titik referensi | Tim AI |
| R-08 | Slider lambat sehingga operator frustrasi | Teknis | S | S | Debounce, cache hasil, uji NFR-01 | Tim SWE |
| R-09 | Scope membesar ke kanal distribusi nyata dan pemodelan produksi | Proyek | T | T | Batas scope tertulis (`requirements.md` §1), fase F0–F5, review mingguan | Argo |
| R-10 | Mockup dan prototipe tidak sinkron dengan requirement | Proyek | S | S | Traceability matrix, review per gate | Argo, Yovi |
| R-11 | Data mock disalahartikan sebagai data nyata | Responsible AI | T | S | Banner "Mode Latihan", badge sumber, FR-28 | Yovi |
| R-12 | Ketergantungan pada API key LLM di client | Keamanan | T | S | Tidak ada key di browser (FR-R7), proxy untuk produksi | Tim SWE |
| R-13 | Tidak ada pembagian peran UI/UX yang jelas | Tim | S | R | Yovi ditetapkan sebagai UI/UX di Tim SWE | Argo |
| R-14 | Dokumentasi Mermaid tidak tampil di tool tertentu | Dokumentasi | R | S | Ekspor SVG/PNG untuk laporan | Argo |
| R-15 | Model Gemini yang dipakai sudah tidak aktif saat implementasi | Teknis | S | S | Adapter LLM tetap, model dapat diganti di konfigurasi | Tim AI |
| R-16 | Peringatan wilayah A muncul di wilayah B karena gating salah | Responsible AI | T | S | Kunci publikasi per wilayah + unit/e2e test (NFR-13) | Tim SWE |
| R-17 | Satu keputusan operator membuka semua peringatan | Responsible AI | T | S | Persetujuan per peringatan, bukan flag global | Tim SWE |
| R-18 | Operator melewatkan tinjauan saat darurat | Operasional | T | S | Pesan ringkas, aksi utama jelas, fallback cepat, latihan | Yovi |
| R-19 | Peringatan kedaluwarsa masih tampil di warga | Data | T | S | TTL 6 jam, penggantian per wilayah, test expiry | Tim SWE |
| R-20 | Interpretasi simulator terlalu percaya diri | Responsible AI | T | S | Label draf, batasan model, validasi angka, fallback | Tim AI |
| R-21 | Parameter tambahan mengubah arti skenario lama | Proyek | S | S | Registry + versi parameter + catatan perubahan | Argo |

## 2. Asumsi

| ID | Asumsi | Jika salah |
|---|---|---|
| A-01 | Data SHP dan DEMNAS sudah tersedia dan lengkap | Mockup memakai data dummy, jadwal bergeser |
| A-02 | Hasil simulasi dari mock mengikuti kontrak yang sama dengan model nyata | Perlu penyesuaian kontrak API |
| A-03 | Mode 3D dapat dibuat dengan terrain DEMNAS atau extrusion | Hanya 2D pada demo |
| A-04 | Tidak ada autentikasi pada prototipe | Perlu penambahan login |
| A-05 | Tim SWE memegang UI/UX dan mockup | Perlu pembagian ulang |
| A-06 | Bahasa UI English (default) dan Bahasa Indonesia; dokumen internal Bahasa Indonesia | Perlu pemeliharaan dua kamus dan terjemahan dokumen bila diperlukan |
| A-07 | Publikasi peringatan prototipe memakai localStorage + BroadcastChannel | Produksi perlu backend dan kanal distribusi |
| A-08 | Tidak ada SMS/WhatsApp/push notification pada prototipe | Perlu integrasi kanal resmi BPBD |
| A-09 | Daftar parameter simulator tambahan belum ditentukan | Registry tetap generik; penambahan parameter menunggu daftar |

## 3. Isu Terbuka

| ID | Isu | Pemilik | Target |
|---|---|---|---|
| I-01 | Sistem koordinat SHP yang diterima (4326 atau 32748) | Tim AI | Sebelum F1 |
| I-02 | Ketersediaan tile terrain DEMNAS untuk 3D | Tim AI | Sebelum F2 |
| I-03 | Batas kelurahan mana yang masuk koridor | Tim AI | Sebelum F2 |
| I-04 | Versi model Gemini yang dipakai | Tim AI | Sebelum integrasi |
| I-05 | Teks issue GitHub (acuan requirement) | Argo | Kapan saja |
| I-06 | Daftar parameter simulator tambahan | Perencana, Tim AI, Argo | Sebelum F3 |
| I-07 | Rename rute `/ops` dan `/rencana` | Argo, Yovi | Sebelum F1 |
| I-08 | Kanal distribusi peringatan produksi | Argo, BPBD | Setelah prototipe |
