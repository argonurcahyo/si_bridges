import { Check, CircleHelp, FlaskConical, ThermometerSun, X } from "lucide-react";
import { DataBadge } from "@/components/shared/DataBadge";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecommendation } from "@/hooks/useRecommendation";
import { teks } from "@/i18n/id";
import { formatWaktuWib } from "@/lib/format";
import type { HydroNetwork } from "@/schemas/hydro";
import type { Catchment } from "@/schemas/catchment";
import type { SimulationResult } from "@/services/simulationService";
import { useDemoStore, useOperatorStore, type PilihanOperator } from "@/store/operatorStore";
import { AlertDraftSheet } from "@/features/alerts/AlertDraftSheet";
import { AuditLogPanel } from "./AuditLogPanel";

type RecommendationPanelProps = {
  hasil: SimulationResult | undefined;
  network: HydroNetwork;
  catchments: Catchment[];
};

const PILIHAN: { nilai: PilihanOperator; label: string; icon: typeof Check }[] = [
  { nilai: "diterima", label: teks.rekomendasi.diterima, icon: Check },
  { nilai: "ditolak", label: teks.rekomendasi.ditolak, icon: X },
  { nilai: "perlu_verifikasi", label: teks.rekomendasi.verifikasi, icon: CircleHelp },
];

export function RecommendationPanel({ hasil, network, catchments }: RecommendationPanelProps) {
  const { narasi, memuat } = useRecommendation(hasil, network);
  const paksaGagal = useDemoStore((state) => state.paksaGagalLlm);
  const setPaksaGagal = useDemoStore((state) => state.setPaksaGagalLlm);
  const keputusan = useOperatorStore((state) => (narasi ? state.keputusan[narasi.id] : undefined));
  const catat = useOperatorStore((state) => state.catat);

  const alasanFallback = narasi?.alasanFallback
    ? teks.rekomendasi.alasan[narasi.alasanFallback]
    : null;

  return (
    <Tabs defaultValue="narasi" className="gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="narasi">{teks.rekomendasi.tabNarasi}</TabsTrigger>
        <TabsTrigger value="log">{teks.rekomendasi.tabLog}</TabsTrigger>
      </TabsList>

      <TabsContent value="narasi" className="space-y-4">
        {memuat || !narasi ? (
          <div aria-busy="true" className="space-y-2">
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
            <p className="text-muted-foreground pt-1 text-xs">{teks.rekomendasi.memuat}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge sumber={narasi.sumber} />
              <ConfidenceBadge value={narasi.confidence} />
              <DataBadge status="mock" />
            </div>

            <blockquote className="rounded-xl border-l-4 border-sky-500/60 bg-gradient-to-r from-sky-500/10 to-transparent p-3 text-sm leading-relaxed">
              {narasi.teks}
            </blockquote>

            {alasanFallback ? (
              <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                {alasanFallback}
              </p>
            ) : null}

            <dl className="text-muted-foreground grid gap-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt>{teks.rekomendasi.model}</dt>
                <dd className="text-right">{narasi.modelLabel}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{teks.rekomendasi.dibuat}</dt>
                <dd className="tabular-nums">{formatWaktuWib(new Date(narasi.dibuatPada))}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{teks.rekomendasi.id}</dt>
                <dd className="font-mono">{narasi.id}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{teks.rekomendasi.input}</dt>
                <dd className="text-right">{narasi.ringkasanInput}</dd>
              </div>
            </dl>

            <div className="space-y-2 rounded-xl border p-3">
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <ThermometerSun className="size-3.5" aria-hidden="true" />
                {teks.rekomendasi.keputusanOperator}
              </p>
              <div className="grid gap-2">
                {PILIHAN.map(({ nilai, label, icon: Icon }) => {
                  const aktif = keputusan === nilai;
                  return (
                    <Button
                      key={nilai}
                      size="sm"
                      variant={aktif ? "default" : "outline"}
                      aria-pressed={aktif}
                      className="justify-start gap-2"
                      onClick={() =>
                        catat({
                          rekomendasiId: narasi.id,
                          pilihan: nilai,
                          sumber: narasi.sumber,
                          ringkasan: narasi.ringkasanInput,
                        })
                      }
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </Button>
                  );
                })}
              </div>

              {keputusan ? (
                <p role="status" className="text-muted-foreground text-xs">
                  {teks.rekomendasi.tercatat} {teks.rekomendasi.tidakAdaAksi}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">{teks.rekomendasi.wajibKeputusan}</p>
              )}
            </div>
          </>
        )}

        <div className="flex items-start justify-between gap-3 rounded-xl border border-dashed p-3">
          <div className="space-y-1">
            <Label htmlFor="paksa-gagal" className="flex items-center gap-1.5 text-xs">
              <FlaskConical className="size-3.5 text-violet-500" aria-hidden="true" />
              {teks.rekomendasi.paksaGagal}
            </Label>
            <p className="text-muted-foreground text-xs">{teks.rekomendasi.paksaGagalCatatan}</p>
          </div>
          <Switch
            id="paksa-gagal"
            checked={paksaGagal}
            onCheckedChange={setPaksaGagal}
            aria-label={teks.rekomendasi.paksaGagal}
          />
        </div>

        <AlertDraftSheet hasil={hasil} network={network} catchments={catchments} />
      </TabsContent>

      <TabsContent value="log">
        <AuditLogPanel />
      </TabsContent>
    </Tabs>
  );
}
