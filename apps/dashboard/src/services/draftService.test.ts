import { describe, expect, it } from "vitest";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { runSimulation } from "@/services/simulationService";
import { buildDrafts } from "@/services/draftService";

const network = loadNetwork();
const catchments = loadCatchments(network);
const waktu = new Date("2026-11-07T07:30:00.000Z");

describe("buildDrafts", () => {
  it("menghasilkan satu draf per wilayah", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 60, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    const drafts = buildDrafts(hasil, network, catchments, { sekarang: waktu });

    expect(drafts).toHaveLength(catchments.length);
    expect(new Set(drafts.map((draft) => draft.wilayah)).size).toBe(catchments.length);
  });

  it("mengurutkan draf dari level tertinggi", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 200, konversiLahanPersen: 30 },
      network,
      catchments,
    );
    const drafts = buildDrafts(hasil, network, catchments, { sekarang: waktu });
    const prioritas = { siaga: 2, waspada: 1, aman: 0 } as const;
    const urutan = drafts.map((draf) => prioritas[draf.level]);

    expect(urutan).toEqual([...urutan].sort((a, b) => b - a));
    expect(drafts[0]?.level).toBe("siaga");
  });

  it("teks memuat wilayah, estimasi, dan sumber berlabel mock", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 60, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    const [draf] = buildDrafts(hasil, network, catchments, { sekarang: waktu });

    expect(draf?.teks).toContain(draf!.wilayah);
    expect(draf?.teks).toContain("Estimasi air tiba");
    expect(draf?.teks).toContain("mock");
  });

  it("draf level siaga memuat instruksi evakuasi", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 200, konversiLahanPersen: 30 },
      network,
      catchments,
    );
    const drafSiaga = buildDrafts(hasil, network, catchments, { sekarang: waktu }).find(
      (draft) => draft.level === "siaga",
    );

    expect(drafSiaga?.teks).toContain("lantai dua");
    expect(drafSiaga?.estimasiTibaMenit).toBeGreaterThan(0);
  });

  it("tidak memuat instruksi pengiriman otomatis", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 60, konversiLahanPersen: 0 },
      network,
      catchments,
    );

    for (const draf of buildDrafts(hasil, network, catchments, { sekarang: waktu })) {
      expect(draf.teks.toLowerCase()).not.toContain("kirim");
    }
  });
});
