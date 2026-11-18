import { beforeEach, describe, expect, it } from "vitest";
import { PLANNER_BASELINE } from "@/engine/planner";
import { usePlannerStore } from "@/store/plannerStore";

describe("plannerStore", () => {
  beforeEach(() => {
    usePlannerStore.getState().reset();
  });

  it("mengubah parameter numerik lewat setter generik", () => {
    usePlannerStore.getState().setParameter("hujan24JamMm", 250);
    usePlannerStore.getState().setParameter("rthPersen", 25);

    const state = usePlannerStore.getState();
    expect(state.hujan24JamMm).toBe(250);
    expect(state.rthPersen).toBe(25);
    expect(state.pasangMeter).toBe(PLANNER_BASELINE.pasangMeter);
  });

  it("mengubah parameter boolean lewat setter generik", () => {
    usePlannerStore.getState().setParameter("moratorium", false);

    expect(usePlannerStore.getState().moratorium).toBe(false);
  });

  it("menerapkan beberapa nilai sekaligus", () => {
    usePlannerStore.getState().terapkan({ hujan24JamMm: 240, rthPersen: 0 });

    const state = usePlannerStore.getState();
    expect(state.hujan24JamMm).toBe(240);
    expect(state.rthPersen).toBe(0);
    expect(state.moratorium).toBe(PLANNER_BASELINE.moratorium);
  });

  it("reset mengembalikan baseline", () => {
    usePlannerStore.getState().setParameter("hujan24JamMm", 250);
    usePlannerStore.getState().reset();

    const state = usePlannerStore.getState();
    expect(state.hujan24JamMm).toBe(PLANNER_BASELINE.hujan24JamMm);
    expect(state.pasangMeter).toBe(PLANNER_BASELINE.pasangMeter);
    expect(state.rthPersen).toBe(PLANNER_BASELINE.rthPersen);
    expect(state.moratorium).toBe(PLANNER_BASELINE.moratorium);
  });
});
