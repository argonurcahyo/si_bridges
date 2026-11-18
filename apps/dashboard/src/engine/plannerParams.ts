import type { PlannerInput } from "@/engine/planner";

export type PlannerNumericId = {
  [K in keyof PlannerInput]: PlannerInput[K] extends number ? K : never;
}[keyof PlannerInput];

export type PlannerBooleanId = {
  [K in keyof PlannerInput]: PlannerInput[K] extends boolean ? K : never;
}[keyof PlannerInput];

export type PlannerParameterId = PlannerNumericId | PlannerBooleanId;
export type PlannerParameterIcon = "hujan" | "pasang" | "rth" | "kebijakan";

type DasarParameter = {
  icon: PlannerParameterIcon;
};

export type PlannerNumberParameter = DasarParameter & {
  id: PlannerNumericId;
  kind: "number";
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  fractionDigits: number;
  prefix?: string;
  ticks: number[];
  tickSuffix?: string;
};

export type PlannerBooleanParameter = DasarParameter & {
  id: PlannerBooleanId;
  kind: "boolean";
  defaultValue: boolean;
};

export type PlannerParameter = PlannerNumberParameter | PlannerBooleanParameter;

export const BATAS_PLANNER = {
  hujan: { min: 0, max: 300, step: 10 },
  pasang: { min: 0, max: 1.2, step: 0.1 },
  rth: { min: 0, max: 30, step: 5 },
} as const;

export const PLANNER_BASELINE: PlannerInput = {
  hujan24JamMm: 180,
  pasangMeter: 0.4,
  rthPersen: 15,
  moratorium: true,
};

export const PLANNER_PARAMETERS: readonly PlannerParameter[] = [
  {
    id: "hujan24JamMm",
    kind: "number",
    unit: "mm",
    icon: "hujan",
    min: BATAS_PLANNER.hujan.min,
    max: BATAS_PLANNER.hujan.max,
    step: BATAS_PLANNER.hujan.step,
    defaultValue: PLANNER_BASELINE.hujan24JamMm,
    fractionDigits: 0,
    ticks: [0, 150, 300],
  },
  {
    id: "pasangMeter",
    kind: "number",
    unit: "m",
    icon: "pasang",
    min: BATAS_PLANNER.pasang.min,
    max: BATAS_PLANNER.pasang.max,
    step: BATAS_PLANNER.pasang.step,
    defaultValue: PLANNER_BASELINE.pasangMeter,
    fractionDigits: 1,
    prefix: "+",
    ticks: [0, 0.6, 1.2],
  },
  {
    id: "rthPersen",
    kind: "number",
    unit: "%",
    icon: "rth",
    min: BATAS_PLANNER.rth.min,
    max: BATAS_PLANNER.rth.max,
    step: BATAS_PLANNER.rth.step,
    defaultValue: PLANNER_BASELINE.rthPersen,
    fractionDigits: 0,
    prefix: "+",
    ticks: [0, 15, 30],
    tickSuffix: "%",
  },
  {
    id: "moratorium",
    kind: "boolean",
    icon: "kebijakan",
    defaultValue: PLANNER_BASELINE.moratorium,
  },
];

export function parameterPlanner(id: PlannerParameterId): PlannerParameter | undefined {
  return PLANNER_PARAMETERS.find((parameter) => parameter.id === id);
}
