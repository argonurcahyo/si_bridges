import { Loader2 } from "lucide-react";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { teks } from "@/i18n/teks";
import { formatWaktuWib } from "@/lib/format";
import type { PlannerNarrativeResult } from "@/services/llm/tasks/plannerNarrative";

export function InterpretationPanel({
  hasil,
  memuat,
}: {
  hasil?: PlannerNarrativeResult;
  memuat: boolean;
}) {
  if (memuat || !hasil) {
    return (
      <div aria-busy={memuat} className="space-y-2">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
        <p className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
          {memuat ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              {teks.planner.menyusun}
            </>
          ) : (
            teks.planner.interpretasiKosong
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SourceBadge
          sumber={hasil.sumber}
          label={hasil.sumber === "llm" ? `AI · ${hasil.modelLabel}` : "Template"}
        />
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {teks.planner.dibuat} {formatWaktuWib(new Date(hasil.dibuatPada))}
        </span>
      </div>

      {hasil.alasanFallback ? (
        <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
          {teks.planner.alasan[hasil.alasanFallback]}
        </p>
      ) : null}

      <blockquote className="rounded-xl border-l-4 border-sky-500/60 bg-gradient-to-r from-sky-500/10 to-transparent p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {hasil.teks}
      </blockquote>
    </div>
  );
}
