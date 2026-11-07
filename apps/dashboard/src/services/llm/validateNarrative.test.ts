import { describe, expect, it } from "vitest";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { runSimulation } from "@/services/simulationService";
import { ruleBasedProvider } from "@/services/llm/ruleBasedProvider";
import { susunSaran } from "@/services/llm/saran";
import {
  ekstrakAngka,
  parseAngkaIndonesia,
  validateNarrative,
} from "@/services/llm/validateNarrative";

const network = loadNetwork();
const catchments = loadCatchments(network);
const hasil = runSimulation({ intensitasMmJam: 80, konversiLahanPersen: 20 }, network, catchments);
const saran = susunSaran(hasil, network);

describe("parseAngkaIndonesia", () => {
  it("membaca pemisah ribuan titik", () => {
    expect(parseAngkaIndonesia("4.385")).toBe(4385);
  });

  it("membaca desimal koma", () => {
    expect(parseAngkaIndonesia("12,5")).toBe(12.5);
  });
});

describe("ekstrakAngka", () => {
  it("mengambil semua angka dari teks", () => {
    expect(ekstrakAngka("buka 15% dalam 45 menit, debit 4.385 m³/s")).toEqual([15, 45, 4385]);
  });
});

describe("validateNarrative", () => {
  it("meloloskan narasi rule-based karena angkanya berasal dari hasil simulasi", async () => {
    const draft = await ruleBasedProvider.generate({ hasil, saran });
    expect(validateNarrative(draft.teks, hasil, saran)).toEqual([]);
  });

  it("menolak angka yang tidak ada di hasil simulasi", () => {
    const menyimpang = validateNarrative("Buka pintu 87% dalam 999 menit.", hasil, saran);
    expect(menyimpang.length).toBeGreaterThan(0);
  });
});
