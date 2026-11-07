import type { RiskLevel } from "./riskLevel";

export type AmbangDebit = {
  ambangWaspadaM3s: number;
  ambangSiagaM3s: number;
};

export function levelDebit(debit: number, ambang: AmbangDebit): RiskLevel {
  if (debit >= ambang.ambangSiagaM3s) return "siaga";
  if (debit >= ambang.ambangWaspadaM3s) return "waspada";
  return "aman";
}

type Edge = { dari: string; ke: string };

/**
 * Akumulasi debit dari hulu ke hilir pada DAG.
 * Nilai node = debit lokal + total debit seluruh hulu.
 * Debit lokal tidak dikalikan ulang; ini aproksimasi routing tanpa atenuasi.
 */
export function akumulasiDebit(
  nodeIds: string[],
  edges: Edge[],
  debitLokal: Map<string, number>,
): Map<string, number> {
  const hulu = new Map<string, string[]>();
  for (const id of nodeIds) hulu.set(id, []);
  for (const edge of edges) {
    hulu.get(edge.ke)?.push(edge.dari);
  }

  const hasil = new Map<string, number>();
  const sedangDihitung = new Set<string>();

  const hitung = (id: string): number => {
    const tersimpan = hasil.get(id);
    if (tersimpan !== undefined) return tersimpan;
    if (sedangDihitung.has(id)) return 0; // pengaman bila data membentuk siklus
    sedangDihitung.add(id);

    const total =
      (debitLokal.get(id) ?? 0) +
      (hulu.get(id) ?? []).reduce((jumlah, idHulu) => jumlah + hitung(idHulu), 0);

    sedangDihitung.delete(id);
    hasil.set(id, total);
    return total;
  };

  for (const id of nodeIds) hitung(id);
  return hasil;
}
