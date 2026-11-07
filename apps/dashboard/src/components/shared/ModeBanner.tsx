import { teks } from "@/i18n/id";

export function ModeBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-sm text-amber-700 dark:text-amber-300"
    >
      <span className="font-semibold tracking-wide">{teks.modeLatihan}</span>
      <span aria-hidden="true">·</span>
      <span>{teks.modeLatihanDeskripsi}</span>
    </div>
  );
}
