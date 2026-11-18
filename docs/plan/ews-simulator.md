# Rencana Pengembangan — Early Warning System & Simulator

Status: **disetujui 18 November 2026. F0–F6 selesai 19 November 2026.**

Acuan requirement: FR-01–FR-15, FR-20–FR-43, FR-R1–FR-R11, NFR-01–NFR-13 di [`docs/analysis/requirements.md`](../analysis/requirements.md).

---

## 1. Ringkasan

HydroTwin-AI memiliki **dua use case**:

| Use case | Pengguna | Inti |
|---|---|---|
| **Early Warning System (EWS)** | Operator BPBD/DSDA dan warga | Hasil pemodelan banjir → AI merumuskan pesan peringatan → operator menyetujui/menyiarkan → warga hanya menerima peringatan yang disiarkan |
| **Simulator** | Perencana | Parameter kebijakan → peta dan dampak → AI membantu interpretasi → Executive Brief |

Tiga tampilan yang ada sekarang memetakan ke dua use case tersebut:

| Tampilan | Rute | Use case |
|---|---|---|
| Dashboard Operasional | `/ops` | EWS — operator |
| PWA Warga | `/warga` | EWS — warga |
| Konsol Perencana | `/rencana` | Simulator — perencana |

Navigasi dikelompokkan menjadi **Peringatan Dini** dan **Simulator**. Rute tetap dipertahankan agar dokumen, screenshot, dan demo lama tidak rusak.

---

## 2. Keputusan Final

| # | Topik | Keputusan |
|---|---|---|
| D-01 | Granularitas siarkan | Per wilayah. Operator menyiarkan dan menarik peringatan per kelurahan/wilayah; warga memilih wilayah dan hanya melihat peringatan wilayahnya. |
| D-02 | Human-in-the-loop | Operator boleh menyunting teks yang disusun AI sebelum menyiarkan. Teks AI asli dan teks final sama-sama tercatat. |
| D-03 | Mode AI prototipe | Mock default + adapter. Provider nyata dapat dipasang lewat konfigurasi tanpa mengubah UI. |
| D-04 | Trigger simulator | Interpretasi AI otomatis setelah parameter berhenti berubah; Executive Brief di-generate on-demand. |
| D-05 | Cakupan | EWS dan AI simulator dikerjakan dalam fase terpisah. |
| D-06 | Arti “blast” | Publikasi ke feed peringatan publik pada prototipe (localStorage + BroadcastChannel), bukan SMS, WhatsApp, atau push notification. |
| D-07 | Autentikasi | Tidak ada autentikasi pada prototipe. Pemisahan operator/warga/perencana adalah pemisahan UI, bukan kontrol keamanan. |
| D-08 | Kedaluwarsa | Peringatan aktif sampai ditarik, digantikan siaran baru untuk wilayah yang sama, atau melewati TTL 6 jam. |
| D-09 | Peran AI | AI tidak menentukan level risiko dan tidak menerima data mentah. AI menyusun bahasa dari konteks yang sudah dihitung. |
| D-10 | Pemisahan keputusan | Keputusan rekomendasi taktis dan persetujuan peringatan publik adalah dua hal terpisah. |

---

## 3. Batas Lingkup

### Termasuk

- Alur EWS: kandidat peringatan per wilayah, penyusunan pesan AI, penyuntingan, persetujuan, siarkan, tarik, kedaluwarsa, audit.
- Halaman warga yang hanya membaca peringatan berstatus disiarkan.
- Registry parameter simulator dan penambahan parameter pada fase berikutnya.
- Interpretasi AI hasil skenario dan Executive Brief on-demand.
- Fallback template, validasi angka, label sumber, dan pengujian alur utama.

### Tidak termasuk

- Autentikasi, RBAC, dan pembagian sesi operator/warga/perencana.
- Pengiriman SMS, WhatsApp, push notification, atau integrasi broadcast BPBD.
- Provider AI nyata sebagai default prototipe.
- Pemodelan hidrologi produksi (HEC-RAS/GNN).
- Peta zonasi desa, GPS, dan mode offline penuh; itu tetap menjadi perluasan di [`web-publik.md`](web-publik.md).
- Brief yang dibagikan antarperencana melalui backend.

---

## 4. Arsitektur Target

```
┌────────────────────────── PERINGATAN DINI ──────────────────────────┐
│                                                                     │
│  Hasil pemodelan banjir                                             │
│         ↓                                                           │
│  Kandidat peringatan per wilayah (waspada/siaga)                    │
│         ↓                                                           │
│  AI composer ──> validator angka + tone ──> fallback template       │
│         ↓                                                           │
│  Operator: sunting ──> setujui & siarkan / tolak                    │
│         ↓                                                           │
│  Published alert store per wilayah ──> BroadcastChannel             │
│         ↓                                                           │
│  Halaman warga: hanya peringatan berstatus disiarkan                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────── SIMULATOR ──────────────────────────────┐
│                                                                     │
│  Parameter registry ──> engine ──> peta + dampak                    │
│         ↓                                                           │
│  AI interpretasi (otomatis)                                         │
│  Executive Brief (on-demand) ──> salin / unduh Markdown             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Lapisan bersama:
- Pipeline LLM: timeout, fallback, validasi angka/tone, provenance
- Audit log append-only
- Engine simulasi mock yang sudah ada
```

Pemetaan model AI mengikuti `05-arsitektur-si.md`: model bahasa awam untuk pesan peringatan, model penalaran kebijakan untuk interpretasi dan Executive Brief. Keduanya lewat adapter yang sama.

---

## 5. Model Domain Peringatan

```ts
type StatusPeringatan =
  | "draf"
  | "disiarkan"
  | "ditarik"
  | "ditolak"
  | "kedaluwarsa";

type Peringatan = {
  id: string;
  wilayahKode: string;
  wilayahNama: string;
  nodeId: string;
  level: "waspada" | "siaga";
  kedalamanM: number | null;
  estimasiTibaMenit: number | null;
  puncakJam: number;
  keyakinan: number;
  teksAi: string;
  teksFinal: string;
  sumberNarasi: "llm" | "template";
  modelLabel: string;
  status: StatusPeringatan;
  dibuatPada: string;
  narasiDibuatPada?: string | null;
  alasanFallback?: "timeout" | "error" | "validasi" | null;
  disuntingPada?: string;
  disiarkanPada?: string;
  disiarkanOleh?: string;
  ditarikPada?: string;
  kedaluwarsaPada?: string;
  versiSimulasi: string;
};
```

Lifecycle:

```
draf ──> disiarkan ──> ditarik
  │           │
  └──> ditolak└──> kedaluwarsa
```

### Invariant

1. Halaman warga hanya membaca `status === "disiarkan"` dan wilayah yang cocok.
2. Satu wilayah hanya memiliki satu peringatan aktif. Siaran baru menggantikan peringatan lama.
3. Menarik peringatan langsung menghilangkannya dari warga; audit tetap tersimpan.
4. Hanya level `waspada`/`siaga` yang dapat disiarkan. Level `aman` tidak di-blast.
5. AI tidak menentukan level dan tidak menerima data mentah.
6. Angka dalam narasi harus cocok dengan hasil pemodelan; jika tidak, fallback template.
7. Suntingan operator dicatat sebagai versi baru; teks AI asli tidak ditimpa.
8. Keputusan rekomendasi taktis tidak otomatis menjadi persetujuan peringatan publik.

### Audit event

`peringatan_disusun`, `peringatan_disunting`, `peringatan_disiarkan`, `peringatan_ditolak`, `peringatan_ditarik`, `peringatan_kedaluwarsa`, `llm_call`, `fallback`.

---

## 6. Model Simulator

- **Registry parameter**: deskriptor berisi id, label, satuan, batas, langkah, default, tipe, dan bantuan. Panel skenario dirender dari registry.
- **Engine**: tetap typed. Menambah parameter berarti menambah field input, formula engine, dan satu entri registry.
- **Interpretasi AI**: ringkasan dampak skenario terhadap baseline, trade-off kebijakan, dan keterbatasan model. Dihitung otomatis setelah input berhenti berubah.
- **Executive Brief**: struktur tetap (ringkasan skenario, dampak, opsi kebijakan, rekomendasi, batasan), di-generate on-demand, dapat disalin/diunduh Markdown.
- **Provenance**: sumber AI/template, model, waktu generasi, dan label “draf, menunggu tinjauan analis”.

Parameter tambahan tidak dikarang pada fase ini. Registry disiapkan agar daftar parameter yang disepakati nanti dapat ditambahkan tanpa mengubah struktur panel.

---

## 7. Fase Pengerjaan

### F0 — Dokumen & keputusan

Status: **selesai 18 November 2026.**

- Use case, requirement, state, data model, DFD, activity, arsitektur, UI, dan rencana web publik sudah diselaraskan.
- Tidak ada perubahan kode.

Kriteria selesai: dua use case terdokumentasi, FR-26 direvisi, lifecycle peringatan dan aturan publikasi disepakati. **Terpenuhi.**

### F1 — Fondasi EWS

Status: **selesai 18 November 2026.**

- Tipe domain peringatan + schema Zod.
- Penyusun kandidat peringatan per wilayah (template; hanya waspada/siaga).
- Store publikasi per wilayah + BroadcastChannel + kedaluwarsa + audit.
- UI operator: sunting, siarkan, tolak, tarik.
- Halaman warga: pemilih wilayah, hanya peringatan aktif, empty state resmi.
- Unit test gating, penggantian per wilayah, tarik, kedaluwarsa, dan persistensi.
- Smoke test browser: sunting → siarkan → warga melihat → tarik → warga kosong.

Kriteria selesai: siarkan → warga melihat; tolak → warga tidak melihat; tarik → warga kembali kosong; peringatan wilayah A tidak muncul di wilayah B. **Terpenuhi.**

Catatan F1: payload peringatan sudah menyediakan `kedalamanM`, tetapi nilainya masih `null` karena simulasi operator EWS berbasis debit. Kedalaman akan diisi saat konteks model/AI composer tersedia di F2.

Titik kode utama:

- `src/schemas/peringatan.ts`
- `src/services/alertService.ts`
- `src/services/publicationService.ts`
- `src/hooks/usePeringatanPublik.ts`
- `src/store/operatorStore.ts`
- `src/features/alerts/AlertReviewSheet.tsx`
- `src/pages/WargaPage.tsx`

### F2 — AI composer peringatan

Status: **selesai 18 November 2026.**

- Task `peringatan_publik` dengan adapter mock OpenAI dan fallback template.
- Validator angka + tone (FR-R5, FR-R6): level, wilayah, arahan tindakan, angka konteks, larangan bahasa panik/istilah teknis.
- Provenance: sumber LLM/template, model, waktu generate, alasan fallback.
- Generate otomatis saat wilayah dipilih, regenerate manual, dan sunting sebelum siarkan.
- Demo fallback lewat toggle "paksa gagal LLM".

Kriteria selesai: AI gagal/timeout/menyimpang → template; angka selalu konsisten; operator dapat menyunting dan menyiarkan. **Terpenuhi.**

Titik kode utama:

- `src/services/llm/pipeline.ts`
- `src/services/llm/tasks/peringatanPublik.ts`
- `src/hooks/usePeringatanComposer.ts`
- `src/features/alerts/AlertReviewSheet.tsx`

### F3 — Registry parameter simulator

Status: **selesai 18 November 2026.**

- Deskriptor parameter: id, label, satuan, batas, langkah, default, tipe, sumber, ikon, tick, dan aria.
- Panel `ScenarioPanel` dirender dari registry; tidak ada kontrol hardcoded per parameter.
- Store memakai setter generik `setParameter` dan `terapkan`.
- Default, batas, dan baseline berasal dari satu sumber (`plannerParams.ts`).
- Test memastikan setiap field `PlannerInput` punya entri registry, default/batas konsisten, dan store generik bekerja.

Kriteria selesai: parameter tambahan dapat dimasukkan tanpa mengubah struktur panel. **Terpenuhi secara struktural**; daftar parameter tambahan masih menunggu keputusan F3 lanjutan.

Titik kode utama:

- `src/engine/plannerParams.ts`
- `src/features/planner/ScenarioPanel.tsx`
- `src/store/plannerStore.ts`

### F4 — AI simulator

Status: **selesai 18 November 2026.**

- Task `interpretasi_skenario`: otomatis mengikuti skenario aktif, dengan provenance dan fallback.
- Task `executive_brief`: on-demand, struktur Markdown, fallback deterministik, salin/unduh.
- Validator angka + klaim berlebihan + kewajiban menyebut batasan model mock.
- Brief ditandai usang saat parameter berubah dan dapat di-generate ulang.
- Label draf dan sumber AI/template tampil.

Kriteria selesai: parameter berubah → interpretasi berubah; AI gagal → fallback; brief dapat diekspor. **Terpenuhi.**

Titik kode utama:

- `src/services/llm/tasks/plannerNarrative.ts`
- `src/services/llm/tasks/interpretasiSkenario.ts`
- `src/services/llm/tasks/executiveBrief.ts`
- `src/hooks/useInterpretasiSkenario.ts`
- `src/hooks/useExecutiveBrief.ts`
- `src/features/planner/InterpretationPanel.tsx`
- `src/features/planner/ExecutiveBrief.tsx`

### F5 — Kualitas & dokumentasi

Status: **selesai 19 November 2026.**

- E2E EWS + Simulator (`pnpm test:e2e`) mencakup AI, sunting, tolak, siarkan, tarik, fallback, interpretasi, brief, unduh Markdown, dan brief usang.
- Audit aksesibilitas axe-core (`pnpm audit:a11y`) pada 5 target termasuk tema gelap; 0 pelanggaran serious/critical.
- Screenshot diperbarui untuk panel peringatan, simulator dengan interpretasi/brief, dan PWA warga.
- Demo script, checklist a11y, laporan audit, dan README diperbarui.
- `lint`, `typecheck`, `test`, `test:e2e`, `audit:a11y`, dan `build` lulus.

F3 dapat berjalan paralel dengan F1–F2 karena menyentuh area berbeda.

### F6 — Bilingual UI English/Indonesia

Status: **selesai 19 November 2026.**

- Default English untuk demo internasional; pilihan ID/EN tersimpan di `localStorage`.
- Kamus UI lengkap untuk ID dan EN, termasuk label peta, level risiko, status data, parameter simulator, dan pesan status.
- Pilihan bahasa di header dan halaman warga; perubahan memuat ulang aplikasi agar teks, angka, dan narasi konsisten.
- Template peringatan, mock AI peringatan, rekomendasi operator, interpretasi, dan Executive Brief mengikuti bahasa aktif.
- Angka mengikuti locale (`en-US` atau `id-ID`); parser narasi menerima kedua format.
- Nama tempat, instansi, dan istilah lokal (kelurahan, RW) dipertahankan.

Kriteria selesai: default EN, toggle ID/EN berfungsi, narasi dan angka mengikuti bahasa, test dan E2E lulus. **Terpenuhi.**

Titik kode utama:

- `src/i18n/id.ts`, `src/i18n/en.ts`, `src/i18n/teks.ts`
- `src/components/shared/LanguageToggle.tsx`
- `src/lib/format.ts`
- task LLM `peringatanPublik.ts` dan `plannerNarrative.ts`

---

## 8. Pengujian

### Unit

- Transisi status peringatan.
- Gating per wilayah: satu peringatan aktif, siaran baru menggantikan, tarik menghilangkan.
- Audit suntingan: teks AI asli dan teks final tersimpan.
- Validator angka dan tone pesan peringatan.
- Fallback untuk peringatan, interpretasi, dan brief.
- Registry parameter: empat parameter lama dan satu parameter uji.
- Penyusun konteks interpretasi dan brief.

### E2E

1. Operator menyiarkan peringatan → halaman warga menampilkan peringatan tersebut.
2. Operator menolak → halaman warga tidak menampilkan peringatan.
3. Operator menarik → halaman warga menampilkan empty state.
4. Operator menyunting teks AI → warga menerima teks final.
5. AI dipaksa gagal → pesan template dan label sumber tampil.
6. Perencana mengubah parameter → peta, dampak, dan interpretasi berubah.
7. Perencana menekan generate brief → brief tampil dan dapat disalin/diunduh.

### Aksesibilitas

- Status peringatan tidak hanya warna.
- Perubahan siarkan/tarik diumumkan lewat `aria-live`.
- Target sentuh warga minimal 44 px.
- Sheet tinjauan peringatan menjebak fokus dan mengembalikannya ke pemicu.

---

## 9. Risiko

| Risiko | Mitigasi |
|---|---|
| Peringatan wilayah A muncul di wilayah B | Kunci publikasi per wilayah + test gating |
| Satu keputusan operator membuka semua wilayah | Persetujuan per peringatan, bukan flag global |
| Operator tidak sempat meninjau saat darurat | Pesan AI ringkas, aksi utama jelas, fallback cepat |
| Pesan AI menimbulkan kepanikan | Validator tone + template + review operator |
| Peringatan kedaluwarsa masih tampil | TTL 6 jam + penggantian per wilayah + test |
| AI simulator terlalu percaya diri | Label draf, batasan model, validasi angka, fallback |
| localStorage tidak lintas perangkat | Dinyatakan sebagai batasan prototipe; produksi lewat backend |
| Parameter tambahan mengubah arti skenario lama | Registry + versi parameter + catatan perubahan |

---

## 10. Isu Terbuka

| ID | Isu | Keputusan sementara |
|---|---|---|
| I-01 | Daftar parameter simulator tambahan | Belum ditentukan; registry disiapkan generik |
| I-02 | Rename rute `/ops` → `/siaga`, `/rencana` → `/simulator` | Tidak; rute lama dipertahankan, label navigasi diubah |
| I-03 | TTL peringatan | 6 jam, dapat diubah di satu konstanta |
| I-04 | Channel distribusi nyata (SMS/WA/push) | Di luar prototipe |
| I-05 | Brief PDF | Ditunda; ekspor Markdown lebih dulu |

---

## 11. Definisi Selesai

- Dua use case terlihat jelas di navigasi dan dokumen.
- Hanya peringatan yang disiarkan operator yang dapat dibaca warga.
- Peringatan dapat disunting, disiarkan, ditarik, dan kedaluwarsa dengan audit lengkap.
- Simulator memiliki registry parameter, interpretasi AI, dan Executive Brief dengan fallback.
- Semua test, lint, typecheck, dan build lulus.
- Screenshot dan demo script diperbarui.
