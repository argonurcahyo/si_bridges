import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import type { HydroNetwork } from "@/schemas/hydro";
import type { SimulationResult } from "@/services/simulationService";

type DischargeChartProps = {
  network: HydroNetwork;
  hasil: SimulationResult | undefined;
  baseline: SimulationResult | undefined;
};

const config = {
  baseline: { label: teks.grafik.baseline, color: "var(--color-chart-3)" },
  skenario: { label: teks.grafik.skenario, color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function DischargeChart({ network, hasil, baseline }: DischargeChartProps) {
  const nama = new Map(network.nodes.map((node) => [node.id, node.nama]));

  const data = (hasil?.perNode ?? []).map((node) => {
    const base = baseline?.perNode.find((item) => item.nodeId === node.nodeId);
    return {
      nama: nama.get(node.nodeId) ?? node.nodeId,
      baseline: Math.round(base?.debitKumulatifM3s ?? 0),
      skenario: Math.round(node.debitKumulatifM3s),
      level: node.level,
    };
  });

  const ringkasan = data
    .map((item) => `${item.nama}: ${formatAngka(item.skenario, 0)} meter kubik per detik`)
    .join("; ");

  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">{teks.grafik.kosong}</p>;
  }

  return (
    <div className="space-y-2">
      <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="nama"
            tickLine={false}
            axisLine={false}
            interval={0}
            height={54}
            tick={{ fontSize: 10 }}
            angle={-18}
            textAnchor="end"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 10 }}
            label={{ value: teks.grafik.sumbuY, angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="skenario" fill="var(--color-skenario)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <p className="sr-only">
        {teks.grafik.ringkasanDebit}: {ringkasan}
      </p>
    </div>
  );
}
