import {
  generatePlannerNarrative,
  type GeneratePlannerNarrativeOptions,
  type PlannerNarrativeContext,
  type PlannerNarrativeResult,
} from "./plannerNarrative";

export type HasilInterpretasi = PlannerNarrativeResult;

export function generateInterpretasiSkenario(
  context: PlannerNarrativeContext,
  opsi: GeneratePlannerNarrativeOptions = {},
): Promise<HasilInterpretasi> {
  return generatePlannerNarrative("interpretasi", context, opsi);
}
