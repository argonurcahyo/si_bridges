import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import type { SimulationResult } from "@/services/simulationService";

type ProjectionChartProps = {
  hasil: SimulationResult | undefined;
};

const config = {
  volume: { label: teks.grafik.volume, color: "var(--color-chart-2)" },
} satisfies ChartConfig;

type BarisProyeksi = {
  label: string;
  dasar: number;
  selisih: number;
  volume: number;
  batasBawah: number;
  batasAtas: number;
};

function TooltipProyeksi({ active, payload }: TooltipContentProps) {
  const baris = payload?.[0]?.payload as BarisProyeksi | undefined;
  if (!active || !baris) return null;

  return (
    <div className="bg-popover rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{baris.label}</p>
      <p className="text-foreground tabular-nums">
        {teks.grafik.volume}: {formatAngka(baris.volume, 2)} juta m³
      </p>
      <p className="text-muted-foreground tabular-nums">
        {teks.grafik.pitaKeyakinan}: {formatAngka(baris.batasBawah, 2)} –{" "}
        {formatAngka(baris.batasAtas, 2)}
      </p>
    </div>
  );
}

export function ProjectionChart({ hasil }: ProjectionChartProps) {
  const data: BarisProyeksi[] = (hasil?.proyeksi ?? []).map((titik) => ({
    label: teks.grafik.jamKe.replace("{jam}", String(titik.jam)),
    dasar: titik.batasBawahJutaM3,
    selisih: Number((titik.batasAtasJutaM3 - titik.batasBawahJutaM3).toFixed(3)),
    volume: titik.volumeJutaM3,
    batasBawah: titik.batasBawahJutaM3,
    batasAtas: titik.batasAtasJutaM3,
  }));

  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">{teks.grafik.kosong}</p>;
  }

  const akhir = data[data.length - 1];

  return (
    <div className="space-y-2">
      <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 10 }}
            label={{
              value: teks.grafik.sumbuVolume,
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
            }}
          />
          <Tooltip content={(props) => <TooltipProyeksi {...props} />} />
          <Area
            dataKey="dasar"
            stackId="pita"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            dataKey="selisih"
            stackId="pita"
            stroke="none"
            fill="var(--color-chart-2)"
            fillOpacity={0.2}
            isAnimationActive={false}
          />
          <Line
            dataKey="volume"
            type="monotone"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ChartContainer>
      <p className="text-muted-foreground text-xs">
        {teks.grafik.ringkasanProyeksi.replace("{nilai}", formatAngka(akhir?.volume ?? 0, 2))}
      </p>
    </div>
  );
}
