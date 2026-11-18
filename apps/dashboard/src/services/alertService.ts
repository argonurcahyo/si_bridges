import type { Catchment } from "@/schemas/catchment";
import type { HydroNetwork } from "@/schemas/hydro";
import type { LevelPeringatan, Peringatan } from "@/schemas/peringatan";
import type { Bahasa } from "@/i18n/teks";
import { lagKumulatifMenit, type SimulationResult } from "@/services/simulationService";

const PRIORITAS: Record<LevelPeringatan, number> = { siaga: 2, waspada: 1 };
const TAMBAHAN_MENIT: Record<LevelPeringatan, number> = { siaga: 0, waspada: 30 };

const LABEL: Record<Bahasa, Record<LevelPeringatan, string>> = {
  id: { siaga: "SIAGA", waspada: "WASPADA" },
  en: { siaga: "ALERT", waspada: "WATCH" },
};

function angkaRingkas(nilai: number, bahasa: Bahasa): string {
  return new Intl.NumberFormat(bahasa === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 1,
  }).format(nilai);
}

/** Template pesan publik. Tidak memuat sumber/waktu; provenance ditampilkan di UI. */
export function susunTeksPeringatan(
  level: LevelPeringatan,
  wilayah: string,
  estimasiTibaMenit: number,
  puncak: number,
  bahasa: Bahasa = "en",
): string {
  const arahan =
    bahasa === "id"
      ? level === "siaga"
        ? "Segera naik ke lantai dua atau lokasi aman terdekat. Ikuti informasi resmi BPBD DKI Jakarta."
        : "Siapkan dokumen penting, amankan barang, dan hindari aktivitas di bantaran sungai. Ikuti informasi resmi BPBD DKI Jakarta."
      : level === "siaga"
        ? "Move to an upper floor or the nearest safe location. Follow official information from BPBD DKI Jakarta."
        : "Prepare important documents, secure belongings, and avoid riverbank areas. Follow official information from BPBD DKI Jakarta.";

  const baris =
    bahasa === "id"
      ? `Estimasi air tiba ± ${estimasiTibaMenit} menit. Puncak sekitar ${angkaRingkas(puncak, bahasa)} jam. ${arahan}`
      : `Estimated water arrival in ${estimasiTibaMenit} ${
          estimasiTibaMenit === 1 ? "minute" : "minutes"
        }. Peak around ${angkaRingkas(puncak, bahasa)} ${puncak === 1 ? "hour" : "hours"}. ${arahan}`;

  return [`${LABEL[bahasa][level]} — Kelurahan ${wilayah}`, baris].join("\n");
}

function puncakJam(lagMenit: number, level: LevelPeringatan): number {
  const menit = Math.max(60, lagMenit + 60 + TAMBAHAN_MENIT[level]);
  return Math.round((menit / 60) * 10) / 10;
}

/**
 * Menyusun kandidat peringatan per wilayah dari hasil simulasi.
 * Hanya wilayah berlevel waspada/siaga yang masuk kandidat.
 * F1 memakai template; AI composer ditambahkan pada F2.
 */
export function buildKandidatPeringatan(
  hasil: SimulationResult,
  network: HydroNetwork,
  catchments: Catchment[],
  opsi: { sekarang?: Date; bahasa?: Bahasa } = {},
): Peringatan[] {
  const dibuatPada = opsi.sekarang ?? new Date();
  const bahasa = opsi.bahasa ?? "en";
  const lag = lagKumulatifMenit(network);
  const waktuSimulasi = Date.parse(hasil.dihitungPada);
  const capWaktu = Number.isFinite(waktuSimulasi) ? waktuSimulasi : dibuatPada.getTime();

  return catchments
    .flatMap((catchment): Peringatan[] => {
      const node = hasil.perNode.find((item) => item.nodeId === catchment.nodeId);
      if (!node || node.level === "aman") return [];

      const lagMenit = lag.get(catchment.nodeId) ?? 60;
      const estimasiTibaMenit = Math.max(15, lagMenit + TAMBAHAN_MENIT[node.level]);
      const puncak = puncakJam(lagMenit, node.level);
      const teks = susunTeksPeringatan(
        node.level,
        catchment.wilayah,
        estimasiTibaMenit,
        puncak,
        bahasa,
      );

      return [
        {
          id: `PRG-${catchment.nodeId}-${capWaktu}`,
          wilayahKode: catchment.nodeId,
          wilayahNama: catchment.wilayah,
          nodeId: catchment.nodeId,
          level: node.level,
          debitKumulatifM3s: node.debitKumulatifM3s,
          kedalamanM: null,
          estimasiTibaMenit,
          puncakJam: puncak,
          keyakinan: hasil.keyakinan,
          teksAwal: teks,
          teksFinal: teks,
          sumberNarasi: "template",
          modelLabel: "Template HydroTwin",
          status: "draf",
          dibuatPada: dibuatPada.toISOString(),
          narasiDibuatPada: null,
          alasanFallback: null,
          disuntingPada: null,
          disiarkanPada: null,
          disiarkanOleh: null,
          ditarikPada: null,
          ditolakPada: null,
          kedaluwarsaPada: null,
          berlakuHingga: null,
          versiSimulasi: hasil.dihitungPada,
        },
      ];
    })
    .sort(
      (a, b) =>
        PRIORITAS[b.level] - PRIORITAS[a.level] ||
        (a.estimasiTibaMenit ?? 0) - (b.estimasiTibaMenit ?? 0) ||
        a.wilayahNama.localeCompare(b.wilayahNama),
    );
}
