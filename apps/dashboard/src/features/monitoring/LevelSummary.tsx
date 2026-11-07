import { OctagonAlert, Radio, ShieldCheck, TriangleAlert } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { teks } from "@/i18n/id";
import type { RiskLevel } from "@/engine/riskLevel";

type LevelSummaryProps = {
  total: number;
  hitung: Record<RiskLevel, number>;
};

export function LevelSummary({ total, hitung }: LevelSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard label={teks.kpi.total} value={total} icon={Radio} tone="sky" />
      <KpiCard label={teks.kpi.aman} value={hitung.aman} icon={ShieldCheck} tone="emerald" />
      <KpiCard label={teks.kpi.waspada} value={hitung.waspada} icon={TriangleAlert} tone="amber" />
      <KpiCard label={teks.kpi.siaga} value={hitung.siaga} icon={OctagonAlert} tone="rose" />
    </div>
  );
}
