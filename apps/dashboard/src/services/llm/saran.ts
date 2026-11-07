import type { HydroNetwork } from "@/schemas/hydro";
import type { RiskLevel } from "@/engine/riskLevel";
import type { SimulationResult } from "@/services/simulationService";

export type Saran = {
  nodeId: string;
  namaNode: string;
  level: RiskLevel;
  persenBukaan: number;
  menit: number;
  debitM3s: number;
  hilirNama: string;
};

const AKSI_PER_LEVEL: Record<RiskLevel, { persenBukaan: number; menit: number }> = {
  siaga: { persenBukaan: 15, menit: 45 },
  waspada: { persenBukaan: 10, menit: 60 },
  aman: { persenBukaan: 0, menit: 90 },
};

const PRIORITAS_LEVEL: Record<RiskLevel, number> = { siaga: 2, waspada: 1, aman: 0 };

/** Memilih node paling kritis dan menerjemahkannya menjadi rencana tindakan. */
export function susunSaran(hasil: SimulationResult, network: HydroNetwork): Saran {
  const nama = new Map(network.nodes.map((node) => [node.id, node.nama]));
  const hilir = network.nodes[network.nodes.length - 1];

  const kritis = [...hasil.perNode].sort(
    (a, b) =>
      PRIORITAS_LEVEL[b.level] - PRIORITAS_LEVEL[a.level] ||
      b.debitKumulatifM3s - a.debitKumulatifM3s,
  )[0];

  // Jika node kritis adalah node paling hilir, arahkan peringatan ke node sebelumnya.
  let hilirNama = hilir ? hilir.nama : "-";
  if (hilir && kritis && kritis.nodeId === hilir.id) {
    const sebelum = network.nodes[network.nodes.length - 2];
    hilirNama = sebelum ? sebelum.nama : hilirNama;
  }

  if (!kritis) {
    return {
      nodeId: "",
      namaNode: "-",
      level: "aman",
      persenBukaan: 0,
      menit: 90,
      debitM3s: 0,
      hilirNama,
    };
  }

  const aksi = AKSI_PER_LEVEL[kritis.level];

  return {
    nodeId: kritis.nodeId,
    namaNode: nama.get(kritis.nodeId) ?? kritis.nodeId,
    level: kritis.level,
    persenBukaan: aksi.persenBukaan,
    menit: aksi.menit,
    debitM3s: Math.round(kritis.debitKumulatifM3s),
    hilirNama,
  };
}
