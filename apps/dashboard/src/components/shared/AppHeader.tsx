import { Droplets, LayoutDashboard, SlidersHorizontal, Smartphone } from "lucide-react";
import { NavLink } from "react-router";
import { StatusSheet } from "@/features/status/StatusSheet";
import { teks } from "@/i18n/id";
import { cn } from "@/lib/utils";
import { ClockWib } from "./ClockWib";
import { ModeBanner } from "./ModeBanner";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/ops", label: teks.nav.operator, icon: LayoutDashboard },
  { to: "/rencana", label: teks.nav.perencana, icon: SlidersHorizontal },
  { to: "/warga", label: teks.nav.warga, icon: Smartphone },
] as const;

export function AppHeader() {
  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 text-white shadow-md shadow-sky-500/30">
            <Droplets className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold tracking-tight">{teks.appName}</p>
            <p className="text-muted-foreground truncate text-xs">{teks.dashboardTitle}</p>
          </div>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="bg-muted/60 flex shrink-0 items-center gap-1 rounded-full border p-1"
        >
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm tabular-nums">
          <span className="bg-card/70 hidden rounded-full border px-3 py-1 text-xs font-medium md:inline">
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
