import { MapPin } from "lucide-react";
import type { HasilKelurahan } from "@/engine/planner";
import { teks } from "@/i18n/id";
import { cn } from "@/lib/utils";

export function KelurahanDetail({ item }: { item?: HasilKelurahan }) {
  if (!item) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed p-3 text-xs">
        {teks.planner.terpilihKosong}
      </p>
    );
  }

  return (
    <div className="bg-card flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border p-3">
      <div className="flex min-w-0 items-center gap-2">
        <MapPin className="size-4 shrink-0 text-sky-500" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.kelurahan}</p>
          <p className="text-muted-foreground truncate text-xs">
            {item.kecamatan} · {item.kota}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="text-muted-foreground">
          {teks.planner.terpilih}:{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {item.kedalamanM.toFixed(2)} m
          </span>
        </span>
        <span className="text-muted-foreground">
          {item.rw} RW · {Math.round(item.luasHa)} ha
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            item.level === "siaga"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              : item.level === "waspada"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          )}
        >
          {teks.level[item.level]}
        </span>
      </div>
    </div>
  );
}
