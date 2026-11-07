import { formatAngka } from "@/lib/format";
import type { NarrativeDraft, NarrativeInput, NarrativeProvider } from "./types";

/**
 * Template aturan tetap. Dipakai saat LLM gagal, timeout, atau narasi tidak lolos validasi.
 * Hanya memakai angka yang berasal dari hasil simulasi dan rencana saran.
 */
export const ruleBasedProvider: NarrativeProvider = {
  nama: "rule-based",
  modelLabel: "Aturan standar v1",
  generate({ saran }: NarrativeInput): Promise<NarrativeDraft> {
    const debit = formatAngka(saran.debitM3s, 0);

    if (saran.level === "aman") {
      return Promise.resolve({
        teks: `Pantau ${saran.namaNode} setiap ${saran.menit} menit. Debit simulasi ${debit} m³/s masih di bawah ambang; belum perlu pembukaan pintu air.`,
      });
    }

    if (saran.level === "waspada") {
      return Promise.resolve({
        teks: `Siapkan pembukaan ${saran.namaNode} sebesar ${saran.persenBukaan}% dalam ${saran.menit} menit. Debit simulasi ${debit} m³/s mendekati ambang siaga; pantau TMA tiap 15 menit.`,
      });
    }

    return Promise.resolve({
      teks: `Buka ${saran.namaNode} sebesar ${saran.persenBukaan}% dalam ${saran.menit} menit untuk mencegah limpasan di ${saran.hilirNama}. Debit simulasi ${debit} m³/s sudah melewati ambang siaga.`,
    });
  },
};
