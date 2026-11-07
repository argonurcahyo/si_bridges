import { OctagonAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/engine/riskLevel";
import { teks } from "@/i18n/id";

const konfigurasi = {
  aman: { Icon: ShieldCheck, className: "border-risk-aman/50 text-risk-aman" },
  waspada: { Icon: TriangleAlert, className: "border-risk-waspada/50 text-risk-waspada" },
  siaga: { Icon: OctagonAlert, className: "border-risk-siaga/50 text-risk-siaga" },
} as const satisfies Record<RiskLevel, { Icon: typeof ShieldCheck; className: string }>;

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { Icon, className } = konfigurasi[level];

  return (
    <Badge variant="outline" className={className}>
      <Icon aria-hidden="true" />
      {teks.level[level]}
    </Badge>
  );
}
