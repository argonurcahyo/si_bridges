import { formatAngka } from "@/lib/format";
import type { NarrativeDraft, NarrativeInput, NarrativeProvider } from "./types";

/**
 * Template aturan tetap. Dipakai saat LLM gagal, timeout, atau narasi tidak lolos validasi.
 * Hanya memakai angka yang berasal dari hasil simulasi dan rencana saran.
 */
export const ruleBasedProvider: NarrativeProvider = {
  nama: "rule-based",
  modelLabel: "Aturan standar v1",
  generate({ saran, bahasa }: NarrativeInput): Promise<NarrativeDraft> {
    const debit = formatAngka(saran.debitM3s, 0);

    if (bahasa === "en") {
      if (saran.level === "aman") {
        return Promise.resolve({
          teks: `Monitor ${saran.namaNode} every ${saran.menit} minutes. Simulated discharge ${debit} m³/s is below the threshold; no gate opening is needed yet.`,
        });
      }

      if (saran.level === "waspada") {
        return Promise.resolve({
          teks: `Prepare to open ${saran.namaNode} by ${saran.persenBukaan}% within ${saran.menit} minutes. Simulated discharge ${debit} m³/s is approaching the alert threshold; monitor the water level every 15 minutes.`,
        });
      }

      return Promise.resolve({
        teks: `Open ${saran.namaNode} by ${saran.persenBukaan}% within ${saran.menit} minutes to prevent flooding in ${saran.hilirNama}. Simulated discharge ${debit} m³/s has crossed the alert threshold.`,
      });
    }

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
