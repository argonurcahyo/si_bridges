import { Outlet } from "react-router";
import { AppHeader } from "@/components/shared/AppHeader";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { teks } from "@/i18n/id";

export function OpsLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
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
      <footer className="border-t">
        <DisclaimerBanner />
      </footer>
    </div>
  );
}
