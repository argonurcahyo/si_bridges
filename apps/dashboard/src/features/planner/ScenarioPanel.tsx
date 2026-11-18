import { CloudRain, Landmark, RotateCcw, Trees, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  PLANNER_PARAMETERS,
  type PlannerParameter,
  type PlannerParameterIcon,
} from "@/engine/plannerParams";
import { teks } from "@/i18n/teks";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/plannerStore";

const IKON: Record<PlannerParameterIcon, typeof CloudRain> = {
  hujan: CloudRain,
  pasang: Waves,
  rth: Trees,
  kebijakan: Landmark,
};

const WARNA: Record<PlannerParameterIcon, string> = {
  hujan: "text-sky-500",
  pasang: "text-cyan-500",
  rth: "text-emerald-500",
  kebijakan: "text-violet-500",
};

function Baris({
  ikon,
  label,
  nilai,
  satuan,
  children,
}: {
  ikon: React.ReactNode;
  label: string;
  nilai: string;
  satuan: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          {ikon}
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {nilai}
          <span className="text-muted-foreground ml-1 text-xs font-normal">{satuan}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function KontrolParameter({ parameter }: { parameter: PlannerParameter }) {
  const nilai = usePlannerStore((state) => state[parameter.id]);
  const setParameter = usePlannerStore((state) => state.setParameter);
  const label = teks.plannerParameter[parameter.id];
  const Icon = IKON[parameter.icon];

  const ikon = <Icon className={cn("size-4", WARNA[parameter.icon])} aria-hidden="true" />;

  if (parameter.kind === "boolean") {
    return (
      <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-xl border p-3">
        <div className="min-w-0">
          <Label htmlFor={parameter.id} className="flex items-center gap-2 text-sm">
            {ikon}
            {label.label}
          </Label>
          {"note" in label && label.note ? (
            <p className="text-muted-foreground mt-0.5 text-xs">{label.note}</p>
          ) : null}
        </div>
        <Switch
          id={parameter.id}
          checked={Boolean(nilai)}
          onCheckedChange={(aktif) => setParameter(parameter.id, aktif)}
          aria-label={label.label}
        />
      </div>
    );
  }

  const angka = Number(nilai);

  return (
    <Baris
      ikon={ikon}
      label={label.label}
      nilai={`${parameter.prefix ?? ""}${formatAngka(angka, parameter.fractionDigits)}`}
      satuan={parameter.unit}
    >
      <Slider
        value={[angka]}
        min={parameter.min}
        max={parameter.max}
        step={parameter.step}
        onValueChange={([baru]) => {
          if (typeof baru === "number") setParameter(parameter.id, baru);
        }}
        aria-label={label.label}
        aria-valuetext={`${formatAngka(angka, parameter.fractionDigits)} ${
          "ariaUnit" in label ? label.ariaUnit : ""
        }`}
      />
      <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
        {parameter.ticks.map((tick) => (
          <span key={tick}>
            {formatAngka(tick, parameter.fractionDigits)}
            {parameter.tickSuffix ?? ""}
          </span>
        ))}
      </div>
    </Baris>
  );
}

export function ScenarioPanel() {
  const terapkan = usePlannerStore((state) => state.terapkan);
  const reset = usePlannerStore((state) => state.reset);

  return (
    <div className="flex h-full flex-col gap-6">
      {PLANNER_PARAMETERS.map((parameter) => (
        <KontrolParameter key={parameter.id} parameter={parameter} />
      ))}

      <div className="space-y-2 border-t pt-4">
        <p className="text-muted-foreground text-xs font-medium">{teks.planner.preset}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              terapkan({
                hujan24JamMm: 240,
                pasangMeter: 0.5,
                rthPersen: 0,
                moratorium: false,
              })
            }
          >
            {teks.planner.presetEkstrem}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => terapkan({ rthPersen: 20, moratorium: true })}
          >
            {teks.planner.presetRth}
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {teks.planner.reset}
        </Button>
      </div>

      <div className="mt-auto space-y-3 border-t pt-3">
        <div>
          <p className="text-[11px] font-medium">{teks.planner.sumberParameter}</p>
          <ul className="text-muted-foreground mt-1 space-y-0.5 text-[11px]">
            {PLANNER_PARAMETERS.map((parameter) => (
              <li key={parameter.id}>
                {teks.plannerParameter[parameter.id].label}:{" "}
                {teks.plannerParameter[parameter.id].source}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-medium">{teks.planner.asumsi}</p>
          <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
            {teks.planner.catatan}
          </p>
        </div>
      </div>
    </div>
  );
}
