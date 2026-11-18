import { useQuery } from "@tanstack/react-query";
import { generateInterpretasiSkenario } from "@/services/llm/tasks/interpretasiSkenario";
import type { PlannerNarrativeContext } from "@/services/llm/tasks/plannerNarrative";

export function useInterpretasiSkenario(context: PlannerNarrativeContext | null) {
  return useQuery({
    queryKey: ["interpretasi-skenario", context?.versi ?? "kosong"],
    queryFn: () => generateInterpretasiSkenario(context!),
    enabled: context !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 0,
  });
}
