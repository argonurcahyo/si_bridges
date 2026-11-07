import { Activity, Map as MapIcon, Sparkles, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Panel } from "@/components/shared/Panel";
import { DischargeChart } from "@/features/charts/DischargeChart";
import { ProjectionChart } from "@/features/charts/ProjectionChart";
import { MapPanel } from "@/features/map/MapPanel";
import { KorridorHero } from "@/features/monitoring/KorridorHero";
import { LevelSummary } from "@/features/monitoring/LevelSummary";
import { NodeDetailSheet } from "@/features/monitoring/NodeDetailSheet";
import { NodeTable } from "@/features/monitoring/NodeTable";
import { SimulationPanel } from "@/features/simulation/SimulationPanel";
import { riskLevel, type RiskLevel } from "@/engine/riskLevel";
import { useSimulation } from "@/hooks/useSimulation";
import { useTheme } from "@/hooks/useTheme";
import { teks } from "@/i18n/id";
import { edgesToFeatureCollection, nodesToFeatureCollection } from "@/services/geoService";
import type { HydroNetwork } from "@/schemas/hydro";

function hitungLevelTma(network: HydroNetwork): Record<RiskLevel, number> {
  const hitung: Record<RiskLevel, number> = { aman: 0, waspada: 0, siaga: 0 };
  for (const node of network.nodes) {
    hitung[
      riskLevel(node.tmaMeter, {
        ambangWaspadaMeter: node.ambangWaspadaMeter,
        ambangSiagaMeter: node.ambangSiagaMeter,
      })
    ] += 1;
  }
  return hitung;
}

export function OpsDashboardPage() {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { network, hasil, baseline, menunggu } = useSimulation();

  const nodes = useMemo(() => nodesToFeatureCollection(network, hasil), [network, hasil]);
  const edges = useMemo(() => edgesToFeatureCollection(network), [network]);
  const hitung = useMemo(() => hitungLevelTma(network), [network]);

  const selectedNode = network.nodes.find((node) => node.id === selectedId) ?? null;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <KorridorHero />
      <LevelSummary total={network.nodes.length} hitung={hitung} />

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        <Panel
          title={teks.panel.simulasi}
          description={teks.panel.simulasiDeskripsi}
          icon={SlidersHorizontal}
          tone="violet"
          className="order-2 xl:order-none"
        >
          <SimulationPanel hasil={hasil} baseline={baseline} menunggu={menunggu} />
        </Panel>

        <div className="order-1 grid min-w-0 gap-6 xl:order-none">
          <Panel
            title={teks.panel.jaringan}
            description={teks.panel.jaringanDeskripsi}
            icon={MapIcon}
            tone="sky"
          >
            <MapPanel
              nodes={nodes}
              edges={edges}
              selectedId={selectedId}
              onSelect={setSelectedId}
              theme={theme}
            />
          </Panel>

          <Panel
            title={teks.panel.grafik}
            description={teks.panel.grafikDeskripsi}
            icon={Activity}
            tone="emerald"
          >
            <div className="grid gap-6 2xl:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">{teks.grafik.debitJudul}</p>
                <p className="text-muted-foreground text-xs">{teks.grafik.debitDeskripsi}</p>
                <DischargeChart network={network} hasil={hasil} baseline={baseline} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{teks.grafik.proyeksiJudul}</p>
                <p className="text-muted-foreground text-xs">{teks.grafik.proyeksiDeskripsi}</p>
                <ProjectionChart hasil={hasil} />
              </div>
            </div>
          </Panel>

          <Panel
            title={teks.panel.tabelJudul}
            description={teks.panel.tabelDeskripsi}
            icon={MapIcon}
            tone="cyan"
          >
            <NodeTable nodes={network.nodes} selectedId={selectedId} onSelect={setSelectedId} />
          </Panel>
        </div>

        <Panel
          title={teks.panel.rekomendasi}
          description={teks.panel.rekomendasiDeskripsi}
          icon={Sparkles}
          tone="violet"
          className="order-3 xl:order-none"
        >
          <EmptyState message={teks.panel.segeraTersedia} />
        </Panel>
      </div>

      <NodeDetailSheet
        node={selectedNode}
        hasil={hasil}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
