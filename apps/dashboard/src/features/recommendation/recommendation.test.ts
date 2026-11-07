import { describe, expect, it } from "vitest";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { runSimulation } from "@/services/simulationService";
import { susunSaran } from "@/services/llm/saran";
import { useOperatorStore } from "@/store/operatorStore";

const network = loadNetwork();
const catchments = loadCatchments(network);

describe("susunSaran", () => {
  it("memprioritaskan node dengan level tertinggi", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 200, konversiLahanPersen: 30 },
      network,
      catchments,
    );
    const saran = susunSaran(hasil, network);

    expect(saran.level).toBe("siaga");
    expect(saran.persenBukaan).toBe(15);
    expect(saran.menit).toBe(45);
    expect(saran.debitM3s).toBeGreaterThan(0);
  });

  it("tidak menyarankan pembukaan saat semua aman", () => {
    const hasil = runSimulation(
      { intensitasMmJam: 0, konversiLahanPersen: 0 },
      network,
      catchments,
    );
    const saran = susunSaran(hasil, network);

    expect(saran.level).toBe("aman");
    expect(saran.persenBukaan).toBe(0);
  });
});

describe("operatorStore", () => {
  it("mencatat keputusan dan menambah entri log", () => {
    useOperatorStore.getState().reset();
    const waktu = new Date("2026-11-07T08:15:00.000Z");

    useOperatorStore.getState().catat(
      {
        rekomendasiId: "REK-80-20",
        pilihan: "perlu_verifikasi",
        sumber: "rule_based",
        ringkasan: "hujan 80 mm/jam",
      },
      waktu,
    );

    const state = useOperatorStore.getState();
    expect(state.keputusan["REK-80-20"]).toBe("perlu_verifikasi");
    expect(state.log).toHaveLength(1);
    expect(state.log[0]?.waktu).toBe(waktu.toISOString());
    expect(state.log[0]?.sumber).toBe("rule_based");
  });

  it("mengganti keputusan tetap menambah entri log", () => {
    useOperatorStore.getState().reset();
    const dasar = {
      rekomendasiId: "REK-80-20",
      sumber: "llm" as const,
      ringkasan: "hujan 80 mm/jam",
    };

    useOperatorStore.getState().catat({ ...dasar, pilihan: "diterima" });
    useOperatorStore.getState().catat({ ...dasar, pilihan: "ditolak" });

    const state = useOperatorStore.getState();
    expect(state.keputusan["REK-80-20"]).toBe("ditolak");
    expect(state.log).toHaveLength(2);
  });

  it("reset mengosongkan log dan keputusan", () => {
    useOperatorStore.getState().catat({
      rekomendasiId: "REK-1-1",
      pilihan: "diterima",
      sumber: "llm",
      ringkasan: "uji",
    });
    useOperatorStore.getState().reset();

    expect(useOperatorStore.getState().log).toHaveLength(0);
    expect(useOperatorStore.getState().keputusan).toEqual({});
  });
});
