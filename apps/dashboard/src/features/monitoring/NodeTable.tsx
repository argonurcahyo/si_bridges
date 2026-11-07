import { DataBadge } from "@/components/shared/DataBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { riskLevel } from "@/engine/riskLevel";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HydroNode } from "@/schemas/hydro";

type NodeTableProps = {
  nodes: HydroNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function NodeTable({ nodes, selectedId, onSelect }: NodeTableProps) {
  if (nodes.length === 0) {
    return <p className="text-muted-foreground text-sm">{teks.tabel.kosong}</p>;
  }

  return (
    <Table>
      <caption className="sr-only">{teks.tabel.caption}</caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{teks.tabel.nama}</TableHead>
          <TableHead scope="col">{teks.tabel.tipe}</TableHead>
          <TableHead scope="col" className="text-right">
            {teks.tabel.tma}
          </TableHead>
          <TableHead scope="col">{teks.tabel.level}</TableHead>
          <TableHead scope="col">{teks.tabel.sumber}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => {
          const terpilih = node.id === selectedId;
          return (
            <TableRow
              key={node.id}
              data-state={terpilih ? "selected" : undefined}
              className={cn("transition-colors", terpilih && "bg-sky-500/10")}
            >
              <TableCell className="font-medium">
                <button
                  type="button"
                  onClick={() => onSelect(node.id)}
                  aria-pressed={terpilih}
                  className="focus-visible:ring-ring rounded-sm text-left underline-offset-4 outline-none hover:text-sky-500 hover:underline focus-visible:ring-2"
                >
                  {node.nama}
                </button>
              </TableCell>
              <TableCell>{teks.tipeNode[node.tipe]}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatAngka(node.tmaMeter)}
              </TableCell>
              <TableCell>
                <RiskBadge
                  level={riskLevel(node.tmaMeter, {
                    ambangWaspadaMeter: node.ambangWaspadaMeter,
                    ambangSiagaMeter: node.ambangSiagaMeter,
                  })}
                />
              </TableCell>
              <TableCell>
                <DataBadge status={node.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
