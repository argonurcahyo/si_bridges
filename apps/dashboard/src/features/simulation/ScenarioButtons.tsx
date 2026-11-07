import { CloudRain, RotateCcw, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/id";
import { BASELINE } from "@/services/simulationService";

type Skenario = {
  id: string;
  label: string;
  intensitasMmJam: number;
  konversiLahanPersen: number;
  icon: typeof CloudRain;
};

export const SKENARIO_CEPAT: Skenario[] = [
  {
    id: "baseline",
    label: teks.simulasi.baseline,
    intensitasMmJam: BASELINE.intensitasMmJam,
    konversiLahanPersen: BASELINE.konversiLahanPersen,
    icon: RotateCcw,
  },
  {
    id: "hujan-plus-20",
    label: teks.simulasi.hujanPlus20,
    intensitasMmJam: BASELINE.intensitasMmJam + 20,
    konversiLahanPersen: BASELINE.konversiLahanPersen,
    icon: CloudRain,
  },
  {
    id: "konversi-20",
    label: teks.simulasi.konversi20,
    intensitasMmJam: BASELINE.intensitasMmJam,
    konversiLahanPersen: 20,
    icon: Trees,
  },
];

type ScenarioButtonsProps = {
  intensitasMmJam: number;
  konversiLahanPersen: number;
  onTerapkan: (input: { intensitasMmJam: number; konversiLahanPersen: number }) => void;
};

export function ScenarioButtons({
  intensitasMmJam,
  konversiLahanPersen,
  onTerapkan,
}: ScenarioButtonsProps) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium">{teks.simulasi.skenarioCepat}</p>
      <div className="grid gap-2">
        {SKENARIO_CEPAT.map((skenario) => {
          const aktif =
            skenario.intensitasMmJam === intensitasMmJam &&
            skenario.konversiLahanPersen === konversiLahanPersen;
          const Icon = skenario.icon;

          return (
            <Button
              key={skenario.id}
              variant={aktif ? "default" : "outline"}
              size="sm"
              aria-pressed={aktif}
              onClick={() =>
                onTerapkan({
                  intensitasMmJam: skenario.intensitasMmJam,
                  konversiLahanPersen: skenario.konversiLahanPersen,
                })
              }
              className="justify-start gap-2"
            >
              <Icon className="size-4" aria-hidden="true" />
              {skenario.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
