import { Check, Copy, Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/teks";
import { salinTeks } from "@/lib/copy";
import { formatWaktuWib } from "@/lib/format";
import type { PlannerNarrativeResult } from "@/services/llm/tasks/plannerNarrative";

type ExecutiveBriefProps = {
  hasil?: PlannerNarrativeResult;
  memuat: boolean;
  usang: boolean;
  onGenerate: () => void;
};

export function ExecutiveBrief({ hasil, memuat, usang, onGenerate }: ExecutiveBriefProps) {
  const [tersalin, setTersalin] = useState(false);

  const salin = async () => {
    if (!hasil) return;
    const berhasil = await salinTeks(hasil.teks);
    setTersalin(berhasil);
    if (berhasil) window.setTimeout(() => setTersalin(false), 2000);
  };

  const unduh = () => {
    if (!hasil) return;
    const blob = new Blob([hasil.teks], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = "executive-brief.md";
    tautan.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-300/70 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {teks.planner.brief}
        </p>
        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200">
          {teks.planner.briefStatus}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          onClick={onGenerate}
          disabled={memuat}
        >
          {memuat ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : hasil ? (
            <RefreshCw className="size-3.5" aria-hidden="true" />
          ) : (
            <Sparkles className="size-3.5" aria-hidden="true" />
          )}
          {hasil ? teks.planner.generateUlang : teks.planner.generateBrief}
        </Button>
      </div>

      {usang ? (
        <p className="mb-2 rounded-lg bg-amber-500/15 p-2 text-xs text-amber-800 dark:text-amber-200">
          {teks.planner.briefUsang}
        </p>
      ) : null}

      {kondisiKonten(hasil, memuat, tersalin, salin, unduh)}
    </div>
  );
}

function kondisiKonten(
  hasil: PlannerNarrativeResult | undefined,
  memuat: boolean,
  tersalin: boolean,
  salin: () => void,
  unduh: () => void,
) {
  if (memuat) {
    return (
      <div aria-busy="true" className="space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-amber-200/60 dark:bg-amber-500/20" />
        <div className="h-4 w-full animate-pulse rounded bg-amber-200/60 dark:bg-amber-500/20" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-amber-200/60 dark:bg-amber-500/20" />
        <p className="text-xs text-amber-800/70 dark:text-amber-200/60">{teks.planner.menyusun}</p>
      </div>
    );
  }

  if (!hasil) {
    return (
      <p className="text-sm text-amber-800/80 dark:text-amber-100/80">{teks.planner.briefKosong}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge
            sumber={hasil.sumber}
            label={hasil.sumber === "llm" ? `AI · ${hasil.modelLabel}` : "Template"}
          />
          <span className="text-[11px] text-amber-800/70 tabular-nums dark:text-amber-200/70">
            {teks.planner.dibuat} {formatWaktuWib(new Date(hasil.dibuatPada))}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={salin} className="gap-1.5">
            {tersalin ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {tersalin ? teks.planner.tersalin : teks.planner.salin}
          </Button>
          <Button variant="outline" size="sm" onClick={unduh} className="gap-1.5">
            <Download className="size-3.5" aria-hidden="true" />
            {teks.planner.unduh}
          </Button>
        </div>
      </div>

      {hasil.alasanFallback ? (
        <p className="rounded-lg bg-amber-500/15 p-2 text-xs text-amber-800 dark:text-amber-200">
          {teks.planner.alasan[hasil.alasanFallback]}
        </p>
      ) : null}

      <div className="text-sm leading-relaxed whitespace-pre-wrap text-amber-950/90 dark:text-amber-50/90">
        {hasil.teks}
      </div>

      <p className="text-[11px] text-amber-800/70 dark:text-amber-200/60">
        {teks.planner.briefCatatan}
      </p>
    </div>
  );
}
