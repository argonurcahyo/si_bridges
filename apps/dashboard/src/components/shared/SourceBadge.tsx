import { Sparkles, Wrench } from "lucide-react";
import type { NarrativeSource } from "@/services/llm/types";
import { cn } from "@/lib/utils";

export function SourceBadge({
  sumber,
  className,
}: {
  sumber: NarrativeSource;
  className?: string;
}) {
  if (sumber === "llm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-300",
          className,
        )}
      >
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI · Gemini (mock)
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 bg-slate-500/15 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300",
        className,
      )}
    >
      <Wrench className="size-3.5" aria-hidden="true" />
      Rule-based
    </span>
  );
}
