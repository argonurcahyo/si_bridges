import { bahasaAktif, gantiBahasa, teks } from "@/i18n/teks";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  return (
    <div
      role="group"
      aria-label={teks.bahasa.label}
      className={cn("bg-muted/60 flex items-center rounded-full border p-0.5", className)}
    >
      {(["id", "en"] as const).map((bahasa) => {
        const aktif = bahasaAktif === bahasa;
        return (
          <button
            key={bahasa}
            type="button"
            aria-pressed={aktif}
            onClick={() => {
              if (!aktif) gantiBahasa(bahasa);
            }}
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors",
              aktif
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {teks.bahasa[bahasa]}
          </button>
        );
      })}
    </div>
  );
}
