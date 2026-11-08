import { CloudRain, RotateCcw, Trees, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BATAS_PLANNER } from "@/engine/planner";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import { usePlannerStore } from "@/store/plannerStore";

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

export function ScenarioPanel() {
  const hujan = usePlannerStore((state) => state.hujan24JamMm);
  const pasang = usePlannerStore((state) => state.pasangMeter);
  const rth = usePlannerStore((state) => state.rthPersen);
  const moratorium = usePlannerStore((state) => state.moratorium);
  const setHujan = usePlannerStore((state) => state.setHujan);
  const setPasang = usePlannerStore((state) => state.setPasang);
  const setRth = usePlannerStore((state) => state.setRth);
  const setMoratorium = usePlannerStore((state) => state.setMoratorium);
  const reset = usePlannerStore((state) => state.reset);

  return (
    <div className="flex h-full flex-col gap-6">
      <Baris
        ikon={<CloudRain className="size-4 text-sky-500" aria-hidden="true" />}
        label={teks.planner.hujan}
        nilai={formatAngka(hujan, 0)}
        satuan="mm"
      >
        <Slider
          value={[hujan]}
          min={BATAS_PLANNER.hujan.min}
          max={BATAS_PLANNER.hujan.max}
          step={BATAS_PLANNER.hujan.step}
          onValueChange={([nilai]) => {
            if (typeof nilai === "number") setHujan(nilai);
          }}
          aria-label={teks.planner.hujan}
          aria-valuetext={`${hujan} milimeter per 24 jam`}
        />
        <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
          <span>0</span>
          <span>150</span>
          <span>300</span>
        </div>
      </Baris>

      <Baris
        ikon={<Waves className="size-4 text-cyan-500" aria-hidden="true" />}
        label={teks.planner.pasang}
        nilai={`+${formatAngka(pasang, 1)}`}
        satuan="m"
      >
        <Slider
          value={[pasang]}
          min={BATAS_PLANNER.pasang.min}
          max={BATAS_PLANNER.pasang.max}
          step={BATAS_PLANNER.pasang.step}
          onValueChange={([nilai]) => {
            if (typeof nilai === "number") setPasang(nilai);
          }}
          aria-label={teks.planner.pasang}
          aria-valuetext={`${pasang} meter`}
        />
        <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
          <span>0</span>
          <span>0,6</span>
          <span>1,2</span>
        </div>
      </Baris>

      <Baris
        ikon={<Trees className="size-4 text-emerald-500" aria-hidden="true" />}
        label={teks.planner.rth}
        nilai={`+${formatAngka(rth, 0)}`}
        satuan="%"
      >
        <Slider
          value={[rth]}
          min={BATAS_PLANNER.rth.min}
          max={BATAS_PLANNER.rth.max}
          step={BATAS_PLANNER.rth.step}
          onValueChange={([nilai]) => {
            if (typeof nilai === "number") setRth(nilai);
          }}
          aria-label={teks.planner.rth}
          aria-valuetext={`${rth} persen`}
        />
        <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
          <span>0%</span>
          <span>15%</span>
          <span>30%</span>
        </div>
      </Baris>

      <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="min-w-0">
          <Label htmlFor="moratorium" className="text-sm">
            {teks.planner.moratorium}
          </Label>
          <p className="text-muted-foreground text-xs">{teks.planner.moratoriumCatatan}</p>
        </div>
        <Switch
          id="moratorium"
          checked={moratorium}
          onCheckedChange={setMoratorium}
          aria-label={teks.planner.moratorium}
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <p className="text-muted-foreground text-xs font-medium">{teks.planner.preset}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHujan(240);
              setPasang(0.5);
              setRth(0);
              setMoratorium(false);
            }}
          >
            {teks.planner.presetEkstrem}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRth(20);
              setMoratorium(true);
            }}
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
            <li>Hujan: BMKG / CHIRPS</li>
            <li>Pasang: BIG</li>
            <li>RTH: RDTR</li>
            <li>Moratorium: kebijakan Pemprov</li>
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
