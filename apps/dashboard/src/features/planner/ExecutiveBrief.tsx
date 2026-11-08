import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/id";

export function ExecutiveBrief({ brief }: { brief: string }) {
  const [tersalin, setTersalin] = useState(false);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setTersalin(true);
      window.setTimeout(() => setTersalin(false), 2000);
    } catch {
      setTersalin(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-amber-300/70 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {teks.planner.brief}
        </p>
        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200">
          {teks.planner.briefStatus}
        </span>
        <Button variant="outline" size="sm" className="ml-auto" onClick={salin}>
          {tersalin ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {tersalin ? teks.planner.tersalin : teks.planner.salin}
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-amber-950/90 dark:text-amber-50/90">{brief}</p>
      <p className="mt-2 text-[11px] text-amber-800/70 dark:text-amber-200/60">
        {teks.planner.briefCatatan}
      </p>
    </div>
  );
}
