import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Panel } from "@/components/shared/Panel";
import { NodeTable } from "@/features/monitoring/NodeTable";
import { teks } from "@/i18n/id";
import { loadNetwork } from "@/services/networkService";

export function OpsDashboardPage() {
  const network = useMemo(() => loadNetwork(), []);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
      <Panel title={teks.panel.simulasi} className="order-2 lg:order-none">
        <EmptyState message={teks.panel.segeraTersedia} />
      </Panel>

      <div className="order-1 grid min-w-0 gap-4 lg:order-none">
        <Panel title={teks.panel.jaringan} description={teks.panel.jaringanDeskripsi}>
          <NodeTable nodes={network.nodes} />
        </Panel>
        <Panel title={teks.panel.grafik}>
          <EmptyState message={teks.panel.segeraTersedia} />
        </Panel>
      </div>

      <Panel title={teks.panel.rekomendasi} className="order-3 lg:order-none">
        <EmptyState message={teks.panel.segeraTersedia} />
      </Panel>
    </div>
  );
}
