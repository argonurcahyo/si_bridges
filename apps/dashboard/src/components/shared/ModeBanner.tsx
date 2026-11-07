import { FlaskConical } from "lucide-react";
import { teks } from "@/i18n/id";

export function ModeBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 px-4 py-1.5 text-sm text-amber-700 dark:text-amber-300"
    >
      <FlaskConical className="size-4" aria-hidden="true" />
      <span className="font-semibold tracking-wide">{teks.modeLatihan}</span>
      <span aria-hidden="true">·</span>
      <span>{teks.modeLatihanDeskripsi}</span>
    </div>
  );
}
