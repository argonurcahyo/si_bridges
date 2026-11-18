import { create } from "zustand";
import { PLANNER_BASELINE, type PlannerInput } from "@/engine/planner";
import type { PlannerParameterId } from "@/engine/plannerParams";

type PlannerStore = PlannerInput & {
  setParameter: (id: PlannerParameterId, nilai: number | boolean) => void;
  terapkan: (nilai: Partial<PlannerInput>) => void;
  reset: () => void;
};

export const usePlannerStore = create<PlannerStore>((set) => ({
  ...PLANNER_BASELINE,
  setParameter: (id, nilai) => set({ [id]: nilai } as Partial<PlannerStore>),
  terapkan: (nilai) => set(nilai),
  reset: () => set(PLANNER_BASELINE),
}));
