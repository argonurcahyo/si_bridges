import type { LucideIcon } from "lucide-react";
import { WaveIllustration } from "@/components/illustrations/WaveIllustration";

type EmptyStateProps = {
  message: string;
  icon?: LucideIcon;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="border-border bg-muted/30 flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-center">
      <WaveIllustration className="h-20 w-32" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
