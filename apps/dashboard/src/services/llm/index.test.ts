import { describe, expect, it } from "vitest";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { runSimulation } from "@/services/simulationService";
import { generateNarrative } from "@/services/llm";
import { susunSaran } from "@/services/llm/saran";
import type { NarrativeProvider } from "@/services/llm/types";

const network = loadNetwork();
const catchments = loadCatchments(network);
const hasil = runSimulation({ intensitasMmJam: 80, konversiLahanPersen: 20 }, network, catchments);
const input = { hasil, saran: susunSaran(hasil, network) };

const berhasil: NarrativeProvider = {
  nama: "uji",
  modelLabel: "Model Uji",
  generate: async ({ saran }) => ({
    teks: `Buka pintu ${saran.persenBukaan}% dalam ${saran.menit} menit. Debit ${saran.debitM3s} m³/s.`,
  }),
};

describe("generateNarrative", () => {
  it("memakai narasi LLM bila valid", async () => {
    const narasi = await generateNarrative(input, { provider: berhasil });
    expect(narasi.sumber).toBe("llm");
    expect(narasi.modelLabel).toBe("Model Uji");
    expect(narasi.alasanFallback).toBeUndefined();
  });

  it("fallback saat provider melempar error", async () => {
    const gagal: NarrativeProvider = {
      nama: "gagal",
      modelLabel: "Gagal",
      generate: () => Promise.reject(new Error("jaringan putus")),
    };
    const narasi = await generateNarrative(input, { provider: gagal });
    expect(narasi.sumber).toBe("rule_based");
    expect(narasi.alasanFallback).toBe("error");
  });

  it("fallback saat provider melewati batas waktu", async () => {
    const lambat: NarrativeProvider = {
      nama: "lambat",
      modelLabel: "Lambat",
      generate: () => new Promise(() => undefined),
    };
    const narasi = await generateNarrative(input, { provider: lambat, timeoutMs: 20 });
    expect(narasi.sumber).toBe("rule_based");
    expect(narasi.alasanFallback).toBe("timeout");
  });

  it("fallback saat narasi memuat angka yang tidak dikenal", async () => {
    const nakal: NarrativeProvider = {
      nama: "nakal",
      modelLabel: "Nakal",
      generate: async () => ({ teks: "Buka pintu 87% dalam 999 menit." }),
    };
    const narasi = await generateNarrative(input, { provider: nakal });
    expect(narasi.sumber).toBe("rule_based");
    expect(narasi.alasanFallback).toBe("validasi");
  });

  it("fallback saat paksa gagal aktif", async () => {
    const narasi = await generateNarrative(input, { paksaGagal: () => true });
    expect(narasi.sumber).toBe("rule_based");
  });

  it("memakai waktu yang diinjeksi untuk hasil deterministik", async () => {
    const waktu = new Date("2026-11-07T08:00:00.000Z");
    const narasi = await generateNarrative(input, { provider: berhasil, sekarang: waktu });
    expect(narasi.dibuatPada).toBe(waktu.toISOString());
  });
});
