import { describe, expect, it } from "vitest";
import { buildKandidatPeringatan } from "@/services/alertService";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { runSimulation } from "@/services/simulationService";

const network = loadNetwork();
const catchments = loadCatchments(network);
const waktu = new Date("2026-11-18T07:30:00.000Z");

function simulasi(intensitasMmJam: number, konversiLahanPersen = 0) {
  return runSimulation({ intensitasMmJam, konversiLahanPersen }, network, catchments, {
    sekarang: waktu,
  });
}

describe("buildKandidatPeringatan", () => {
  it("hanya menyusun kandidat untuk wilayah waspada/siaga", () => {
    const aman = buildKandidatPeringatan(simulasi(0), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });
    const tinggi = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });

    expect(aman).toHaveLength(0);
    expect(tinggi.length).toBeGreaterThan(0);
    expect(tinggi.every((item) => item.level === "waspada" || item.level === "siaga")).toBe(true);
  });

  it("menghasilkan satu kandidat per wilayah", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });

    expect(new Set(kandidat.map((item) => item.wilayahKode)).size).toBe(kandidat.length);
    expect(kandidat.length).toBeLessThanOrEqual(catchments.length);
  });

  it("mengurutkan kandidat dari level tertinggi", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });
    const prioritas = { siaga: 2, waspada: 1 } as const;
    const urutan = kandidat.map((item) => prioritas[item.level]);

    expect(urutan).toEqual([...urutan].sort((a, b) => b - a));
    expect(kandidat[0]?.level).toBe("siaga");
  });

  it("teks memuat wilayah, estimasi, dan arahan", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });
    const [item] = kandidat;

    expect(item?.teksFinal).toContain(item!.wilayahNama);
    expect(item?.teksFinal).toContain("Estimasi air tiba");
    expect(item?.teksFinal).toContain("Puncak sekitar");
    expect(item?.teksFinal.toLowerCase()).not.toContain("kirim");
    expect(item?.modelLabel).toBe("Template HydroTwin");
  });

  it("kandidat siaga memuat arahan evakuasi dan estimasi tiba", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });
    const siaga = kandidat.find((item) => item.level === "siaga");

    expect(siaga?.teksFinal).toContain("lantai dua");
    expect(siaga?.estimasiTibaMenit).toBeGreaterThan(0);
  });

  it("menyusun teks Inggris saat bahasa EN", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "en",
    });
    const item = kandidat.find((entry) => entry.level === "siaga");

    expect(item?.teksFinal).toContain("ALERT");
    expect(item?.teksFinal).toContain("Estimated water arrival");
    expect(item?.teksFinal).toContain("Move to an upper floor");
  });

  it("menyimpan teks awal dan status draf sebelum disunting", () => {
    const kandidat = buildKandidatPeringatan(simulasi(200, 30), network, catchments, {
      sekarang: waktu,
      bahasa: "id",
    });
    const [item] = kandidat;

    expect(item?.status).toBe("draf");
    expect(item?.teksAwal).toBe(item?.teksFinal);
    expect(item?.sumberNarasi).toBe("template");
    expect(item?.modelLabel).toBe("Template HydroTwin");
    expect(item?.kedalamanM).toBeNull();
    expect(item?.narasiDibuatPada).toBeNull();
    expect(item?.alasanFallback).toBeNull();
    expect(item?.versiSimulasi).toBe(waktu.toISOString());
  });
});
