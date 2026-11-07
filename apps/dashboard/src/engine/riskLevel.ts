export type RiskLevel = "aman" | "waspada" | "siaga";

export type RiskThresholds = {
  ambangWaspadaMeter: number;
  ambangSiagaMeter: number;
};

export function riskLevel(tmaMeter: number, thresholds: RiskThresholds): RiskLevel {
  if (tmaMeter >= thresholds.ambangSiagaMeter) return "siaga";
  if (tmaMeter >= thresholds.ambangWaspadaMeter) return "waspada";
  return "aman";
}
