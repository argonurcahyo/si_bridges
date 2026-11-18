import {
  generatePlannerNarrative,
  type GeneratePlannerNarrativeOptions,
  type PlannerNarrativeContext,
  type PlannerNarrativeResult,
} from "./plannerNarrative";

export type HasilBrief = PlannerNarrativeResult;

export function generateExecutiveBrief(
  context: PlannerNarrativeContext,
  opsi: GeneratePlannerNarrativeOptions = {},
): Promise<HasilBrief> {
  return generatePlannerNarrative("brief", context, opsi);
}
