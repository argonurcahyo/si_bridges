import { create } from "zustand";
import { PLANNER_BASELINE, type PlannerInput } from "@/engine/planner";

type PlannerStore = PlannerInput & {
  setHujan: (nilai: number) => void;
  setPasang: (nilai: number) => void;
  setRth: (nilai: number) => void;
  setMoratorium: (aktif: boolean) => void;
  reset: () => void;
};

export const usePlannerStore = create<PlannerStore>((set) => ({
  ...PLANNER_BASELINE,
  setHujan: (hujan24JamMm) => set({ hujan24JamMm }),
  setPasang: (pasangMeter) => set({ pasangMeter }),
  setRth: (rthPersen) => set({ rthPersen }),
  setMoratorium: (moratorium) => set({ moratorium }),
  reset: () => set(PLANNER_BASELINE),
}));
