import { Gauge, Info, Loader2, TrendingUp } from "lucide-react";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SimulationResult } from "@/services/simulationService";
import { useSimulationStore } from "@/store/simulationStore";
import { LandUseControl } from "./LandUseControl";
import { RainfallSlider } from "./RainfallSlider";
import { ScenarioButtons } from "./ScenarioButtons";

type SimulationPanelProps = {
  hasil: SimulationResult | undefined;
  baseline: SimulationResult | undefined;
  menunggu: boolean;
};

export function SimulationPanel({ hasil, baseline, menunggu }: SimulationPanelProps) {
  const intensitasMmJam = useSimulationStore((state) => state.intensitasMmJam);
  const konversiLahanPersen = useSimulationStore((state) => state.konversiLahanPersen);
  const setIntensitas = useSimulationStore((state) => state.setIntensitas);
  const setKonversi = useSimulationStore((state) => state.setKonversi);
  const terapkan = useSimulationStore((state) => state.terapkan);

  const delta =
    hasil && baseline && baseline.totalDebitM3s > 0
      ? ((hasil.totalDebitM3s - baseline.totalDebitM3s) / baseline.totalDebitM3s) * 100
      : 0;

  return (
    <div className="space-y-5">
      <RainfallSlider value={intensitasMmJam} onChange={setIntensitas} />

      <LandUseControl value={konversiLahanPersen} onChange={setKonversi} />

      <ScenarioButtons
        intensitasMmJam={intensitasMmJam}
        konversiLahanPersen={konversiLahanPersen}
        onTerapkan={terapkan}
      />

      <div className="space-y-2 rounded-xl border bg-gradient-to-br from-sky-500/10 to-transparent p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Gauge className="size-3.5" aria-hidden="true" />
          {teks.simulasi.totalDebit}
        </p>
        <p className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">
            {hasil ? formatAngka(hasil.totalDebitM3s, 0) : "—"}
          </span>
          <span className="text-muted-foreground text-xs">m³/s</span>
          {hasil && Math.abs(delta) >= 0.5 ? (
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                delta > 0 ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500",
              )}
            >
              <TrendingUp className="size-3.5" aria-hidden="true" />
              {delta > 0 ? "+" : ""}
              {formatAngka(delta, 0)}%
            </span>
          ) : null}
        </p>
        {hasil ? <ConfidenceBadge value={hasil.keyakinan} /> : null}
        <p className="text-muted-foreground flex items-start gap-1.5 pt-1 text-xs">
          {menunggu ? (
            <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          )}
          {menunggu ? teks.simulasi.menunggu : teks.simulasi.batasCatatan}
        </p>
      </div>
    </div>
  );
}
