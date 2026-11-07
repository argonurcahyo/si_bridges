import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <div className="bg-card rounded-lg border px-6 py-4 text-center">
        <p className="text-muted-foreground text-sm">Mode Latihan</p>
        <h1 className="text-xl font-semibold">HydroGraph-AI · Dashboard Operasional</h1>
        <p className="text-muted-foreground mt-1 text-sm">Fase P0: fondasi proyek siap.</p>
      </div>
      <Button>Uji komponen shadcn</Button>
    </main>
  );
}
