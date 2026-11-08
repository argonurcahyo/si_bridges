import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import { Layers } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { IconChip } from "@/components/shared/IconChip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { KelurahanPropertiesPeta } from "@/engine/planner";
import { teks } from "@/i18n/id";
import type { NodeProperties } from "@/services/geoService";
import { layerAwal, type MapLayers } from "./mapLayers";
import type { MapViewMode } from "./MapView";

const MapView = lazy(() => import("./MapView"));

type MapPanelProps = {
  nodes: FeatureCollection<Point, NodeProperties>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  theme: "dark" | "light";
  kelurahan?: FeatureCollection<Polygon | MultiPolygon, KelurahanPropertiesPeta>;
  onSelectKelurahan?: (kode: string) => void;
};

function PetaGagal({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="text-muted-foreground flex h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center text-sm"
    >
      {teks.peta.gagal}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {teks.peta.muatUlang}
        </Button>
      ) : null}
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

export function MapPanel({
  nodes,
  selectedId,
  onSelect,
  theme,
  kelurahan,
  onSelectKelurahan,
}: MapPanelProps) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [skala, setSkala] = useState(6);
  const [tampilan, setTampilan] = useState<MapViewMode>("ciliwung");
  const [layers, setLayers] = useState<MapLayers>(layerAwal);
  const [gagal, setGagal] = useState(false);
  const [kunciPeta, setKunciPeta] = useState(0);

  const cobaUlang = () => {
    setGagal(false);
    setKunciPeta((kunci) => kunci + 1);
  };

  const aktifkanLayer = (kunci: keyof MapLayers) => (aktif: boolean) =>
    setLayers((sebelumnya) => ({ ...sebelumnya, [kunci]: aktif }));

  const daftarLayer: Array<[keyof MapLayers, string]> = [
    ["sungai", teks.peta.layerSungai],
    ["alur", teks.peta.layerAlur],
    ["node", teks.peta.layerNode],
    ["kecamatan", teks.peta.layerKecamatan],
    ["batas", teks.peta.layerBatas],
    ["masker", teks.peta.layerMasker],
  ];
  if (kelurahan) daftarLayer.splice(4, 0, ["kedalaman", teks.peta.layerKedalaman]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">{teks.peta.tampilan}</span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={tampilan}
            onValueChange={(nilai) => {
              if (nilai === "ciliwung" || nilai === "pesanggrahan" || nilai === "jabodetabek") {
                setTampilan(nilai);
              }
            }}
            aria-label={teks.peta.tampilan}
          >
            <ToggleGroupItem value="ciliwung">{teks.peta.tampilanCiliwung}</ToggleGroupItem>
            <ToggleGroupItem value="pesanggrahan">{teks.peta.tampilanPesanggrahan}</ToggleGroupItem>
            <ToggleGroupItem value="jabodetabek">{teks.peta.tampilanJabodetabek}</ToggleGroupItem>
          </ToggleGroup>
        </div>

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
      </div>

      {mode === "3d" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-muted-foreground text-xs">
            {teks.peta.mode3dCatatan.replace("{skala}", String(skala))}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{teks.peta.skalaVertikal}</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(skala)}
              onValueChange={(nilai) => {
                if (nilai) setSkala(Number(nilai));
              }}
              aria-label={teks.peta.skalaVertikal}
            >
              {[2, 4, 6, 8].map((nilai) => (
                <ToggleGroupItem key={nilai} value={String(nilai)}>
                  {nilai}×
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      ) : null}
      {tampilan === "jabodetabek" ? (
        <p className="text-muted-foreground text-xs">{teks.peta.catatanOverview}</p>
      ) : null}
      {tampilan === "pesanggrahan" ? (
        <p className="text-muted-foreground text-xs">{teks.peta.catatanPesanggrahan}</p>
      ) : null}

      {gagal ? (
        <PetaGagal onRetry={cobaUlang} />
      ) : (
        <ErrorBoundary key={kunciPeta} fallback={<PetaGagal onRetry={cobaUlang} />}>
          <Suspense fallback={<PetaMemuat />}>
            <MapView
              nodes={nodes}
              selectedId={selectedId}
              onSelectNode={onSelect}
              onError={() => setGagal(true)}
              mode3d={mode === "3d"}
              layers={layers}
              theme={theme}
              view={tampilan}
              exaggeration={skala}
              kelurahan={kelurahan}
              onSelectKelurahan={onSelectKelurahan}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <div className="bg-muted/30 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconChip icon={Layers} tone="cyan" className="size-7 rounded-lg" />
          {teks.peta.layer}
        </div>
        {daftarLayer.map(([kunci, label]) => (
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
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 border-t-2 border-dashed border-violet-400"
            aria-hidden="true"
          />
          Batas provinsi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-slate-300" aria-hidden="true" />
          Batas kabupaten/kota
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-full bg-cyan-400" aria-hidden="true" />
          Sungai Ciliwung
        </span>
      </div>

      {kelurahan ? (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span>{teks.peta.legendaKedalaman}</span>
          <span>0</span>
          <span
            className="h-2.5 w-40 rounded-full bg-gradient-to-r from-sky-100 via-yellow-300 to-red-600"
            aria-hidden="true"
          />
          <span>&gt;1,5 m</span>
          <span className="text-muted-foreground/80">{teks.peta.catatanKedalaman}</span>
        </div>
      ) : null}
    </section>
  );
}
