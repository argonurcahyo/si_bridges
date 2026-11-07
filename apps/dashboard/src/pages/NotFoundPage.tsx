import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/id";

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">{teks.halamanTidakDitemukan}</h1>
      <Button asChild>
        <Link to="/ops">{teks.kembaliKeDashboard}</Link>
      </Button>
    </main>
  );
}
