import { History, Trash2 } from "lucide-react";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/id";
import { formatWaktuWib } from "@/lib/format";
import { useOperatorStore } from "@/store/operatorStore";

const labelPilihan: Record<string, string> = {
  diterima: teks.rekomendasi.diterima,
  ditolak: teks.rekomendasi.ditolak,
  perlu_verifikasi: teks.rekomendasi.verifikasi,
};

export function AuditLogPanel() {
  const log = useOperatorStore((state) => state.log);
  const reset = useOperatorStore((state) => state.reset);

  if (log.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm">
        <History className="text-muted-foreground size-6" aria-hidden="true" />
        {teks.rekomendasi.logKosong}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{teks.rekomendasi.logCatatan}</p>
        <Button variant="ghost" size="sm" onClick={reset} className="shrink-0 gap-1.5">
          <Trash2 className="size-3.5" aria-hidden="true" />
          {teks.rekomendasi.bersihkanLog}
        </Button>
      </div>

      <ol className="space-y-2">
        {log.map((entri) => (
          <li key={entri.id} className="bg-muted/20 rounded-xl border p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{labelPilihan[entri.pilihan] ?? entri.pilihan}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatWaktuWib(new Date(entri.waktu))}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 font-mono">{entri.rekomendasiId}</p>
            <p className="text-muted-foreground mt-0.5">{entri.ringkasan}</p>
            <div className="mt-1.5">
              <SourceBadge sumber={entri.sumber} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
