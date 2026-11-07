import { describe, expect, it } from "vitest";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { BASELINE, runSimulation } from "@/services/simulationService";

const network = loadNetwork();
const catchments = loadCatchments(network);

describe("runSimulation", () => {
  it("menghasilkan satu hasil per catchment", () => {
    const hasil = runSimulation(BASELINE, network, catchments);
    expect(hasil.perNode).toHaveLength(catchments.length);
    expect(hasil.totalDebitM3s).toBeGreaterThan(0);
  });

  it("debit naik saat intensitas hujan naik", () => {
    const rendah = runSimulation(
      { intensitasMmJam: 40, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    const tinggi = runSimulation(
      { intensitasMmJam: 100, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    expect(tinggi.totalDebitM3s).toBeGreaterThan(rendah.totalDebitM3s);
  });

  it("konversi lahan hanya menaikkan debit area Depok", () => {
    const tanpa = runSimulation(
      { intensitasMmJam: 60, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    const konversi = runSimulation(
      { intensitasMmJam: 60, konversiLahanPersen: 30 },
      network,
      catchments,
    );

    const katulampa = konversi.perNode.find((node) => node.nodeId === "katulampa")!;
    const katulampaDasar = tanpa.perNode.find((node) => node.nodeId === "katulampa")!;
    const cawang = konversi.perNode.find((node) => node.nodeId === "cawang")!;
    const cawangDasar = tanpa.perNode.find((node) => node.nodeId === "cawang")!;

    expect(katulampa.cValue).toBeGreaterThan(katulampaDasar.cValue);
    // Debit Cawang tetap naik karena menerima limpasan dari hulu (Depok).
    expect(cawang.debitKumulatifM3s).toBeGreaterThan(cawangDasar.debitKumulatifM3s);
    expect(cawang.debitLokalM3s).toBeCloseTo(cawangDasar.debitLokalM3s, 6);
  });

  it("menjepit input di luar batas", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 500, konversiLahanPersen: 90 },
      network,
      catchments,
    );
    expect(hasil.intensitasMmJam).toBe(200);
    expect(hasil.konversiLahanPersen).toBe(30);
  });

  it("waktu perhitungan dapat diinjeksi untuk hasil deterministik", () => {
    const waktu = new Date("2026-11-07T07:30:00.000Z");
    const hasil = runSimulation(BASELINE, network, catchments, { sekarang: waktu });
    expect(hasil.dihitungPada).toBe(waktu.toISOString());
  });
});
