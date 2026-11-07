import { Outlet } from "react-router";
import { AppHeader } from "@/components/shared/AppHeader";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { teks } from "@/i18n/id";

export function OpsLayout() {
  return (
    <div className="bg-background text-foreground relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-24 size-[32rem] rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute top-1/3 -right-32 size-[30rem] rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/15" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <a
        href="#konten"
        className="focus:bg-card sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
      >
        {teks.lewatiKeKonten}
      </a>
      <AppHeader />
      <main id="konten" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-border/60 border-t">
        <DisclaimerBanner />
      </footer>
    </div>
  );
}
