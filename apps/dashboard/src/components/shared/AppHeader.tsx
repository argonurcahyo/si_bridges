import { Separator } from "@/components/ui/separator";
import { teks } from "@/i18n/id";
import { ClockWib } from "./ClockWib";
import { ModeBanner } from "./ModeBanner";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="bg-background/95 sticky top-0 z-40 backdrop-blur">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{teks.appName}</span>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-muted-foreground text-sm">{teks.dashboardTitle}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums">
          <ClockWib />
          <ThemeToggle />
        </div>
      </div>
      <ModeBanner />
    </header>
  );
}
