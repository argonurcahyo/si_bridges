import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { OpsiSkenario, PlannerResult } from "@/engine/planner";
import { teks } from "@/i18n/id";
import { cn } from "@/lib/utils";
import { formatAngka } from "@/lib/format";

const config = {
  luasGenanganHa: { label: teks.planner.luas, color: "var(--color-chart-1)" },
} satisfies ChartConfig;

function delta(nilai: number, dasar: number) {
  if (dasar <= 0) return 0;
  return Math.round(((nilai - dasar) / dasar) * 100);
}

function Metrik({
  label,
  nilai,
  satuan,
  selisih,
  catatan,
}: {
  label: string;
  nilai: string;
  satuan?: string;
  selisih?: number;
  catatan?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-3">
      <p className="text-muted-foreground text-[11px] font-medium">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tabular-nums">{nilai}</span>
        {satuan ? <span className="text-muted-foreground text-xs">{satuan}</span> : null}
      </p>
      {selisih !== undefined ? (
        <p
          className={cn(
            "mt-0.5 text-[11px] font-medium tabular-nums",
            selisih < 0
              ? "text-emerald-600 dark:text-emerald-400"
              : selisih > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-muted-foreground",
          )}
        >
          {selisih > 0 ? "+" : ""}
          {selisih}% vs dasar
        </p>
      ) : null}
      {catatan ? <p className="text-muted-foreground mt-0.5 text-[11px]">{catatan}</p> : null}
    </div>
  );
}

export function ImpactPanel({
  hasil,
  dasar,
  opsi,
  memuat,
}: {
  hasil?: PlannerResult;
  dasar?: PlannerResult;
  opsi: OpsiSkenario[];
  memuat: boolean;
}) {
  if (memuat || !hasil || !dasar) {
    return <p className="text-muted-foreground text-sm">{teks.planner.memuat}</p>;
  }

  const ringkasan = hasil.ringkasan;
  const total = hasil.perKelurahan.length;
  const persen = (nilai: number) => Math.round((nilai / Math.max(1, total)) * 100);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            ringkasan.level === "siaga"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              : ringkasan.level === "waspada"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          )}
        >
          {teks.planner.levelKoridor}: {teks.level[ringkasan.level]}
        </span>
        <span className="text-muted-foreground text-xs">
          {teks.planner.jumlah
            .replace("{siaga}", String(ringkasan.jumlahSiaga))
            .replace("{waspada}", String(ringkasan.jumlahWaspada))
            .replace("{total}", String(hasil.perKelurahan.length))}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metrik
          label={teks.planner.luas}
          nilai={formatAngka(ringkasan.luasGenanganHa, 0)}
          satuan={teks.planner.ha}
          selisih={delta(ringkasan.luasGenanganHa, dasar.ringkasan.luasGenanganHa)}
        />
        <Metrik
          label={teks.planner.rw}
          nilai={formatAngka(ringkasan.rwTerdampak, 0)}
          satuan="RW"
          selisih={delta(ringkasan.rwTerdampak, dasar.ringkasan.rwTerdampak)}
        />
        <Metrik
          label={teks.planner.puncak}
          nilai={formatAngka(ringkasan.puncakJam, 1)}
          satuan={teks.planner.jam}
          catatan="sejak hujan mulai"
        />
        <Metrik
          label={teks.planner.keyakinan}
          nilai={`${ringkasan.keyakinan}%`}
          catatan="model mock"
        />
      </div>

      <div className="space-y-2 pt-1">
        <p className="text-muted-foreground text-xs font-medium">{teks.planner.opsi}</p>
        <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
          <BarChart data={opsi} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="nama" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="luasGenanganHa" radius={[4, 4, 0, 0]}>
              {opsi.map((item) => (
                <Cell
                  key={item.nama}
                  fill={item.aktif ? "var(--color-chart-1)" : "var(--color-chart-3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="space-y-2 border-t pt-3">
        <p className="text-muted-foreground text-xs font-medium">{teks.planner.sebaran}</p>
        <div className="bg-muted flex h-2.5 overflow-hidden rounded-full" aria-hidden="true">
          <span className="bg-rose-500" style={{ width: `${persen(ringkasan.jumlahSiaga)}%` }} />
          <span className="bg-amber-400" style={{ width: `${persen(ringkasan.jumlahWaspada)}%` }} />
          <span className="flex-1 bg-emerald-500" />
        </div>
        <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
          <span>Siaga {ringkasan.jumlahSiaga}</span>
          <span>Waspada {ringkasan.jumlahWaspada}</span>
          <span>Aman {ringkasan.jumlahAman}</span>
        </div>
      </div>

      <p className="text-muted-foreground mt-auto border-t pt-3 text-[11px] leading-relaxed">
        {teks.planner.catatan}
      </p>
    </div>
  );
}
