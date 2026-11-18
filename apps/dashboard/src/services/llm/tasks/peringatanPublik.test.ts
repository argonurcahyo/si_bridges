import { describe, expect, it } from "vitest";
import { susunTeksPeringatan } from "@/services/alertService";
import {
  buatMockPeringatanProvider,
  generatePeringatanPublik,
  templatePeringatanProvider,
  validatePeringatan,
  type PeringatanContext,
  type PeringatanProvider,
} from "@/services/llm/tasks/peringatanPublik";

const waktu = new Date("2026-11-18T08:00:00.000Z");

const konteks: PeringatanContext = {
  wilayahNama: "Kampung Melayu",
  level: "siaga",
  estimasiTibaMenit: 60,
  puncakJam: 3,
  keyakinan: 92,
  debitKumulatifM3s: 3200,
  dibuatPada: waktu.toISOString(),
  bahasa: "id",
};

const teksValid =
  "SIAGA — Kelurahan Kampung Melayu. Air diperkirakan tiba sekitar 60 menit lagi. Puncak sekitar 3 jam. Segera naik ke lantai dua atau lokasi aman terdekat. Ikuti informasi resmi BPBD DKI Jakarta.";

const providerValid: PeringatanProvider = {
  nama: "uji",
  modelLabel: "Model Uji",
  generate: async () => ({ teks: teksValid }),
};

describe("validatePeringatan", () => {
  it("meloloskan template dan pesan mock yang valid", async () => {
    const template = await templatePeringatanProvider.generate(konteks);
    expect(validatePeringatan(template.teks, konteks)).toEqual([]);
    expect(validatePeringatan(teksValid, konteks)).toEqual([]);
  });

  it("menolak angka di luar konteks", () => {
    const masalah = validatePeringatan(
      "SIAGA — Kelurahan Kampung Melayu. Air tiba 999 menit. Segera naik.",
      konteks,
    );
    expect(masalah.join(" ")).toContain("angka menyimpang");
  });

  it("menolak bahasa yang menimbulkan kepanikan", () => {
    const masalah = validatePeringatan(
      "SIAGA — Kelurahan Kampung Melayu pasti tsunami. Segera naik.",
      konteks,
    );
    expect(masalah.join(" ")).toContain("bahasa");
  });

  it("menolak pesan tanpa arahan tindakan", () => {
    const masalah = validatePeringatan("SIAGA — Kelurahan Kampung Melayu. 60 menit.", konteks);
    expect(masalah.join(" ")).toContain("arahan");
  });

  it("menolak istilah teknis di pesan publik", () => {
    const masalah = validatePeringatan(
      "SIAGA — Kelurahan Kampung Melayu. Debit 3200 m3/s. Segera naik.",
      konteks,
    );
    expect(masalah.join(" ")).toContain("bahasa");
  });
});

describe("generatePeringatanPublik", () => {
  it("memakai pesan LLM bila valid", async () => {
    const hasil = await generatePeringatanPublik(konteks, {
      provider: providerValid,
      sekarang: waktu,
    });

    expect(hasil.sumber).toBe("llm");
    expect(hasil.modelLabel).toBe("Model Uji");
    expect(hasil.teks).toBe(teksValid);
    expect(hasil.dibuatPada).toBe(waktu.toISOString());
    expect(hasil.alasanFallback).toBeUndefined();
  });

  it("mock default lolos validator untuk semua varian", async () => {
    for (const nilaiAcak of [0.1, 0.5, 0.9]) {
      const provider = buatMockPeringatanProvider({
        delayMinMs: 0,
        delayMaxMs: 0,
        acak: () => nilaiAcak,
      });
      const hasil = await generatePeringatanPublik(konteks, { provider, sekarang: waktu });

      expect(hasil.sumber).toBe("llm");
      expect(validatePeringatan(hasil.teks, konteks)).toEqual([]);
    }
  });

  it("mock bahasa Inggris lolos validator", async () => {
    const hasil = await generatePeringatanPublik(
      { ...konteks, bahasa: "en" },
      { delayMinMs: 0, delayMaxMs: 0, sekarang: waktu },
    );

    expect(hasil.sumber).toBe("llm");
    expect(validatePeringatan(hasil.teks, { ...konteks, bahasa: "en" })).toEqual([]);
  });

  it("fallback saat provider melempar error", async () => {
    const gagal: PeringatanProvider = {
      nama: "gagal",
      modelLabel: "Gagal",
      generate: () => Promise.reject(new Error("jaringan putus")),
    };
    const hasil = await generatePeringatanPublik(konteks, { provider: gagal, sekarang: waktu });

    expect(hasil.sumber).toBe("template");
    expect(hasil.alasanFallback).toBe("error");
    expect(hasil.teks).toBe(susunTeksPeringatan("siaga", "Kampung Melayu", 60, 3, "id"));
  });

  it("fallback saat provider melewati batas waktu", async () => {
    const lambat: PeringatanProvider = {
      nama: "lambat",
      modelLabel: "Lambat",
      generate: () => new Promise(() => undefined),
    };
    const hasil = await generatePeringatanPublik(konteks, {
      provider: lambat,
      timeoutMs: 20,
      sekarang: waktu,
    });

    expect(hasil.sumber).toBe("template");
    expect(hasil.alasanFallback).toBe("timeout");
  });

  it("fallback saat angka atau bahasa tidak valid", async () => {
    const nakal: PeringatanProvider = {
      nama: "nakal",
      modelLabel: "Nakal",
      generate: async () => ({
        teks: "SIAGA — Kelurahan Kampung Melayu. Air tiba 999 menit. Segera naik.",
      }),
    };
    const hasil = await generatePeringatanPublik(konteks, { provider: nakal, sekarang: waktu });

    expect(hasil.sumber).toBe("template");
    expect(hasil.alasanFallback).toBe("validasi");
  });

  it("fallback saat paksa gagal aktif", async () => {
    const hasil = await generatePeringatanPublik(konteks, {
      paksaGagal: () => true,
      delayMinMs: 0,
      delayMaxMs: 0,
      sekarang: waktu,
    });

    expect(hasil.sumber).toBe("template");
    expect(hasil.alasanFallback).toBe("error");
  });
});
