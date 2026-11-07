import type { SimulationResult } from "@/services/simulationService";
import type { Saran } from "./saran";

export type NarrativeInput = {
  hasil: SimulationResult;
  saran: Saran;
};

export type NarrativeSource = "llm" | "rule_based";

export type NarrativeDraft = {
  teks: string;
};

export type NarrativeProvider = {
  nama: string;
  modelLabel: string;
  generate(input: NarrativeInput): Promise<NarrativeDraft>;
};

export type AlasanFallback = "timeout" | "error" | "validasi";

export type NarrativeResult = {
  id: string;
  teks: string;
  sumber: NarrativeSource;
  modelLabel: string;
  confidence: number;
  dibuatPada: string;
  ringkasanInput: string;
  alasanFallback?: AlasanFallback;
};

export function idRekomendasi(hasil: SimulationResult): string {
  return `REK-${hasil.intensitasMmJam}-${hasil.konversiLahanPersen}`;
}

export function ringkasanInput(hasil: SimulationResult): string {
  return `hujan ${hasil.intensitasMmJam} mm/jam · konversi Depok ${hasil.konversiLahanPersen}%`;
}
