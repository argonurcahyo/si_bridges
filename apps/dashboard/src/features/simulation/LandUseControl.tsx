import { TreePine } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { teks } from "@/i18n/id";
import { BATAS_KONVERSI } from "@/services/simulationService";

type LandUseControlProps = {
  value: number;
  onChange: (nilai: number) => void;
};

export function LandUseControl({ value, onChange }: LandUseControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TreePine className="size-4 text-emerald-500" aria-hidden="true" />
        <Label className="text-muted-foreground text-xs font-medium">
          {teks.simulasi.konversiLahan}
        </Label>
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={String(value)}
        onValueChange={(nilai) => {
          if (nilai) onChange(Number(nilai));
        }}
        className="w-full"
        aria-label={teks.simulasi.konversiLahan}
      >
        {BATAS_KONVERSI.map((persen) => (
          <ToggleGroupItem key={persen} value={String(persen)} className="flex-1 tabular-nums">
            {persen}%
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <p className="text-muted-foreground text-xs">{teks.simulasi.konversiBantuan}</p>
    </div>
  );
}
