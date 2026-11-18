import type { Bahasa } from "@/i18n/teks";
import type { LevelPeringatan, Peringatan } from "@/schemas/peringatan";
import { susunTeksPeringatan } from "@/services/alertService";
import { alasanKegagalan, denganTimeout } from "../pipeline";
import type { AlasanFallback } from "../types";
import { ekstrakAngka } from "../validateNarrative";

export const TIMEOUT_PERINGATAN_MS = 5000;

const LABEL: Record<Bahasa, Record<LevelPeringatan, string>> = {
  id: { siaga: "SIAGA", waspada: "WASPADA" },
  en: { siaga: "ALERT", waspada: "WATCH" },
};
const KATA_AKSI = [
  "naik",
  "siapkan",
  "hindari",
  "ikuti",
  "pantau",
  "amankan",
  "menuju",
  "move",
  "prepare",
  "avoid",
  "follow",
  "monitor",
  "secure",
  "evacuate",
  "go to",
];
const KATA_TERLARANG = [
  "pasti",
  "dijamin",
  "kiamat",
  "tsunami",
  "panik",
  "tewas",
  "meninggal",
  "tidak ada harapan",
  "debit",
  "m3/s",
  "m³/s",
  "tma",
  "c-value",
  "dag",
  "guaranteed",
  "certainly",
  "definitely",
  "doom",
  "panic",
  "dead",
  "no hope",
];

export type PeringatanContext = {
  wilayahNama: string;
  level: LevelPeringatan;
  estimasiTibaMenit: number;
  puncakJam: number;
  keyakinan: number;
  debitKumulatifM3s: number;
  dibuatPada: string;
  bahasa: Bahasa;
};

export type PeringatanDraft = { teks: string };

export type PeringatanProvider = {
  nama: string;
  modelLabel: string;
  generate(input: PeringatanContext): Promise<PeringatanDraft>;
};

export type HasilPeringatan = {
  teks: string;
  sumber: "llm" | "template";
  modelLabel: string;
  dibuatPada: string;
  alasanFallback?: AlasanFallback;
};

export type MockPeringatanOptions = {
  peluangGagal?: number;
  delayMinMs?: number;
  delayMaxMs?: number;
  acak?: () => number;
  paksaGagal?: () => boolean;
};

export type GeneratePeringatanOptions = MockPeringatanOptions & {
  provider?: PeringatanProvider;
  sekarang?: Date;
  timeoutMs?: number;
};

export function konteksPeringatan(item: Peringatan, bahasa: Bahasa = "en"): PeringatanContext {
  return {
    wilayahNama: item.wilayahNama,
    level: item.level,
    estimasiTibaMenit: item.estimasiTibaMenit ?? 60,
    puncakJam: item.puncakJam,
    keyakinan: item.keyakinan,
    debitKumulatifM3s: item.debitKumulatifM3s,
    dibuatPada: item.dibuatPada,
    bahasa,
  };
}

function angkaRingkas(nilai: number, bahasa: Bahasa): string {
  return new Intl.NumberFormat(bahasa === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 1,
  }).format(nilai);
}

function menitEn(nilai: number): string {
  return nilai === 1 ? "minute" : "minutes";
}

function jamEn(nilai: number): string {
  return nilai === 1 ? "hour" : "hours";
}

function teksMock(input: PeringatanContext, varian: number): string {
  const label = LABEL[input.bahasa][input.level];
  const puncak = angkaRingkas(input.puncakJam, input.bahasa);
  const waktu = input.estimasiTibaMenit;

  if (input.bahasa === "en") {
    const daftar =
      input.level === "siaga"
        ? [
            `${label} — Kelurahan ${input.wilayahNama}. Water is expected to arrive in about ${waktu} ${menitEn(waktu)}. Peak around ${puncak} ${jamEn(input.puncakJam)}. Move to an upper floor or the nearest safe location. Follow official information from BPBD DKI Jakarta.`,
            `${label} — Kelurahan ${input.wilayahNama}. Water may arrive in ${waktu} ${menitEn(waktu)}. Peak around ${puncak} ${jamEn(input.puncakJam)}. Prepare to evacuate to an upper floor and follow officer instructions.`,
            `${label} — Kelurahan ${input.wilayahNama}. Estimated arrival ${waktu} ${menitEn(waktu)}; peak ${puncak} ${jamEn(input.puncakJam)}. Secure documents, move to higher ground, and monitor official BPBD DKI Jakarta information.`,
          ]
        : [
            `${label} — Kelurahan ${input.wilayahNama}. Water is expected to arrive in about ${waktu} ${menitEn(waktu)}. Prepare important documents, secure belongings, and avoid riverbank areas. Follow official information from BPBD DKI Jakarta.`,
            `${label} — Kelurahan ${input.wilayahNama}. Peak around ${puncak} ${jamEn(input.puncakJam)}. Prepare a go-bag and monitor officer guidance in your area.`,
            `${label} — Kelurahan ${input.wilayahNama}. Estimated arrival ${waktu} ${menitEn(waktu)}. Secure valuables and avoid activities along the riverbank.`,
          ];
    return daftar[varian % daftar.length]!;
  }

  if (input.level === "siaga") {
    const daftar = [
      `${label} — Kelurahan ${input.wilayahNama}. Air diperkirakan tiba sekitar ${waktu} menit lagi. Puncak sekitar ${puncak} jam. Segera naik ke lantai dua atau lokasi aman terdekat. Ikuti informasi resmi BPBD DKI Jakarta.`,
      `${label} — Kelurahan ${input.wilayahNama}. Dalam ${waktu} menit, air dapat tiba. Puncak sekitar ${puncak} jam. Siapkan evakuasi ke lantai dua dan ikuti arahan petugas.`,
      `${label} — Kelurahan ${input.wilayahNama}. Estimasi tiba ${waktu} menit; puncak ${puncak} jam. Amankan dokumen, naik ke tempat lebih tinggi, dan pantau informasi resmi BPBD DKI Jakarta.`,
    ];
    return daftar[varian % daftar.length]!;
  }

  const daftar = [
    `${label} — Kelurahan ${input.wilayahNama}. Air diperkirakan tiba sekitar ${waktu} menit lagi. Siapkan dokumen penting, amankan barang, dan hindari bantaran sungai. Ikuti informasi resmi BPBD DKI Jakarta.`,
    `${label} — Kelurahan ${input.wilayahNama}. Puncak sekitar ${puncak} jam. Siapkan tas siaga dan pantau arahan petugas di sekitar wilayah.`,
    `${label} — Kelurahan ${input.wilayahNama}. Estimasi tiba ${waktu} menit. Amankan barang berharga dan hindari aktivitas di bantaran sungai.`,
  ];
  return daftar[varian % daftar.length]!;
}

export function buatMockPeringatanProvider(opsi: MockPeringatanOptions = {}): PeringatanProvider {
  const {
    peluangGagal = 0,
    delayMinMs = 450,
    delayMaxMs = 1400,
    acak = Math.random,
    paksaGagal = () => false,
  } = opsi;

  return {
    nama: "mock-peringatan",
    modelLabel: "OpenAI (mock)",
    async generate(input: PeringatanContext): Promise<PeringatanDraft> {
      const delay = delayMinMs + acak() * Math.max(0, delayMaxMs - delayMinMs);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (paksaGagal() || acak() < peluangGagal) {
        throw new Error("Mock LLM peringatan gagal merespons");
      }

      return { teks: teksMock(input, Math.floor(acak() * 3)) };
    },
  };
}

export const templatePeringatanProvider: PeringatanProvider = {
  nama: "template-peringatan",
  modelLabel: "Template HydroTwin",
  generate(input: PeringatanContext): Promise<PeringatanDraft> {
    return Promise.resolve({
      teks: susunTeksPeringatan(
        input.level,
        input.wilayahNama,
        input.estimasiTibaMenit,
        input.puncakJam,
        input.bahasa,
      ),
    });
  },
};

export function angkaDiizinkanPeringatan(input: PeringatanContext): Set<number> {
  const izin = new Set<number>();
  const tambah = (nilai: number) => izin.add(Number(nilai.toFixed(2)));

  tambah(input.estimasiTibaMenit);
  tambah(input.puncakJam);
  tambah(input.keyakinan);

  return izin;
}

/** FR-R5 + FR-R6: angka harus dari konteks, bahasa harus tenang dan berisi arahan. */
export function validatePeringatan(teks: string, input: PeringatanContext): string[] {
  const masalah: string[] = [];
  const lower = teks.toLowerCase();
  const label = LABEL[input.bahasa][input.level];

  if (!teks.toUpperCase().includes(label)) {
    masalah.push("level risiko tidak disebut");
  }

  if (!teks.includes(input.wilayahNama)) {
    masalah.push("nama wilayah tidak disebut");
  }

  if (!KATA_AKSI.some((kata) => lower.includes(kata))) {
    masalah.push("arahan tindakan tidak ditemukan");
  }

  if (KATA_TERLARANG.some((kata) => lower.includes(kata))) {
    masalah.push("bahasa tidak sesuai untuk pesan publik");
  }

  if (teks.length > 600) {
    masalah.push("pesan terlalu panjang");
  }

  const izin = angkaDiizinkanPeringatan(input);
  const menyimpang = ekstrakAngka(teks).filter(
    (angka) => ![...izin].some((nilai) => Math.abs(nilai - angka) < 0.5),
  );

  if (menyimpang.length > 0) {
    masalah.push(`angka menyimpang: ${menyimpang.join(", ")}`);
  }

  return masalah;
}

/**
 * Strategi F2: coba LLM, validasi angka + tone, lalu fallback template.
 * Fungsi ini tidak melempar error ke pemanggil; selalu mengembalikan pesan.
 */
export async function generatePeringatanPublik(
  input: PeringatanContext,
  opsi: GeneratePeringatanOptions = {},
): Promise<HasilPeringatan> {
  const {
    sekarang = new Date(),
    timeoutMs = TIMEOUT_PERINGATAN_MS,
    provider,
    ...mockOptions
  } = opsi;
  const llm = provider ?? buatMockPeringatanProvider(mockOptions);
  const dibuatPada = sekarang.toISOString();

  const fallback = async (alasan: AlasanFallback): Promise<HasilPeringatan> => {
    const draft = await templatePeringatanProvider.generate(input);
    return {
      teks: draft.teks,
      sumber: "template",
      modelLabel: templatePeringatanProvider.modelLabel,
      dibuatPada,
      alasanFallback: alasan,
    };
  };

  try {
    const draft = await denganTimeout(llm.generate(input), timeoutMs);
    if (validatePeringatan(draft.teks, input).length > 0) {
      return fallback("validasi");
    }

    return {
      teks: draft.teks,
      sumber: "llm",
      modelLabel: llm.modelLabel,
      dibuatPada,
    };
  } catch (galat) {
    return fallback(alasanKegagalan(galat));
  }
}
