import { Droplets } from "lucide-react";
import { StatusSheet } from "@/features/status/StatusSheet";
import { teks } from "@/i18n/id";
import { ClockWib } from "./ClockWib";
import { ModeBanner } from "./ModeBanner";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 text-white shadow-md shadow-sky-500/30">
            <Droplets className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">{teks.appName}</p>
            <p className="text-muted-foreground text-xs">{teks.dashboardTitle}</p>
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums">
          <span className="bg-card/70 rounded-full border px-3 py-1 text-xs font-medium">
            <ClockWib />
          </span>
          <StatusSheet />
          <ThemeToggle />
        </div>
      </div>
      <ModeBanner />
    </header>
  );
}
