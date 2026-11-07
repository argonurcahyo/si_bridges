import { lagKumulatifMenit, type SimulationResult } from "@/services/simulationService";
import type { Catchment } from "@/schemas/catchment";
import type { HydroNetwork } from "@/schemas/hydro";
import type { RiskLevel } from "@/engine/riskLevel";
import { formatWaktuWib } from "@/lib/format";

export type DrafPeringatan = {
  nodeId: string;
  wilayah: string;
  level: RiskLevel;
  estimasiTibaMenit: number;
  teks: string;
  keyakinan: number;
};

const PRIORITAS: Record<RiskLevel, number> = { siaga: 2, waspada: 1, aman: 0 };
const LABEL: Record<RiskLevel, string> = { siaga: "SIAGA", waspada: "WASPADA", aman: "AMAN" };
const TAMBAHAN_MENIT: Record<RiskLevel, number> = { siaga: 0, waspada: 30, aman: 60 };

function teksUntuk(
  level: RiskLevel,
  wilayah: string,
  estimasiMenit: number,
  dibuatPada: Date,
): string {
  const waktu = formatWaktuWib(dibuatPada);
  const sumber = `Sumber: simulasi HydroGraph-AI (mock) · ${waktu}`;

  if (level === "siaga") {
    return [
      `${LABEL[level]} — Kelurahan ${wilayah}`,
      `Estimasi air tiba ± ${estimasiMenit} menit. Segera naik ke lantai dua atau lokasi aman terdekat. Ikuti informasi resmi BPBD DKI Jakarta.`,
      sumber,
    ].join("\n");
  }

  if (level === "waspada") {
    return [
      `${LABEL[level]} — Kelurahan ${wilayah}`,
      `Estimasi air tiba ± ${estimasiMenit} menit. Siapkan dokumen penting, amankan barang, dan hindari aktivitas di bantaran sungai. Ikuti informasi resmi BPBD DKI Jakarta.`,
      sumber,
    ].join("\n");
  }

  return [
    `${LABEL[level]} — Kelurahan ${wilayah}`,
    `Tidak ada potensi luapan dalam 3 jam ke depan. Tetap pantau informasi resmi BPBD DKI Jakarta.`,
    sumber,
  ].join("\n");
}

/** Menyusun draf teks peringatan per wilayah. Tidak ada pengiriman otomatis (FR-26). */
export function buildDrafts(
  hasil: SimulationResult,
  network: HydroNetwork,
  catchments: Catchment[],
  opsi: { sekarang?: Date } = {},
): DrafPeringatan[] {
  const dibuatPada = opsi.sekarang ?? new Date();
  const lag = lagKumulatifMenit(network);

  return catchments
    .map((catchment): DrafPeringatan => {
      const node = hasil.perNode.find((item) => item.nodeId === catchment.nodeId);
      const level = node?.level ?? "aman";
      const estimasiTibaMenit = Math.max(
        15,
        (lag.get(catchment.nodeId) ?? 60) + TAMBAHAN_MENIT[level],
      );

      return {
        nodeId: catchment.nodeId,
        wilayah: catchment.wilayah,
        level,
        estimasiTibaMenit,
        teks: teksUntuk(level, catchment.wilayah, estimasiTibaMenit, dibuatPada),
        keyakinan: hasil.keyakinan,
      };
    })
    .sort((a, b) => PRIORITAS[b.level] - PRIORITAS[a.level]);
}
