import { Activity, CircleCheck, TriangleAlert } from "lucide-react";
import { DataBadge } from "@/components/shared/DataBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { teks } from "@/i18n/id";
import { cn } from "@/lib/utils";
import type { DataStatus } from "@/schemas/hydro";
import { useDemoStore } from "@/store/operatorStore";

type Sumber = {
  layer: string;
  sumber: string;
  status: DataStatus;
  diperbarui: string;
};

const SUMBER: Sumber[] = [
  { layer: "TMA Katulampa", sumber: "DSDA (mock)", status: "mock", diperbarui: "14:28 WIB" },
  { layer: "Hujan", sumber: "BMKG / CHIRPS (mock)", status: "mock", diperbarui: "14:00 WIB" },
  {
    layer: "Batas kecamatan",
    sumber: "Peta Kita (SHP)",
    status: "open_data",
    diperbarui: "01-11-2026",
  },
  { layer: "DEM", sumber: "DEMNAS", status: "open_data", diperbarui: "—" },
  {
    layer: "Tutupan lahan",
    sumber: "Sentinel-2 (GEE)",
    status: "sintetis",
    diperbarui: "10-11-2026",
  },
];

function StatusBaris({ nama, sehat }: { nama: string; sehat: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
      <span>{nama}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          sehat ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
        )}
      >
        {sehat ? (
          <CircleCheck className="size-3.5" aria-hidden="true" />
        ) : (
          <TriangleAlert className="size-3.5" aria-hidden="true" />
        )}
        {sehat ? teks.statusSistem.normal : teks.statusSistem.terdegradasi}
      </span>
    </li>
  );
}

export function StatusSheet() {
  const paksaGagal = useDemoStore((state) => state.paksaGagalLlm);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Activity className="size-4 text-emerald-500" aria-hidden="true" />
          <span className="hidden sm:inline">{teks.statusSistem.tombol}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Activity className="size-4 text-emerald-500" aria-hidden="true" />
            {teks.statusSistem.judul}
          </div>
          <SheetTitle>{teks.statusSistem.subjudul}</SheetTitle>
          <SheetDescription>{teks.statusSistem.deskripsi}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{teks.statusSistem.sumberData}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{teks.tabel.nama}</TableHead>
                  <TableHead scope="col">Sumber</TableHead>
                  <TableHead scope="col">{teks.tabel.sumber}</TableHead>
                  <TableHead scope="col">{teks.statusSistem.diperbarui}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUMBER.map((item) => (
                  <TableRow key={item.layer}>
                    <TableCell className="font-medium">{item.layer}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sumber}</TableCell>
                    <TableCell>
                      <DataBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {item.diperbarui}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{teks.statusSistem.layanan}</h3>
            <ul className="space-y-2">
              <StatusBaris nama="Simulasi debit" sehat />
              <StatusBaris nama="Layanan narasi (LLM)" sehat={!paksaGagal} />
              <StatusBaris nama="Data geospasial" sehat />
            </ul>
            {paksaGagal ? (
              <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                {teks.statusSistem.fallbackAktif}
              </p>
            ) : null}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
