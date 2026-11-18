import { useCallback, useState } from "react";
import { generateExecutiveBrief, type HasilBrief } from "@/services/llm/tasks/executiveBrief";
import type { PlannerNarrativeContext } from "@/services/llm/tasks/plannerNarrative";

export function useExecutiveBrief(context: PlannerNarrativeContext | null) {
  const [hasil, setHasil] = useState<HasilBrief | null>(null);
  const [memuat, setMemuat] = useState(false);

  const usang = Boolean(hasil && context && hasil.versi !== context.versi);

  const generate = useCallback(async () => {
    if (!context || memuat) return;
    setMemuat(true);
    try {
      const baru = await generateExecutiveBrief(context);
      setHasil(baru);
    } finally {
      setMemuat(false);
    }
  }, [context, memuat]);

  return { hasil, memuat, usang, generate };
}
