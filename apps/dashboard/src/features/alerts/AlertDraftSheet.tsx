import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { buildDrafts } from "@/services/draftService";
import type { Catchment } from "@/schemas/catchment";
import type { HydroNetwork } from "@/schemas/hydro";
import type { SimulationResult } from "@/services/simulationService";
import { teks } from "@/i18n/id";
import { salinTeks } from "@/lib/copy";

type AlertDraftSheetProps = {
  hasil: SimulationResult | undefined;
  network: HydroNetwork;
  catchments: Catchment[];
};

export function AlertDraftSheet({ hasil, network, catchments }: AlertDraftSheetProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [statusSalin, setStatusSalin] = useState<"idle" | "ok" | "gagal">("idle");

  const drafts = useMemo(
    () => (hasil ? buildDrafts(hasil, network, catchments) : []),
    [hasil, network, catchments],
  );

  const aktif = drafts.find((draft) => draft.nodeId === dipilih) ?? drafts[0];

  const salin = async () => {
    if (!aktif) return;
    const berhasil = await salinTeks(aktif.teks);
    setStatusSalin(berhasil ? "ok" : "gagal");
    window.setTimeout(() => setStatusSalin("idle"), 2000);
  };

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Megaphone className="size-4 text-amber-500" aria-hidden="true" />
          {teks.draf.tombol}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Megaphone className="size-4 text-amber-500" aria-hidden="true" />
            {teks.draf.judul}
          </div>
          <SheetTitle>{teks.draf.subjudul}</SheetTitle>
          <SheetDescription className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
            {teks.draf.catatan}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          {drafts.length === 0 || !aktif ? (
            <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
              {teks.draf.kosong}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="pilih-wilayah">{teks.draf.pilihWilayah}</Label>
                <Select value={aktif.nodeId} onValueChange={setDipilih}>
                  <SelectTrigger id="pilih-wilayah" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {drafts.map((draft) => (
                      <SelectItem key={draft.nodeId} value={draft.nodeId}>
                        {draft.wilayah} · {teks.level[draft.level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={aktif.level} />
                <ConfidenceBadge value={aktif.keyakinan} />
                <span className="text-muted-foreground text-xs">
                  {teks.draf.estimasi} ± {aktif.estimasiTibaMenit} menit
                </span>
              </div>

              <pre className="bg-muted/30 rounded-xl border p-3 font-sans text-sm whitespace-pre-wrap">
                {aktif.teks}
              </pre>

              <p className="text-muted-foreground text-xs">{teks.draf.tidakDikirim}</p>
            </>
          )}
        </div>

        <SheetFooter>
          <Button onClick={salin} disabled={!aktif} className="gap-2">
            {statusSalin === "ok" ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {statusSalin === "ok"
              ? teks.draf.tersalin
              : statusSalin === "gagal"
                ? teks.draf.gagalSalin
                : teks.draf.salin}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
