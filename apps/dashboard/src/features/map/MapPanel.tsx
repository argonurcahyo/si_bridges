import type { FeatureCollection, LineString, Point } from "geojson";
import { Layers } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { IconChip } from "@/components/shared/IconChip";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { teks } from "@/i18n/id";
import type { EdgeProperties, NodeProperties } from "@/services/geoService";
import { layerAwal, type MapLayers } from "./mapLayers";

const MapView = lazy(() => import("./MapView"));

type MapPanelProps = {
  nodes: FeatureCollection<Point, NodeProperties>;
  edges: FeatureCollection<LineString, EdgeProperties>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  theme: "dark" | "light";
};

function PetaGagal() {
  return (
    <div
      role="alert"
      className="text-muted-foreground flex h-[420px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm"
    >
      {teks.peta.gagal}
    </div>
  );
}

function PetaMemuat() {
  return (
    <div
      aria-busy="true"
      className="bg-muted/40 text-muted-foreground flex h-[420px] items-center justify-center rounded-xl text-sm"
    >
      {teks.peta.memuat}
    </div>
  );
}

export function MapPanel({ nodes, edges, selectedId, onSelect, theme }: MapPanelProps) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [layers, setLayers] = useState<MapLayers>(layerAwal);
  const [gagal, setGagal] = useState(false);

  const aktifkanLayer = (kunci: keyof MapLayers) => (aktif: boolean) =>
    setLayers((sebelumnya) => ({ ...sebelumnya, [kunci]: aktif }));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={mode}
          onValueChange={(nilai) => {
            if (nilai === "2d" || nilai === "3d") setMode(nilai);
          }}
          aria-label="Mode peta"
        >
          <ToggleGroupItem value="2d">{teks.peta.mode2d}</ToggleGroupItem>
          <ToggleGroupItem value="3d">{teks.peta.mode3d}</ToggleGroupItem>
        </ToggleGroup>
        {mode === "3d" ? (
          <p className="text-muted-foreground text-xs">{teks.peta.mode3dCatatan}</p>
        ) : null}
      </div>

      {gagal ? (
        <PetaGagal />
      ) : (
        <ErrorBoundary fallback={<PetaGagal />}>
          <Suspense fallback={<PetaMemuat />}>
            <MapView
              nodes={nodes}
              edges={edges}
              selectedId={selectedId}
              onSelectNode={onSelect}
              onError={() => setGagal(true)}
              mode3d={mode === "3d"}
              layers={layers}
              theme={theme}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <div className="bg-muted/30 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconChip icon={Layers} tone="cyan" className="size-7 rounded-lg" />
          {teks.peta.layer}
        </div>
        {(
          [
            ["sungai", teks.peta.layerSungai],
            ["node", teks.peta.layerNode],
            ["kecamatan", teks.peta.layerKecamatan],
          ] as const
        ).map(([kunci, label]) => (
          <div key={kunci} className="flex items-center gap-2">
            <Switch
              id={`layer-${kunci}`}
              checked={layers[kunci]}
              onCheckedChange={aktifkanLayer(kunci)}
            />
            <Label htmlFor={`layer-${kunci}`} className="text-sm">
              {label}
            </Label>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span>{teks.peta.legenda}</span>
        {(
          [
            ["aman", "bg-risk-aman"],
            ["waspada", "bg-risk-waspada"],
            ["siaga", "bg-risk-siaga"],
          ] as const
        ).map(([level, warna]) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${warna}`} aria-hidden="true" />
            {teks.level[level]}
          </span>
        ))}
      </div>
    </section>
  );
}
