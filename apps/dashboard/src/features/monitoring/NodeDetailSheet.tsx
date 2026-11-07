import { Droplets, MapPin, Waves } from "lucide-react";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { DataBadge } from "@/components/shared/DataBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { riskLevel } from "@/engine/riskLevel";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import type { HydroNode } from "@/schemas/hydro";
import type { NodeHasil, SimulationResult } from "@/services/simulationService";

type NodeDetailSheetProps = {
  node: HydroNode | null;
  hasil: SimulationResult | undefined;
  onOpenChange: (open: boolean) => void;
};

export function NodeDetailSheet({ node, hasil, onOpenChange }: NodeDetailSheetProps) {
  const debit: NodeHasil | undefined = node
    ? hasil?.perNode.find((item) => item.nodeId === node.id)
    : undefined;

  return (
    <Sheet open={node !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {node ? (
          <>
            <SheetHeader>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-sky-500" aria-hidden="true" />
                {teks.detail.judul}
              </div>
              <SheetTitle className="text-xl">{node.nama}</SheetTitle>
              <SheetDescription>{teks.tipeNode[node.tipe]}</SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4">
              <div className="flex items-center justify-between rounded-2xl border bg-gradient-to-br from-sky-500/15 to-transparent p-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">{teks.detail.tma}</p>
                  <p className="flex items-center gap-2 text-3xl font-semibold tabular-nums">
                    <Droplets className="size-6 text-sky-500" aria-hidden="true" />
                    {formatAngka(node.tmaMeter)} m
                  </p>
                </div>
                <RiskBadge
                  level={riskLevel(node.tmaMeter, {
                    ambangWaspadaMeter: node.ambangWaspadaMeter,
                    ambangSiagaMeter: node.ambangSiagaMeter,
                  })}
                />
              </div>

              {debit ? (
                <div className="space-y-3 rounded-2xl border bg-gradient-to-br from-cyan-500/10 to-transparent p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Waves className="size-3.5" aria-hidden="true" />
                      {teks.detail.debitSimulasi}
                    </p>
                    <RiskBadge level={debit.level} />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatAngka(debit.debitKumulatifM3s, 0)}{" "}
                    <span className="text-muted-foreground text-xs font-normal">m³/s</span>
                  </p>
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">{teks.detail.debitLokal}</dt>
                      <dd className="tabular-nums">{formatAngka(debit.debitLokalM3s, 0)} m³/s</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{teks.detail.cValue}</dt>
                      <dd className="tabular-nums">{formatAngka(debit.cValue)}</dd>
                    </div>
                  </dl>
                  {hasil ? <ConfidenceBadge value={hasil.keyakinan} className="mt-1" /> : null}
                </div>
              ) : null}

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <dt className="text-muted-foreground text-xs">{teks.detail.ambangWaspada}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatAngka(node.ambangWaspadaMeter)} m
                  </dd>
                </div>
                <div className="rounded-xl border p-3">
                  <dt className="text-muted-foreground text-xs">{teks.detail.ambangSiaga}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatAngka(node.ambangSiagaMeter)} m
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl border p-3">
                  <dt className="text-muted-foreground text-xs">{teks.detail.koordinat}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatAngka(node.lat, 4)}, {formatAngka(node.lng, 4)}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground text-xs">{teks.detail.sumber}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <DataBadge status={node.status} />
                  <span className="text-muted-foreground">{node.sumber}</span>
                </div>
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">{teks.detail.tutup}</Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
