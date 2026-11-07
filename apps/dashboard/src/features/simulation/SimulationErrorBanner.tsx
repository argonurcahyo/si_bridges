import { AlertTriangle } from "lucide-react";
import { teks } from "@/i18n/id";

export function SimulationErrorBanner({ waktu }: { waktu?: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300"
    >
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {teks.simulasi.gagal} {waktu ? `(${waktu} WIB)` : null}
    </p>
  );
}
