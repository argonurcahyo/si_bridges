import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "sky" | "cyan" | "violet" | "emerald" | "amber" | "rose";

const toneClass: Record<Tone, string> = {
  sky: "bg-sky-500/15 text-sky-500 ring-sky-500/25",
  cyan: "bg-cyan-500/15 text-cyan-500 ring-cyan-500/25",
  violet: "bg-violet-500/15 text-violet-500 ring-violet-500/25",
  emerald: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-500 ring-amber-500/25",
  rose: "bg-rose-500/15 text-rose-500 ring-rose-500/25",
};

export function IconChip({
  icon: Icon,
  tone,
  className,
}: {
  icon: LucideIcon;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
        toneClass[tone],
        className,
      )}
    >
      <Icon className="size-4.5" aria-hidden="true" />
    </span>
  );
}
