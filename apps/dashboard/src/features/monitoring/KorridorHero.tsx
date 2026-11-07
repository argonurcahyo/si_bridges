import { Route } from "lucide-react";
import { KorridorIllustration } from "@/components/illustrations/KorridorIllustration";
import { teks } from "@/i18n/id";

export function KorridorHero() {
  return (
    <section className="border-border/60 via-card relative overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-500/15 to-violet-500/15 p-6 shadow-sm">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-3">
          <p className="bg-background/70 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-300">
            <Route className="size-3.5" aria-hidden="true" />
            {teks.hero.rute}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{teks.hero.judul}</h1>
          <p className="text-muted-foreground max-w-xl text-sm">{teks.hero.deskripsi}</p>
        </div>
        <KorridorIllustration className="h-auto w-full max-w-md justify-self-end drop-shadow-xl" />
      </div>
    </section>
  );
}
