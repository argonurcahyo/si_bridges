import { formatAngka } from "@/lib/format";
import type { NarrativeDraft, NarrativeInput, NarrativeProvider } from "./types";

export type MockLlmOptions = {
  /** Peluang gagal acak 0-1 untuk menguji fallback. */
  peluangGagal?: number;
  delayMinMs?: number;
  delayMaxMs?: number;
  acak?: () => number;
  /** Paksa gagal, dipakai toggle demo (FR-27). */
  paksaGagal?: () => boolean;
};

function pilihTemplate(input: NarrativeInput, varian: number): string {
  const { hasil, saran } = input;
  const debit = formatAngka(saran.debitM3s, 0);
  const keyakinan = hasil.keyakinan;

  if (input.bahasa === "en") {
    const siaga = [
      `Open ${saran.namaNode} by ${saran.persenBukaan}% within ${saran.menit} minutes to prevent flooding in ${saran.hilirNama}. Simulated discharge ${debit} m³/s, confidence ${keyakinan}%.`,
      `Tactical recommendation: lower the water level at ${saran.namaNode} by opening ${saran.persenBukaan}% within ${saran.menit} minutes. Discharge ${debit} m³/s is at alert level.`,
      `Because discharge at ${saran.namaNode} reached ${debit} m³/s, open the gate ${saran.persenBukaan}% within ${saran.menit} minutes and alert staff in ${saran.hilirNama}.`,
    ];
    const waspada = [
      `Prepare to open ${saran.namaNode} by ${saran.persenBukaan}% within ${saran.menit} minutes. Simulated discharge ${debit} m³/s is approaching the alert threshold.`,
      `Monitor ${saran.namaNode} and prepare a ${saran.persenBukaan}% opening within ${saran.menit} minutes. Discharge ${debit} m³/s is at watch level.`,
    ];
    const aman = [
      `No immediate action at ${saran.namaNode}. Simulated discharge ${debit} m³/s is below the threshold; continue monitoring every ${saran.menit} minutes.`,
    ];
    const daftar = saran.level === "siaga" ? siaga : saran.level === "waspada" ? waspada : aman;
    return daftar[varian % daftar.length]!;
  }

  const siaga = [
    `Buka ${saran.namaNode} sebesar ${saran.persenBukaan}% dalam ${saran.menit} menit untuk mencegah limpasan di ${saran.hilirNama}. Debit simulasi ${debit} m³/s, keyakinan ${keyakinan}%.`,
    `Rekomendasi taktis: turunkan muka air di ${saran.namaNode} dengan membuka ${saran.persenBukaan}% dalam ${saran.menit} menit. Debit ${debit} m³/s berada pada level siaga.`,
    `Karena debit ${saran.namaNode} mencapai ${debit} m³/s, buka pintu ${saran.persenBukaan}% dalam ${saran.menit} menit dan siagakan petugas di ${saran.hilirNama}.`,
  ];

  const waspada = [
    `Siapkan pembukaan ${saran.namaNode} ${saran.persenBukaan}% dalam ${saran.menit} menit. Debit simulasi ${debit} m³/s mendekati ambang siaga.`,
    `Pantau ${saran.namaNode} dan siapkan bukaan ${saran.persenBukaan}% dalam ${saran.menit} menit. Debit ${debit} m³/s pada level waspada.`,
  ];

  const aman = [
    `Tidak perlu tindakan segera di ${saran.namaNode}. Debit simulasi ${debit} m³/s masih di bawah ambang; lanjutkan pemantauan setiap ${saran.menit} menit.`,
  ];

  const daftar = saran.level === "siaga" ? siaga : saran.level === "waspada" ? waspada : aman;
  return daftar[varian % daftar.length]!;
}

/**
 * Provider LLM mock. Meniru perilaku layanan nyata: ada latensi dan sesekali gagal.
 * Teks tidak dikarang bebas; angka tetap berasal dari hasil simulasi.
 */
export function buatMockProvider(opsi: MockLlmOptions = {}): NarrativeProvider {
  const {
    peluangGagal = 0,
    delayMinMs = 450,
    delayMaxMs = 1400,
    acak = Math.random,
    paksaGagal = () => false,
  } = opsi;

  return {
    nama: "mock-llm",
    modelLabel: "Gemini (mock)",
    async generate(input: NarrativeInput): Promise<NarrativeDraft> {
      const delay = delayMinMs + acak() * Math.max(0, delayMaxMs - delayMinMs);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (paksaGagal() || acak() < peluangGagal) {
        throw new Error("Mock LLM gagal merespons");
      }

      const varian = Math.floor(acak() * 3);
      return { teks: pilihTemplate(input, varian) };
    },
  };
}

export const mockProvider = buatMockProvider();
