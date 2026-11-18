# Rencana Pengembangan — Diorama Edukasi

Status: **disetujui 16 November 2026. Eksekusi dimulai dari fase E7 (aset presentasi), belum ada kode.**
Acuan: [`requirements.md`](../analysis/requirements.md) FR-02, FR-15, FR-20, FR-24, FR-31, FR-32; NFR-02, NFR-03, NFR-04.
Lingkup: satu surface tiga dimensi terpisah untuk menjelaskan mekanisme. Peta MapLibre, simulasi, dan rekomendasi tidak diubah perilakunya.

---

## 1. Ringkasan

Diorama adalah miniatur Three.js bergaya ilustrasi teknis: satu mekanisme akurat di atas slab, satu urutan sebab-akibat, kamera tiga-perempat, plus kartu penjelas berisi play/pause, langkah, dan pemilih bagian.

Yang dibangun di sini **bukan** peta 3D baru dan **bukan** pengganti mode 3D MapLibre. Yang dibangun adalah surface penjelas: "apa yang sebenarnya terjadi di Pintu Air Manggarai dan mengapa operator memutuskan membukanya 15%".

Nilai yang didapat:

1. Menjawab pertanyaan yang tidak bisa dijawab choropleth 237 kelurahan: mekanisme dan sebab-akibat.
2. Memberi wajah konkret pada rekomendasi FR-20 ("Buka Pintu Air Manggarai 15% dalam 45 menit") tanpa menyentuh logika simulasi.
3. Menyediakan aset presentasi deterministik untuk proposal dan demo, karena scene adalah fungsi murni dari waktu.

---

## 2. Keputusan Final

| # | Topik | Keputusan |
|---|---|---|
| D-01 | Posisi produk | Surface terpisah di rute `/edu`, bukan panel di dalam `/ops` |
| D-02 | Pengganti peta 3D | Tidak. FR-02 tetap milik MapLibre + terrain DEMNAS |
| D-03 | Preset render | `stroked-toon` (ilustrasi solid + garis tinta), bukan `pixel` |
| D-04 | Palet | Palet edukasi kanonik: halaman `#f7f7f5`, kartu `#fff`, tinta `#18181b`, aksen `#2563eb` |
| D-05 | Sumber angka | Hanya baca dari `network.json`, `engine/`, `store/`. Scene tidak menghitung hidraulik |
| D-06 | Subjek fase pertama | Satu mekanisme: Pintu Air Manggarai |
| D-07 | Perangkat | Desktop dan tablet. Tidak dimuat di `/warga` |
| D-08 | Pemuatan | `React.lazy` per rute; three.js tidak boleh masuk chunk awal |
| D-09 | Sumber kode | Template copy-in dari `sloemo01/diorama`, dipin ke satu commit, dicatat di `UPSTREAM.md` |
| D-10 | Bahasa | Mengikuti bahasa aktif aplikasi (English default / Bahasa Indonesia), angka mengikuti locale, waktu WIB |
| D-11 | Label | Badge permanen "Ilustrasi mekanisme, bukan keluaran hidraulik" (FR-32) |
| D-12 | Aksi fisik | Scene tidak pernah memerintah pintu atau pompa (FR-R1); animasi hanya visual |
| D-13 | Urutan kerja | **E7 lebih dulu** (aset deck ± 1 hari), lalu E0 → E6 |
| D-14 | Cakupan mekanisme | Pintu air saja. Pompa masuk fase lanjutan E8, tidak dikerjakan sekarang |
| D-15 | Runner QA | `playwright-core` sebagai dev dependency, plus Chrome lokal yang sudah tersedia |
| D-16 | Pengganti aset | Satu scene module dipakai ulang oleh E7 dan `/edu`, tidak ada scene terpisah untuk deck |

---

## 3. Batas Lingkup

### Termasuk
- Rute `/edu` beserta layout kanonik (kanvas + kartu kanan 360 px, dock bawah di ≤ 880 px).
- Satu scene: pintu air, palung, tanggul, tiang sensor TMA, rumah pompa, dua rumah toy-scale.
- Empat langkah sebab-akibat, play/pause/prev/next/reset, pemilih bagian, klik-untuk-inspeksi.
- Pemetaan data dari store ke parameter visual, dengan hukum gerak yang dideklarasikan.
- QA deterministik (`freeze(t)`), uji kinematik dan clearance, screenshot, e2e, axe.
- Aset presentasi: potongan 15 detik untuk deck dan `demo-script.md`.

### Tidak termasuk
- Mengganti, memperbaiki, atau menambah fitur pada `MapView.tsx`.
- Choropleth, heatmap, atau 237 kelurahan di dalam scene.
- Simulasi genangan di atas terrain (itu jalur MapLibre/deck.gl, lihat §12).
- Angka per RW atau per kelurahan di surface ini.
- Pemutaran data historis FR-15 (dibahas sebagai lanjutan, §9).
- Versi bahasa Inggris, mode offline, dan dukungan mobile-first.

---

## 4. Alasan Teknis

| Kebutuhan peta sekarang | Diorama |
|---|---|
| Georeferensi, CRS, tile `raster-dem` DEMNAS, zoom 8–19 | Tidak ada; satu slab, kamera di-fit ke bounding box |
| Choropleth 237 kelurahan, lima layer, atribusi OSM/BIG | Tidak ada streaming data dan tidak ada poligon |
| Pan/zoom/pitch/bearing bebas | Orbit saja dengan hero angle tetap untuk QA |
| Palet harus sama dengan `design-tokens.md`, kontras AA | Palet 64 warna + dither + garis tinta merusak ramp risiko |
| Bundle awal ≤ 500 kB (P6.3) | three.js menambah ± 150–180 kB gzip; wajib lazy |

Kesimpulan: dua alat ini menyelesaikan masalah berbeda. Diorama dipakai untuk **satu mekanisme**, peta dipakai untuk **ruang**.

---

## 5. Use Case & Prioritas

| # | Use case | Permukaan | Nilai | Prioritas |
|---|---|---|---|---|
| U-1 | Loop 15 detik untuk deck dan demo | Aset statis (MP4) | Tinggi, risiko nol | **P1** |
| U-2 | Mekanisme Pintu Air Manggarai | `/edu` | Tinggi, menjelaskan FR-20 | **P2** |
| U-3 | Pita koridor 6 node hulu–hilir | `/edu` lanjutan | Sedang, risiko sedang | P3 |
| U-4 | Tontonan edukasi warga | — | Rendah, risiko etika | Tidak dikerjakan |

U-4 sengaja ditolak: menampilkan kedalaman air mock kepada warga bertabrakan dengan [`responsible-ai-review.md`](../analysis/responsible-ai-review.md).

---

## 6. Konten Fase Pertama (U-2)

### 6.1 Subjek

Pintu Air Manggarai, node `manggarai` di `src/data/network.json`: TMA 4,25 m, ambang waspada 3,5 m, ambang siaga 4,0 m, tipe `pintu_air`.

Riset wajib sebelum memodelkan (gerbang riset skill): rekaman pintu air Manggarai untuk siluet dan urutan gerak, referensi bentuk daun pintu, roda tangan, aktuator, dan papan duga. Hasilnya masuk `docs/ui-prototype/diorama/SOURCES.md` dan `CREDITS.md`.

### 6.2 Manifest komponen (awal)

| ID | Bagian | Induk | Fungsi | Gerak | Satuan |
|---|---|---|---|---|---|
| P-01 | Palung beton | slab | saluran | statis | m |
| P-02 | Pilar pintu | palung | dudukan | statis | m |
| P-03 | Daun pintu | pilar | membendung | translasi vertikal | m |
| P-04 | Roda tangan | pilar | pengangkat manual | rotasi | rad |
| P-05 | Aktuator hidraulik | pilar | pengangkat mekanis | teleskop | m |
| P-06 | Tiang sensor + papan duga | tanggul | membaca TMA | statis + pelampung | m |
| P-07 | Rumah pompa | tanggul | pompa | statis | m |
| P-08 | Tanggul | slab | penahan | statis | m |
| P-09 | Rumah toy-scale ×2 | tanggul | konteks hunian | statis | m |

Penyederhanaan yang dinyatakan terbuka: tidak ada baut, seal, kabel, pagar, atau rangka baja lengkap; tidak ada figur bergerak; pompa tidak menampilkan aliran internal. Semua bagian yang disembunyikan dicatat sebagai simplifikasi simbolik, bukan diganti label.

### 6.3 Hukum gerak dan toleransi

- Bukaan pintu: `y = bukaanPersen / 100 × H_daun`, `H_daun = 2,4 m`, batas `0 ≤ y ≤ 2,4`.
- Roda tangan: `Δθ = y / pitch`, `pitch = 0,1 m` per putaran; arah buka = searah jarum jam.
- Aktuator: `L = L0 + y`, `L0 = 1,2 m`; silinder dan batang tidak boleh menembus pilar.
- Muka air: `muka = f(TMA)` linear terhadap `[dasarPalung, ambangSiaga + 0,6 m]`, di-clamp.
- Clearance minimum semua pasangan yang tidak bersentuhan: 0,02 m; diuji pada 12 sampel fase, dua sudut kamera.

Semua konstanta tinggal di `config.ts` scene, bukan di dalam mesh.

### 6.4 Urutan sebab-akibat

| Langkah | Judul | Yang terlihat |
|---|---|---|
| 1 | Hujan di hulu | garis hujan turun, debit masuk naik |
| 2 | Muka air naik | permukaan air naik, papan duga bergerak |
| 3 | Ambang terlampaui | penanda waspada lalu siaga menyala, badan pintu menegang |
| 4 | Pintu dibuka | daun pintu naik sesuai bukaan, air turun, debit keluar |

Angka yang ditampilkan di kartu berasal dari store saat itu, bukan dari scene. Jika store belum punya nilai, kartu menampilkan contoh tetap dan badge "contoh".

### 6.5 Pemetaan data

```ts
type DioramaInput = {
  nodeId: "manggarai";
  tmaMeter: number;
  ambangWaspadaMeter: number;
  ambangSiagaMeter: number;
  debitM3s: number;
  bukaanPintuPersen: number; // 0–100, dari rekomendasi atau kontrol demo
};
```

Aturan: scene hanya menerima `DioramaInput`, tidak pernah memanggil `engine/`. Semua label level memakai `riskLevel` yang sudah ada agar warna dan istilah konsisten.

---

## 7. UI & Integrasi

### 7.1 Struktur permukaan

```
/edu
├─ kanvas (kiri, min 1fr, tabindex 0, aria-label)
└─ kartu 360 px (kanan)
   ├─ judul + badge "Ilustrasi mekanisme"
   ├─ tab: Jelajah | Cara kerja
   ├─ kontrol: Putar · ‹ · › · Reset  (+ Inside opsional)
   ├─ langkah 1–4 + teks penjelas
   └─ dropdown "Periksa bagian"
```

≤ 880 px: satu kolom, kartu jadi dock bawah dengan tinggi maksimum 48dvh.

### 7.2 Batas modul React ↔ scene

```ts
export type DioramaHandle = {
  freeze(t: number): void;
  setInput(input: DioramaInput): void;
  selectPart(id: string | null): void;
  reset(): void;
  dispose(): void;
};

export function createScene(canvas: HTMLCanvasElement, opts: SceneOpts): DioramaHandle;
```

React hanya memegang ref kanvas, menyalurkan input, dan menampilkan teks. Tidak ada state React di dalam scene, tidak ada store di dalam scene. Ini menjaga NFR-08 dan membuat QA `freeze(t)` mungkin.

### 7.3 Pemuatan dan performa

- `const EduPage = lazy(() => import("@/pages/EduPage"))` di `router.tsx`.
- `manualChunks: { three: ["three"] }` di `vite.config.ts`.
- DPR dibatasi 2 (desktop) dan 1,5 (mobile); RAF dihentikan saat tab tidak terlihat atau kanvas keluar viewport.
- Tidak ada peta MapLibre di `/edu`, agar hanya satu konteks WebGL aktif.
- Anggaran: chunk awal tidak boleh naik lebih dari 5 kB gzip; chunk `three` dimuat hanya saat `/edu` dibuka.

### 7.4 Titik masuk dari aplikasi

- Tautan "Lihat mekanisme" di `RecommendationPanel` saat narasi menyebut pintu air.
- Tautan "Cara kerja" di `NodeDetailSheet` untuk node bertipe `pintu_air`.
- Tombol "Kembali" di `/edu` menuju rute asal.

---

## 8. Struktur File yang Diusulkan

```
apps/dashboard/
├─ src/
│  ├─ pages/
│  │  └─ EduPage.tsx                    rute, lazy, kartu, kanvas
│  ├─ features/edu/
│  │  ├─ DioramaStage.tsx               mount/dispose kanvas, teruskan input
│  │  ├─ diorama/
│  │  │  ├─ index.ts                    createScene, tipe DioramaHandle
│  │  │  ├─ config.ts                   konstanta scene
│  │  │  ├─ manifest.ts                 manifest komponen P-01..P-09
│  │  │  ├─ geometry.ts                 builder mesh (dari template)
│  │  │  ├─ camera.ts · orbit.js        kamera tiga-perempat + orbit
│  │  │  ├─ palette.ts · toon.js        palet + stroked-toon
│  │  │  ├─ inspection.ts               seleksi, highlight, restore
│  │  │  ├─ timeline.ts                 langkah 1–4 sebagai fungsi t
│  │  │  └─ scene.ts                    perakitan
│  │  └─ edu.css                        token edukasi kanonik
│  ├─ i18n/id.ts                        tambah kunci teks.edu.*
│  └─ app/router.tsx                    + rute /edu
├─ public/diorama/                      aset statis scene (jika ada)
└─ qa/diorama/                          report.json, tangkapan, contact sheet
tools/
└─ diorama/UPSTREAM.md                  commit, lisensi MIT, daftar file yang dipakai
docs/ui-prototype/diorama/
├─ DESIGN.md · SOURCES.md · CREDITS.md
└─ screenshots/
```

---

## 9. Fase Pengerjaan

Urutan eksekusi: **E7 → E0 → E1 → E2 → E3 → E4 → E5 → E6 → (E8, ditunda)**.

E7 dikerjakan lebih dulu karena tidak bergantung pada rute, React, atau store: hasilnya aset untuk proposal dan demo. Modul scene yang lahir di E7 dipakai ulang di E2, jadi bukan pekerjaan yang dibuang.

| Urut | Fase | Isi | Kriteria selesai | Estimasi |
|---|---|---|---|---|
| 1 | **E7 Aset deck** | Scene minimal pintu air + render 15 detik dari frame tetap | Frame 0/7,5/15 detik cocok contact sheet; sebab-akibat terbaca tanpa teks | 1 hari |
| 2 | **E0 Proof of look** | Satu blockout lengkap, palet, garis tinta, kartu kanonik, tiga screenshot | Tiga sudut + satu keadaan terpilih; keputusan go/no-go estetika | 1 hari |
| 3 | **E1 Vendor & batas** | Pin commit upstream, `UPSTREAM.md`, `createScene`, rute `/edu` lazy, `manualChunks` | `pnpm build`: chunk awal tidak naik; `three` hanya di chunk `/edu` | 0,5 hari |
| 4 | **E2 Geometri & manifest** | Model P-01..P-09, `manifest.ts`, uji clearance/penetrasi | 12 sampel fase × 2 sudut lulus toleransi 0,02 m | 2 hari |
| 5 | **E3 Animasi & langkah** | Empat langkah, play/pause/prev/next/reset, `freeze(t)` | Dua pemanggilan `freeze(t)` identik; reduced-motion tetap bisa step | 1,5 hari |
| 6 | **E4 Inspeksi bagian** | Klik dan keyboard, highlight reversible, kamera transisi, kembali | Semua bagian bisa dipilih; material asli pulih persis | 1 hari |
| 7 | **E5 Integrasi data & label** | Baca `network.json` + store, badge ilustrasi, dua titik masuk | Angka kartu sama dengan store; tidak ada angka di kanvas | 1 hari |
| 8 | **E6 QA & dokumen** | `shoot`/`frames`/`strip`, e2e Playwright, axe, screenshot, `demo-script.md` | `qa/report.json` terisi; e2e dan axe lulus | 1 hari |
| — | E8 Pompa *(ditunda)* | Mekanisme rumah pompa sebagai scene kedua | Belum ditentukan | — |

Total sampai E6 ± 8 hari kerja satu orang. Jalur minimum yang tetap berguna: **E7 saja**.

### 9.1 Rincian E7 (fase pertama)

Keluaran:

| Artefak | Lokasi | Keterangan |
|---|---|---|
| Video 15 detik | `docs/ui-prototype/diorama/media/pintu-air-15s.mp4` | 1920×1080, 30 fps, H.264 |
| GIF pratinjau | `docs/ui-prototype/diorama/media/pintu-air-15s.gif` | 12 fps, sisi panjang 960 px |
| Contact sheet | `docs/ui-prototype/diorama/media/pintu-air-strip.png` | 12 frame, untuk bukti urutan |
| Tiga still | `.../stills/t00.png`, `t075.png`, `t150.png` | Dipakai di deck dan README |
| Report | `qa/diorama/report.json` | Timestamp, checksum frame, catatan |

Cara kerja:

1. Scene dibangun di `src/features/edu/diorama/` sebagai modul murni, tanpa React.
2. Halaman harness `qa/diorama/render.html` memuat scene dan mengekspos `freeze(t)`.
3. Skrip menangkap frame ke `t = i/30` untuk `i = 0..449`; tidak ada capture realtime, jadi tidak ada frame hilang.
4. Frame dijadikan video; GIF dibuat dari frame yang sama, bukan dari video.
5. Tanpa kartu UI dan tanpa teks di dalam gambar, supaya bisa dipakai di slide mana pun.

Prasyarat yang sudah diperiksa 16 November 2026 di mesin ini:

| Kebutuhan | Status |
|---|---|
| Node | v24.19.0, tersedia |
| Chrome | `C:\Program Files\Google\Chrome\Application\chrome.exe`, tersedia |
| ffmpeg | **tidak ditemukan di PATH** |
| pnpm | tidak ditemukan di PATH, verifikasi lewat corepack sebelum E1 |

Karena ffmpeg tidak ada, E7 memakai urutan: GIF dulu (encoder JS, tanpa ffmpeg), MP4 menyusul bila ffmpeg dipasang. Jangan memblokir fase ini karena alat video.

---

## 10. Pengujian

### Unit (Vitest)
- Pemetaan `TMA → muka` monoton, ter-clamp, dan sama untuk input sama.
- `bukaan → y` dalam `[0, 2,4]`; `y = 2,4` tepat di bukaan 100%.
- Label level konsisten dengan ambang waspada/siaga dari `network.json`.
- Determinisme: checksum posisi semua mesh pada `t` yang sama, dua kali berturut-turut.

### QA visual (dari template skill)
- `shoot.mjs`: error konsol, layout 1280/768/390, timestamp tetap.
- `frames.mjs`: satu seri per bagian bergerak; verdict FROZEN/TELEPORT/EMPTY/OFFSCREEN.
- `strip.mjs`: strip 12 frame membuktikan urutan sebab-akibat, bukan loop beku.
- Hasil dan toleransi disimpan di `qa/diorama/report.json`; check yang tidak dijalankan ditulis UNVERIFIED, bukan lulus.

### E2E (Playwright, 1280×800 dan 768×1024)
1. Buka `/edu`, tekan Putar, `t` maju, langkah 1→4 berganti.
2. Klik daun pintu, kartu berganti ke "Bagian · Daun pintu", tombol kembali memulihkan.
3. Reset mengembalikan hero angle; muat ulang halaman mengembalikan keadaan awal.
4. `prefers-reduced-motion`: tidak ada autoplay, tombol langkah tetap bekerja.
5. `/warga` dan `/ops` tidak memuat chunk `three`.

### Aksesibilitas (NFR-04)
- Teks penjelas ada di DOM, bukan di kanvas; kontras AA.
- Pemilih bagian bisa dioperasikan keyboard; fokus terlihat.
- Target sentuh 44 px pada dock mobile.
- Status tidak hanya dibedakan warna: ada label teks dan ikon.

### Performa (NFR-02, NFR-03)
- Chunk awal tidak berubah; `/edu` dimuat malas.
- LCP `/edu` ≤ 2,5 detik pada 4G tersimulasi.
- ≥ 30 FPS pada laptop standar dengan DPR 2; RAF berhenti saat tab tidak terlihat.

---

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Estetika ilustrasi bentrok dengan dashboard pemerintahan | Terlihat seperti demo sampingan | Surface terpisah, palet kanonik, review desain di akhir E0 sebelum E2 |
| Scene dianggap hasil simulasi | Klaim ilmiah palsu | Badge tetap, angka hanya di DOM dan berlabel mock, tidak ada angka per wilayah |
| three.js masuk chunk awal | Merusak anggaran P6.3 | Lazy route, `manualChunks`, uji ukuran chunk di E1 dan CI |
| Template JS tanpa tipe di proyek TS strict | Typecheck merah | Satu berkas deklarasi di batas modul, hanya modul stabil yang dicopy |
| Upstream berubah (v5.7, churn tinggi) | Build rusak saat update | Pin commit, `UPSTREAM.md`, update hanya dengan sesi khusus |
| QA harness butuh `playwright-core` | Dependensi baru | Dev dependency saja, tidak masuk produksi |
| Uji penetrasi/kinematik gagal | Scene tidak lolos terima | Perbaiki geometri atau konstanta; dilarang menutupi dengan cutaway/transparansi |
| Pengguna mobile membuka `/edu` | Frame drop | Tidak ditautkan dari `/warga`; DPR 1,5; pesan "lebih baik di layar besar" bila perlu |
| Data mock berubah bentuk | Scene pecah | Kontrak `DioramaInput` sempit, adapter di satu berkas |
| ffmpeg tidak tersedia (terverifikasi) | MP4 E7 tertunda | GIF lebih dulu lewat encoder JS; MP4 opsional, bukan penghalang fase |

---

## 12. Jalur Alternatif (bila masalah aslinya lain)

| Keluhan | Perbaikan yang tepat |
|---|---|
| "Peta 3D kurang meyakinkan" | Tambah tile DEMNAS z12–13, naikkan eksagerasi bertingkat, air sebagai layer, bukan diorama |
| "Genangan belum terlihat 3D" | `fill-extrusion` per kelurahan atau deck.gl di atas terrain yang ada |
| "Operator tidak paham mekanisme" | Diorama U-2 (dokumen ini) |
| "Butuh visual untuk deck" | Diorama U-1 / E7 saja |
| "Butuh replay banjir 2020/2021" (FR-15) | Timeline MapLibre + `freeze(t)`; diorama bisa jadi pelengkap, bukan pengganti |

Diorama dan perbaikan peta tidak saling menggantikan; keduanya bisa berjalan di track berbeda.

---

## 13. Definition of Done

### E7 (aset presentasi, fase pertama)
- Contact sheet 12 frame tersedia dan urutan sebab-akibat terbaca tanpa teks.
- Frame `t = 0`, `7,5`, `15` detik identik dengan render ulang (checksum sama).
- GIF dipakai di README dan deck; MP4 bila ffmpeg tersedia.
- Tidak ada perubahan pada aplikasi, rute, atau bundle.

### `/edu` (E0–E6)
- `/edu` dapat dibuka, dimuat malas, dan chunk awal tidak bertambah lebih dari 5 kB gzip.
- Scene menampilkan empat langkah sebab-akibat, play/pause/prev/next/reset berfungsi.
- Klik dan pemilih bagian bekerja dengan mouse dan keyboard; material pulih persis.
- Semua angka kartu berasal dari store; tidak ada angka di dalam kanvas.
- Badge "Ilustrasi mekanisme, bukan keluaran hidraulik" selalu terlihat.
- Uji clearance/penetrasi dan determinisme lulus; `qa/diorama/report.json` terisi.
- `lint`, `typecheck`, `test`, `build` lulus; e2e dan axe lulus.
- Screenshot masuk `docs/ui-prototype/README.md`; `demo-script.md` diperbarui.
- `docs/plan/README.md` menandai fase yang selesai.

---

## 14. Keputusan yang Sudah Diambil (16 November 2026)

| # | Pertanyaan | Jawaban | Konsekuensi dalam rencana |
|---|---|---|---|
| 1 | Surface | `/edu` terpisah | D-01; tidak ada perubahan pada `OpsLayout`, `MapPanel`, `MapView` |
| 2 | Urutan kerja | E7 lebih dulu | D-13; §9 diurutkan ulang, §9.1 menambah rincian E7 |
| 3 | Cakupan | Pintu air dulu, pompa menyusul | D-06, D-14; E8 ditandai ditunda, manifest tetap menyediakan slot pompa |
| 4 | Preset render | `stroked-toon` | D-03; pixel/dither tidak diuji di E0 |
| 5 | Runner QA | Playwright disetujui | D-15; `playwright-core` dev dependency, Chrome lokal terpakai |

### Sisa keputusan kecil (tidak memblokir E7)

- Apakah GIF 960 px cukup untuk slide, atau perlu 1440 px (menambah ukuran berkas ± 2×)?
- Nama berkas final dan apakah aset ikut repo atau masuk `docs/` setelah render.
- Tanggal target demo, untuk menentukan E7 selesai sebelum atau sesudah E0.

---

## 15. Langkah Berikutnya

1. Jalankan E7: scene minimal + harness render + GIF/contact sheet.
2. Review hasil E7 terhadap §13 E7 dan §6.4; putuskan go/no-go sebelum E0.
3. Bila lolos, lanjut E0 (proof of look dengan kartu kanonik), lalu E1.
4. Perbarui status di [`README.md`](README.md) setiap fase selesai.
