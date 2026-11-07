import { Droplets } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import { BATAS_INTENSITAS } from "@/services/simulationService";

type RainfallSliderProps = {
  value: number;
  onChange: (nilai: number) => void;
};

export function RainfallSlider({ value, onChange }: RainfallSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-muted-foreground text-xs font-medium">{teks.simulasi.intensitas}</p>
          <p className="flex items-baseline gap-1.5">
            <Droplets className="size-5 self-center text-sky-500" aria-hidden="true" />
            <span className="text-3xl font-semibold tabular-nums">{formatAngka(value, 0)}</span>
            <span className="text-muted-foreground text-sm">{teks.simulasi.mmJam}</span>
          </p>
        </div>
        {value >= BATAS_INTENSITAS.max ? (
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-500">
            {teks.simulasi.batasMaks}
          </span>
        ) : null}
      </div>

      <Slider
        value={[value]}
        min={BATAS_INTENSITAS.min}
        max={BATAS_INTENSITAS.max}
        step={1}
        onValueChange={([nilai]) => {
          if (typeof nilai === "number") onChange(nilai);
        }}
        aria-label={teks.simulasi.intensitas}
        aria-valuetext={`${value} milimeter per jam`}
      />

      <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
      </div>
    </div>
  );
}
