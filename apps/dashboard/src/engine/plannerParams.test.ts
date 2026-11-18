import { describe, expect, it } from "vitest";
import {
  BATAS_PLANNER,
  PLANNER_BASELINE,
  PLANNER_PARAMETERS,
  parameterPlanner,
  type PlannerNumberParameter,
} from "@/engine/plannerParams";
import { teks } from "@/i18n/teks";

describe("registry parameter simulator", () => {
  it("memiliki satu entri untuk setiap field PlannerInput", () => {
    const ids = PLANNER_PARAMETERS.map((parameter) => parameter.id).sort();
    const field = Object.keys(PLANNER_BASELINE).sort();

    expect(ids).toEqual(field);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nilai default registry sama dengan baseline", () => {
    for (const parameter of PLANNER_PARAMETERS) {
      expect(parameter.defaultValue).toBe(PLANNER_BASELINE[parameter.id]);
    }
  });

  it("batas slider sama dengan BATAS_PLANNER", () => {
    const hujan = parameterPlanner("hujan24JamMm") as PlannerNumberParameter;
    const pasang = parameterPlanner("pasangMeter") as PlannerNumberParameter;
    const rth = parameterPlanner("rthPersen") as PlannerNumberParameter;

    expect({ min: hujan.min, max: hujan.max, step: hujan.step }).toEqual(BATAS_PLANNER.hujan);
    expect({ min: pasang.min, max: pasang.max, step: pasang.step }).toEqual(BATAS_PLANNER.pasang);
    expect({ min: rth.min, max: rth.max, step: rth.step }).toEqual(BATAS_PLANNER.rth);
  });

  it("parameter numerik memiliki batas dan tick yang valid", () => {
    for (const parameter of PLANNER_PARAMETERS) {
      if (parameter.kind !== "number") continue;

      expect(parameter.min).toBeLessThan(parameter.max);
      expect(parameter.step).toBeGreaterThan(0);
      expect(parameter.defaultValue).toBeGreaterThanOrEqual(parameter.min);
      expect(parameter.defaultValue).toBeLessThanOrEqual(parameter.max);
      expect(parameter.ticks.length).toBeGreaterThanOrEqual(2);
      expect(parameter.ticks[0]).toBe(parameter.min);
      expect(parameter.ticks[parameter.ticks.length - 1]).toBe(parameter.max);
    }
  });

  it("parameter boolean memiliki catatan kebijakan", () => {
    const moratorium = parameterPlanner("moratorium");

    expect(moratorium?.kind).toBe("boolean");
    expect(teks.plannerParameter.moratorium.note).toContain("2027");
  });

  it("mengembalikan undefined untuk id yang tidak ada", () => {
    expect(parameterPlanner("tidakAda" as never)).toBeUndefined();
  });
});
