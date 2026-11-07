import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconChip, type Tone } from "./IconChip";

type KpiCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  className?: string;
};

const borderTone: Record<Tone, string> = {
  sky: "from-sky-500/20 border-sky-500/30",
  cyan: "from-cyan-500/20 border-cyan-500/30",
  violet: "from-violet-500/20 border-violet-500/30",
  emerald: "from-emerald-500/20 border-emerald-500/30",
  amber: "from-amber-500/20 border-amber-500/30",
  rose: "from-rose-500/20 border-rose-500/30",
};

export function KpiCard({ label, value, icon, tone, className }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-gradient-to-br to-transparent p-4 shadow-sm",
        borderTone[tone],
        className,
      )}
    >
      <IconChip icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}
