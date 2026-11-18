import type { Bahasa } from "@/i18n/teks";
import { formatAngka } from "@/lib/format";
import type {
  HasilKelurahan,
  OpsiSkenario,
  PlannerInput,
  PlannerResult,
  PlannerSummary,
} from "@/engine/planner";
import { alasanKegagalan, denganTimeout } from "../pipeline";
import type { AlasanFallback } from "../types";
import { ekstrakAngka } from "../validateNarrative";

export const TIMEOUT_PLANNER_NARRATIVE_MS = 5000;

export type PlannerNarrativeKind = "interpretasi" | "brief";

export type PlannerNarrativeContext = {
  versi: string;
  bahasa: Bahasa;
  input: PlannerInput;
  ringkasan: PlannerSummary;
  dasar: PlannerSummary;
  opsi: OpsiSkenario[];
  teratas: HasilKelurahan[];
  /** Positif berarti luas genangan turun dibanding dasar. */
  deltaLuasPersen: number;
  deltaRwPersen: number;
};

export type PlannerNarrativeProvider = {
  nama: string;
  modelLabel: string;
  generate(input: PlannerNarrativeContext): Promise<{ teks: string }>;
};

export type PlannerNarrativeResult = {
  jenis: PlannerNarrativeKind;
  versi: string;
  teks: string;
  sumber: "llm" | "template";
  modelLabel: string;
  dibuatPada: string;
  alasanFallback?: AlasanFallback;
};

export type MockPlannerNarrativeOptions = {
  peluangGagal?: number;
  delayMinMs?: number;
  delayMaxMs?: number;
  acak?: () => number;
  paksaGagal?: () => boolean;
};

export type GeneratePlannerNarrativeOptions = MockPlannerNarrativeOptions & {
  provider?: PlannerNarrativeProvider;
  sekarang?: Date;
  timeoutMs?: number;
};

const KATA_OVERCLAIM = [
  "pasti",
  "dijamin",
  "tanpa risiko",
  "tidak mungkin",
  "guaranteed",
  "certainly",
  "definitely",
  "risk-free",
  "impossible",
];
const BAGIAN_BRIEF: Record<Bahasa, string[]> = {
  id: ["ringkasan", "dampak", "opsi", "rekomendasi", "batasan"],
  en: ["summary", "impact", "option", "recommendation", "limitation"],
};

function delta(nilai: number, dasar: number): number {
  if (dasar <= 0) return 0;
  return Math.round(((dasar - nilai) / dasar) * 100);
}

function arah(deltaPersen: number, bahasa: Bahasa): string {
  if (bahasa === "en") {
    if (deltaPersen > 0) return "reduces";
    if (deltaPersen < 0) return "increases";
    return "does not change";
  }
  if (deltaPersen > 0) return "menurunkan";
  if (deltaPersen < 0) return "menaikkan";
  return "tidak mengubah";
}

function namaTeratas(ctx: PlannerNarrativeContext): string {
  if (ctx.teratas.length === 0) {
    return ctx.bahasa === "en"
      ? "no kelurahan at watch or alert level"
      : "tidak ada kelurahan berstatus waspada/siaga";
  }
  return ctx.teratas.map((item) => item.kelurahan).join(", ");
}

function moratoriumLabel(input: PlannerInput, bahasa: Bahasa): string {
  if (bahasa === "en") return input.moratorium ? "enabled" : "not enabled";
  return input.moratorium ? "diaktifkan" : "tidak diaktifkan";
}

export function buildPlannerNarrativeContext(
  input: PlannerInput,
  hasil: PlannerResult,
  dasar: PlannerResult,
  opsi: OpsiSkenario[],
  bahasa: Bahasa = "en",
): PlannerNarrativeContext {
  const teratas = [...hasil.perKelurahan].sort((a, b) => b.kedalamanM - a.kedalamanM).slice(0, 3);

  return {
    versi: `${bahasa}:${JSON.stringify(input)}`,
    bahasa,
    input,
    ringkasan: hasil.ringkasan,
    dasar: dasar.ringkasan,
    opsi,
    teratas,
    deltaLuasPersen: delta(hasil.ringkasan.luasGenanganHa, dasar.ringkasan.luasGenanganHa),
    deltaRwPersen: delta(hasil.ringkasan.rwTerdampak, dasar.ringkasan.rwTerdampak),
  };
}

export function susunInterpretasiTemplate(ctx: PlannerNarrativeContext): string {
  const { input, ringkasan, dasar } = ctx;

  if (ctx.bahasa === "en") {
    return (
      `The ${formatAngka(input.hujan24JamMm, 0)} mm/24h rainfall and ` +
      `${formatAngka(input.pasangMeter, 1)} m tidal surge scenario ${arah(ctx.deltaLuasPersen, "en")} ` +
      `flooded area by ${Math.abs(ctx.deltaLuasPersen)}% versus baseline ` +
      `(${formatAngka(dasar.luasGenanganHa, 0)} → ${formatAngka(ringkasan.luasGenanganHa, 0)} ha), ` +
      `with ${ringkasan.rwTerdampak} affected RW and ${ringkasan.jumlahSiaga} kelurahan at alert level. ` +
      `Peak ${formatAngka(ringkasan.puncakJam, 1)} h; confidence ${ringkasan.keyakinan}%. ` +
      `Green space ${formatAngka(input.rthPersen, 0)}% and groundwater moratorium ` +
      `${moratoriumLabel(input, "en")}; deepest areas: ${namaTeratas(ctx)}. ` +
      `This is a mock model, not HEC-RAS; the interpretation needs analyst review.`
    );
  }

  return (
    `Skenario hujan ${formatAngka(input.hujan24JamMm, 0)} mm/24 jam dan pasang ` +
    `${formatAngka(input.pasangMeter, 1)} m ${arah(ctx.deltaLuasPersen, "id")} luas genangan ` +
    `${Math.abs(ctx.deltaLuasPersen)}% dibanding dasar (${formatAngka(dasar.luasGenanganHa, 0)} → ` +
    `${formatAngka(ringkasan.luasGenanganHa, 0)} ha), dengan ${ringkasan.rwTerdampak} RW terdampak ` +
    `dan ${ringkasan.jumlahSiaga} kelurahan siaga. Puncak ${formatAngka(ringkasan.puncakJam, 1)} jam; ` +
    `keyakinan ${ringkasan.keyakinan}%. RTH ${formatAngka(input.rthPersen, 0)}% dan moratorium air ` +
    `tanah ${moratoriumLabel(input, "id")}; wilayah paling terdalam: ${namaTeratas(ctx)}. ` +
    `Model mock, bukan HEC-RAS; interpretasi ini perlu tinjauan analis.`
  );
}

function namaOpsi(nama: string, bahasa: Bahasa): string {
  if (bahasa === "id") return nama;
  return (
    {
      Dasar: "Baseline",
      RTH: "Green space",
      Moratorium: "Moratorium",
      Gabungan: "Combined",
    }[nama] ?? nama
  );
}

export function susunBriefTemplate(ctx: PlannerNarrativeContext, rekomendasiTambahan = ""): string {
  const { input, ringkasan, dasar, opsi } = ctx;

  if (ctx.bahasa === "en") {
    const opsiTeks =
      opsi.length > 0
        ? opsi
            .map(
              (item) => `- ${namaOpsi(item.nama, "en")}: ${formatAngka(item.luasGenanganHa, 0)} ha`,
            )
            .join("\n")
        : "- Options not available.";

    const rekomendasi =
      rekomendasiTambahan ||
      (ctx.deltaLuasPersen > 0
        ? "This policy combination is worth taking to analyst review, with field verification in the deepest areas."
        : "This parameter combination does not reduce flooded area; test other options and verify the data.");

    return [
      "## Summary",
      `${formatAngka(input.hujan24JamMm, 0)} mm/24h rainfall, ${formatAngka(input.pasangMeter, 1)} m tidal surge, ` +
        `${formatAngka(input.rthPersen, 0)}% green space, groundwater moratorium ${moratoriumLabel(input, "en")}.`,
      "",
      "## Impact",
      `Flooded area ${formatAngka(ringkasan.luasGenanganHa, 0)} ha (${arah(ctx.deltaLuasPersen, "en")} ` +
        `${Math.abs(ctx.deltaLuasPersen)}% vs baseline ${formatAngka(dasar.luasGenanganHa, 0)} ha), ` +
        `${ringkasan.rwTerdampak} affected RW, peak ${formatAngka(ringkasan.puncakJam, 1)} h, ` +
        `confidence ${ringkasan.keyakinan}%. Deepest areas: ${namaTeratas(ctx)}.`,
      "",
      "## Policy options",
      opsiTeks,
      "",
      "## Recommendation",
      rekomendasi,
      "",
      "## Limitations",
      "Mock model, not HEC-RAS. Numbers come from the scenario and need verification and analyst review.",
    ].join("\n");
  }

  const opsiTeks =
    opsi.length > 0
      ? opsi.map((item) => `- ${item.nama}: ${formatAngka(item.luasGenanganHa, 0)} ha`).join("\n")
      : "- Opsi belum tersedia.";

  const rekomendasi =
    rekomendasiTambahan ||
    (ctx.deltaLuasPersen > 0
      ? "Kombinasi kebijakan ini layak dilanjutkan ke kajian analis, dengan verifikasi lapangan pada wilayah terdalam."
      : "Kombinasi parameter belum menurunkan luas genangan; perlu uji opsi lain dan verifikasi data.");

  return [
    "## Ringkasan skenario",
    `Hujan ${formatAngka(input.hujan24JamMm, 0)} mm/24 jam, pasang ${formatAngka(input.pasangMeter, 1)} m, ` +
      `RTH ${formatAngka(input.rthPersen, 0)}%, moratorium air tanah ${moratoriumLabel(input, "id")}.`,
    "",
    "## Dampak",
    `Luas genangan ${formatAngka(ringkasan.luasGenanganHa, 0)} ha (${arah(ctx.deltaLuasPersen, "id")} ` +
      `${Math.abs(ctx.deltaLuasPersen)}% vs dasar ${formatAngka(dasar.luasGenanganHa, 0)} ha), ` +
      `${ringkasan.rwTerdampak} RW terdampak, puncak ${formatAngka(ringkasan.puncakJam, 1)} jam, ` +
      `keyakinan ${ringkasan.keyakinan}%. Wilayah paling terdalam: ${namaTeratas(ctx)}.`,
    "",
    "## Opsi kebijakan",
    opsiTeks,
    "",
    "## Rekomendasi",
    rekomendasi,
    "",
    "## Batasan",
    "Model mock, bukan HEC-RAS. Angka berasal dari skenario dan perlu verifikasi serta tinjauan analis.",
  ].join("\n");
}

function susunInterpretasiMock(ctx: PlannerNarrativeContext, varian: number): string {
  if (varian % 2 === 0) return susunInterpretasiTemplate(ctx);

  const { input, ringkasan } = ctx;

  if (ctx.bahasa === "en") {
    return (
      `With ${formatAngka(input.hujan24JamMm, 0)} mm/24h rainfall and ` +
      `${formatAngka(input.pasangMeter, 1)} m tidal surge, this scenario ${arah(ctx.deltaLuasPersen, "en")} ` +
      `flooded area by ${Math.abs(ctx.deltaLuasPersen)}% versus baseline. Flooded area is ` +
      `${formatAngka(ringkasan.luasGenanganHa, 0)} ha, with ${ringkasan.rwTerdampak} affected RW and ` +
      `${ringkasan.jumlahSiaga} kelurahan at alert level; peak ${formatAngka(ringkasan.puncakJam, 1)} h. ` +
      `Green space ${formatAngka(input.rthPersen, 0)}% and moratorium ${moratoriumLabel(input, "en")} ` +
      `should be read together with the mock model limits, not HEC-RAS.`
    );
  }

  return (
    `Dengan hujan ${formatAngka(input.hujan24JamMm, 0)} mm/24 jam dan pasang ` +
    `${formatAngka(input.pasangMeter, 1)} m, skenario ini ${arah(ctx.deltaLuasPersen, "id")} luas genangan ` +
    `${Math.abs(ctx.deltaLuasPersen)}% dari dasar. Luas genangan ${formatAngka(ringkasan.luasGenanganHa, 0)} ha, ` +
    `${ringkasan.rwTerdampak} RW terdampak, dan ${ringkasan.jumlahSiaga} kelurahan siaga; ` +
    `puncak ${formatAngka(ringkasan.puncakJam, 1)} jam. Opsi RTH ${formatAngka(input.rthPersen, 0)}% dan ` +
    `moratorium ${moratoriumLabel(input, "id")} perlu dibaca bersama batas model mock, bukan HEC-RAS.`
  );
}

function susunBriefMock(ctx: PlannerNarrativeContext): string {
  const rekomendasi =
    ctx.bahasa === "en"
      ? ctx.deltaLuasPersen > 0
        ? "Prioritize the option that reduces flooding most, then verify the deepest areas with an analyst."
        : "Review the parameter combination and test other options before proposing it as policy."
      : ctx.deltaLuasPersen > 0
        ? "Prioritaskan opsi yang paling menurunkan genangan, lalu verifikasi wilayah terdalam bersama analis."
        : "Tinjau ulang kombinasi parameter dan uji opsi lain sebelum diusulkan sebagai kebijakan.";

  return susunBriefTemplate(ctx, rekomendasi);
}

export function buatMockPlannerProvider(
  jenis: PlannerNarrativeKind,
  opsi: MockPlannerNarrativeOptions = {},
): PlannerNarrativeProvider {
  const {
    peluangGagal = 0,
    delayMinMs = 450,
    delayMaxMs = 1400,
    acak = Math.random,
    paksaGagal = () => false,
  } = opsi;

  return {
    nama: `mock-${jenis}`,
    modelLabel: "Claude (mock)",
    async generate(input: PlannerNarrativeContext) {
      const delay = delayMinMs + acak() * Math.max(0, delayMaxMs - delayMinMs);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (paksaGagal() || acak() < peluangGagal) {
        throw new Error("Mock planner narrative gagal merespons");
      }

      return {
        teks:
          jenis === "brief"
            ? susunBriefMock(input)
            : susunInterpretasiMock(input, Math.floor(acak() * 2)),
      };
    },
  };
}

export function templatePlannerProvider(jenis: PlannerNarrativeKind): PlannerNarrativeProvider {
  return {
    nama: `template-${jenis}`,
    modelLabel: "Template HydroTwin",
    generate(input: PlannerNarrativeContext) {
      return Promise.resolve({
        teks: jenis === "brief" ? susunBriefTemplate(input) : susunInterpretasiTemplate(input),
      });
    },
  };
}

export function angkaDiizinkanPlanner(ctx: PlannerNarrativeContext): Set<number> {
  const izin = new Set<number>();
  const tambah = (nilai: number) => izin.add(Number(nilai.toFixed(2)));

  tambah(ctx.input.hujan24JamMm);
  tambah(ctx.input.pasangMeter);
  tambah(ctx.input.rthPersen);
  tambah(ctx.deltaLuasPersen);
  tambah(ctx.deltaRwPersen);
  tambah(Math.abs(ctx.deltaLuasPersen));
  tambah(Math.abs(ctx.deltaRwPersen));

  for (const ringkasan of [ctx.ringkasan, ctx.dasar]) {
    tambah(ringkasan.luasGenanganHa);
    tambah(ringkasan.rwTerdampak);
    tambah(ringkasan.puncakJam);
    tambah(ringkasan.keyakinan);
    tambah(ringkasan.jumlahAman);
    tambah(ringkasan.jumlahWaspada);
    tambah(ringkasan.jumlahSiaga);
  }

  for (const item of ctx.opsi) tambah(item.luasGenanganHa);
  for (const item of ctx.teratas) {
    tambah(item.kedalamanM);
    tambah(item.luasGenanganHa);
    tambah(item.rwTerdampak);
  }

  // Konstanta penyajian yang lazim pada brief.
  for (const nilai of [24, 6, 3, 2027]) tambah(nilai);

  return izin;
}

export function validatePlannerNarrative(
  teks: string,
  ctx: PlannerNarrativeContext,
  jenis: PlannerNarrativeKind,
): string[] {
  const masalah: string[] = [];
  const lower = teks.toLowerCase();

  if (KATA_OVERCLAIM.some((kata) => lower.includes(kata))) {
    masalah.push("bahasa terlalu yakin");
  }

  if (!/mock|hec-ras/i.test(teks)) {
    masalah.push("batasan model tidak disebut");
  }

  if (jenis === "brief") {
    const bagian = BAGIAN_BRIEF[ctx.bahasa].filter((kata) => lower.includes(kata));
    if (bagian.length < 2) masalah.push("struktur brief tidak lengkap");
  }

  if (teks.length > (jenis === "brief" ? 2500 : 800)) {
    masalah.push("teks terlalu panjang");
  }

  const izin = angkaDiizinkanPlanner(ctx);
  const menyimpang = ekstrakAngka(teks).filter(
    (angka) => ![...izin].some((nilai) => Math.abs(nilai - angka) < 0.5),
  );

  if (menyimpang.length > 0) {
    masalah.push(`angka menyimpang: ${menyimpang.join(", ")}`);
  }

  return masalah;
}

export async function generatePlannerNarrative(
  jenis: PlannerNarrativeKind,
  input: PlannerNarrativeContext,
  opsi: GeneratePlannerNarrativeOptions = {},
): Promise<PlannerNarrativeResult> {
  const {
    sekarang = new Date(),
    timeoutMs = TIMEOUT_PLANNER_NARRATIVE_MS,
    provider,
    ...mockOptions
  } = opsi;
  const llm = provider ?? buatMockPlannerProvider(jenis, mockOptions);
  const template = templatePlannerProvider(jenis);
  const dibuatPada = sekarang.toISOString();

  const fallback = async (alasan: AlasanFallback): Promise<PlannerNarrativeResult> => {
    const draft = await template.generate(input);
    return {
      jenis,
      versi: input.versi,
      teks: draft.teks,
      sumber: "template",
      modelLabel: template.modelLabel,
      dibuatPada,
      alasanFallback: alasan,
    };
  };

  try {
    const draft = await denganTimeout(llm.generate(input), timeoutMs);
    if (validatePlannerNarrative(draft.teks, input, jenis).length > 0) {
      return fallback("validasi");
    }

    return {
      jenis,
      versi: input.versi,
      teks: draft.teks,
      sumber: "llm",
      modelLabel: llm.modelLabel,
      dibuatPada,
    };
  } catch (galat) {
    return fallback(alasanKegagalan(galat));
  }
}
