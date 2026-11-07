import { create } from "zustand";
import { BASELINE } from "@/services/simulationService";

type SimulationStore = {
  intensitasMmJam: number;
  konversiLahanPersen: number;
  setIntensitas: (nilai: number) => void;
  setKonversi: (nilai: number) => void;
  terapkan: (input: { intensitasMmJam: number; konversiLahanPersen: number }) => void;
  reset: () => void;
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  intensitasMmJam: BASELINE.intensitasMmJam,
  konversiLahanPersen: BASELINE.konversiLahanPersen,
  setIntensitas: (nilai) => set({ intensitasMmJam: nilai }),
  setKonversi: (nilai) => set({ konversiLahanPersen: nilai }),
  terapkan: (input) => set(input),
  reset: () => set(BASELINE),
}));
