import { BarChart3, FileText, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { ImpactPanel } from "@/features/planner/ImpactPanel";
import { ExecutiveBrief } from "@/features/planner/ExecutiveBrief";
import { KelurahanDetail } from "@/features/planner/KelurahanDetail";
import { ScenarioPanel } from "@/features/planner/ScenarioPanel";
import { MapPanel } from "@/features/map/MapPanel";
import { NodeDetailSheet } from "@/features/monitoring/NodeDetailSheet";
import { usePlanner } from "@/hooks/usePlanner";
import { useSimulation } from "@/hooks/useSimulation";
import { useTheme } from "@/hooks/useTheme";
import { teks } from "@/i18n/id";
import { nodesToFeatureCollection } from "@/services/geoService";

export function PlannerPage() {
  const { theme } = useTheme();
  const { hasil, dasar, opsi, fitur, brief, memuat, galat } = usePlanner();
  const [kodeTerpilih, setKodeTerpilih] = useState<string | null>(null);
  const [idNode, setIdNode] = useState<string | null>(null);

  const { network, hasil: hasilOperator } = useSimulation();
  const nodes = useMemo(
    () => nodesToFeatureCollection(network, hasilOperator),
    [network, hasilOperator],
  );
  const terpilih = hasil?.perKelurahan.find((item) => item.kode === kodeTerpilih);
  const nodeTerpilih = network.nodes.find((node) => node.id === idNode) ?? null;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            {teks.appName} · {teks.nav.perencana}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">
            {teks.planner.judul}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm">{teks.planner.deskripsi}</p>
        </div>
        <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
          {teks.planner.badge}
        </span>
      </section>

      {galat ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {teks.planner.galat}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <Panel
          title={teks.planner.skenario}
          description={teks.planner.skenarioDeskripsi}
          icon={SlidersHorizontal}
          tone="violet"
          className="order-2 xl:order-none"
        >
          <ScenarioPanel />
        </Panel>

        <div className="order-1 grid min-w-0 gap-6 xl:order-none">
          <Panel
            title={teks.planner.peta}
            description={teks.planner.petaDeskripsi}
            icon={MapIcon}
            tone="sky"
          >
            <MapPanel
              nodes={nodes}
              selectedId={idNode}
              onSelect={setIdNode}
              theme={theme}
              kelurahan={fitur}
              onSelectKelurahan={setKodeTerpilih}
            />
          </Panel>

          {terpilih ? <KelurahanDetail item={terpilih} /> : null}
        </div>

        <Panel
          title={teks.planner.dampak}
          description={teks.planner.dampakDeskripsi}
          icon={BarChart3}
          tone="emerald"
          className="order-3 xl:order-none"
        >
          <ImpactPanel hasil={hasil} dasar={dasar} opsi={opsi} memuat={memuat} />
        </Panel>
      </div>

      <Panel
        title={teks.planner.brief}
        description="Ringkasan untuk analis kebijakan"
        icon={FileText}
        tone="amber"
      >
        <ExecutiveBrief brief={brief} />
      </Panel>

      <NodeDetailSheet
        node={nodeTerpilih}
        hasil={hasilOperator}
        onOpenChange={(open) => {
          if (!open) setIdNode(null);
        }}
      />
    </div>
  );
}
