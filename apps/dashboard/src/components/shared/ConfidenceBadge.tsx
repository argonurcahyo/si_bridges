import { AlertTriangle, BadgeCheck } from "lucide-react";
import { teks } from "@/i18n/id";
import { AMBANG_KEYAKINAN_RENDAH } from "@/engine/confidence";
import { cn } from "@/lib/utils";

type ConfidenceBadgeProps = {
  value: number;
  className?: string;
};

export function ConfidenceBadge({ value, className }: ConfidenceBadgeProps) {
  const rendah = value < AMBANG_KEYAKINAN_RENDAH;

  if (rendah) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300",
          className,
        )}
      >
        <AlertTriangle className="size-3.5" aria-hidden="true" />
        {teks.simulasi.labelKonfirmasi} · {teks.simulasi.kepastian} {value}%
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300",
        className,
      )}
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {teks.simulasi.kepastian} {value}%
    </span>
  );
}
