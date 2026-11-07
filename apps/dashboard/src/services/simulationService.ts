import { hitungKeyakinan } from "@/engine/confidence";
import { proyeksiVolume, type TitikProyeksi } from "@/engine/projection";
import { levelDebit } from "@/engine/routing";
import { akumulasiDebit } from "@/engine/routing";
import { debitLimpasan, koefisienLimpasan } from "@/engine/runoff";
import type { RiskLevel } from "@/engine/riskLevel";
import type { Catchment } from "@/schemas/catchment";
import type { HydroNetwork } from "@/schemas/hydro";

export type SimulationInput = {
  intensitasMmJam: number;
  konversiLahanPersen: number;
};

export type NodeHasil = {
  nodeId: string;
  cValue: number;
  debitLokalM3s: number;
  debitKumulatifM3s: number;
  level: RiskLevel;
  ambangWaspadaM3s: number;
  ambangSiagaM3s: number;
};

export type SimulationResult = {
  intensitasMmJam: number;
  konversiLahanPersen: number;
  dihitungPada: string;
  perNode: NodeHasil[];
  totalDebitM3s: number;
  keyakinan: number;
  proyeksi: TitikProyeksi[];
  melampauiBatas: boolean;
};

export const BASELINE: SimulationInput = { intensitasMmJam: 60, konversiLahanPersen: 0 };
export const BATAS_INTENSITAS = { min: 0, max: 200 } as const;
export const BATAS_KONVERSI = [0, 10, 20, 30] as const;

/** Lama perjalanan air dari hulu ke node, dihitung dari lag edge. */
function lagKumulatifMenit(network: HydroNetwork): Map<string, number> {
  const hulu = new Map<string, { dari: string; lagMenit: number }[]>();
  for (const node of network.nodes) hulu.set(node.id, []);
  for (const edge of network.edges) {
    hulu.get(edge.ke)?.push({ dari: edge.dari, lagMenit: edge.lagMenit });
  }

  const hasil = new Map<string, number>();
  const hitung = (id: string): number => {
    const tersimpan = hasil.get(id);
    if (tersimpan !== undefined) return tersimpan;

    const nilai = (hulu.get(id) ?? []).reduce(
      (maks, edge) => Math.max(maks, hitung(edge.dari) + edge.lagMenit),
      0,
    );
    hasil.set(id, nilai);
    return nilai;
  };

  for (const node of network.nodes) hitung(node.id);
  return hasil;
}

/**
 * Layanan simulasi mock. Kontrak fungsi ini sama dengan layanan simulasi nyata
 * sehingga penggantian implementasi tidak mengubah UI (lihat ADR-003).
 */
export function runSimulation(
  input: SimulationInput,
  network: HydroNetwork,
  catchments: Catchment[],
  opsi: { sekarang?: Date } = {},
): SimulationResult {
  const intensitas = Math.min(
    BATAS_INTENSITAS.max,
    Math.max(BATAS_INTENSITAS.min, input.intensitasMmJam),
  );
  const konversi = Math.min(30, Math.max(0, input.konversiLahanPersen));

  const cPerNode = new Map<string, number>();
  const debitLokal = new Map<string, number>();

  for (const catchment of catchments) {
    const konversiEfektif = catchment.terpengaruhKonversi ? konversi : 0;
    const cValue = koefisienLimpasan(catchment.lulc, konversiEfektif);
    cPerNode.set(catchment.nodeId, cValue);
    debitLokal.set(catchment.nodeId, debitLimpasan(cValue, intensitas, catchment.luasHa));
  }

  const kumulatif = akumulasiDebit(
    network.nodes.map((node) => node.id),
    network.edges,
    debitLokal,
  );

  const perNode: NodeHasil[] = catchments.map((catchment) => {
    const debitKumulatifM3s = kumulatif.get(catchment.nodeId) ?? 0;
    return {
      nodeId: catchment.nodeId,
      cValue: cPerNode.get(catchment.nodeId) ?? 0,
      debitLokalM3s: debitLokal.get(catchment.nodeId) ?? 0,
      debitKumulatifM3s,
      level: levelDebit(debitKumulatifM3s, catchment),
      ambangWaspadaM3s: catchment.ambangWaspadaM3s,
      ambangSiagaM3s: catchment.ambangSiagaM3s,
    };
  });

  const keyakinan = hitungKeyakinan(intensitas, konversi);

  const hilir = network.nodes[network.nodes.length - 1];
  const lag = lagKumulatifMenit(network);
  const debitHilir = hilir ? (kumulatif.get(hilir.id) ?? 0) : 0;
  const waktuPuncak = Math.min(300, Math.max(60, hilir ? (lag.get(hilir.id) ?? 120) : 120));

  return {
    intensitasMmJam: intensitas,
    konversiLahanPersen: konversi,
    dihitungPada: (opsi.sekarang ?? new Date()).toISOString(),
    perNode,
    totalDebitM3s: debitHilir,
    keyakinan,
    proyeksi: proyeksiVolume(debitHilir, waktuPuncak, keyakinan),
    melampauiBatas: perNode.some((node) => node.level === "siaga"),
  };
}

export function hasilPerNode(hasil: SimulationResult, nodeId: string): NodeHasil | undefined {
  return hasil.perNode.find((node) => node.nodeId === nodeId);
}
