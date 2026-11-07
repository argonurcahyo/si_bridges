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
import type { HydroNode } from "@/schemas/hydro";

export function NodeTable({ nodes }: { nodes: HydroNode[] }) {
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
        {nodes.map((node) => (
          <TableRow key={node.id}>
            <TableCell className="font-medium">{node.nama}</TableCell>
            <TableCell>{teks.tipeNode[node.tipe]}</TableCell>
            <TableCell className="text-right tabular-nums">{formatAngka(node.tmaMeter)}</TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
