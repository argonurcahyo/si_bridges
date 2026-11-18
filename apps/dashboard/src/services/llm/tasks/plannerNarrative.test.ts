import { describe, expect, it } from "vitest";
import { bandingkanOpsi, runPlanner, type KelurahanFeature } from "@/engine/planner";
import {
  buildPlannerNarrativeContext,
  buatMockPlannerProvider,
  generatePlannerNarrative,
  susunBriefTemplate,
  susunInterpretasiTemplate,
  templatePlannerProvider,
  validatePlannerNarrative,
  type PlannerNarrativeContext,
  type PlannerNarrativeProvider,
} from "@/services/llm/tasks/plannerNarrative";

const prop = {
  kode: "TEST",
  kelurahan: "Uji",
  kecamatan: "Uji",
  kota: "Kota Uji",
  provinsi: "Dki Jakarta",
  luasHa: 200,
  jarakSungaiM: 300,
  rw: 10,
};

const fitur: KelurahanFeature[] = [
  {
    type: "Feature",
    properties: prop,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [106.8, -6.2],
          [106.81, -6.2],
          [106.81, -6.21],
          [106.8, -6.2],
        ],
      ],
    },
  },
];

const input = { hujan24JamMm: 180, pasangMeter: 0.4, rthPersen: 15, moratorium: true };
const dasarInput = { ...input, rthPersen: 0, moratorium: false };
const hasil = runPlanner(fitur, input);
const dasar = runPlanner(fitur, dasarInput);
const opsi = bandingkanOpsi(fitur, input);
const waktu = new Date("2026-11-18T09:00:00.000Z");

function konteks(): PlannerNarrativeContext {
  return buildPlannerNarrativeContext(input, hasil, dasar, opsi);
}

const providerValid: PlannerNarrativeProvider = {
  nama: "uji",
  modelLabel: "Model Uji",
  generate: async (ctx) => ({ teks: susunInterpretasiTemplate(ctx) }),
};

describe("buildPlannerNarrativeContext", () => {
  it("menghitung delta penurunan luas dan RW", () => {
    const ctx = konteks();

    expect(ctx.versi).toBe(`en:${JSON.stringify(input)}`);
    expect(ctx.deltaLuasPersen).toBeGreaterThanOrEqual(0);
    expect(ctx.deltaRwPersen).toBeGreaterThanOrEqual(0);
    expect(ctx.opsi).toHaveLength(4);
    expect(ctx.teratas.length).toBeGreaterThan(0);
  });
});

describe("validatePlannerNarrative", () => {
  it("meloloskan template interpretasi dan brief", () => {
    const ctx = konteks();

    expect(validatePlannerNarrative(susunInterpretasiTemplate(ctx), ctx, "interpretasi")).toEqual(
      [],
    );
    expect(validatePlannerNarrative(susunBriefTemplate(ctx), ctx, "brief")).toEqual([]);
  });

  it("menolak angka yang tidak ada di konteks", () => {
    const ctx = konteks();
    const masalah = validatePlannerNarrative(
      "Luas genangan 999 ha. Model mock, bukan HEC-RAS.",
      ctx,
      "interpretasi",
    );

    expect(masalah.join(" ")).toContain("angka menyimpang");
  });

  it("menolak klaim berlebihan dan brief tanpa struktur", () => {
    const ctx = konteks();

    expect(
      validatePlannerNarrative(
        "Skenario ini pasti berhasil. Model mock, bukan HEC-RAS.",
        ctx,
        "interpretasi",
      ).join(" "),
    ).toContain("terlalu yakin");

    expect(
      validatePlannerNarrative("Ringkasan saja. Model mock, bukan HEC-RAS.", ctx, "brief").join(
        " ",
      ),
    ).toContain("struktur brief");
  });
});

describe("generatePlannerNarrative", () => {
  it("memakai provider valid dan provenance", async () => {
    const hasilNarasi = await generatePlannerNarrative("interpretasi", konteks(), {
      provider: providerValid,
      sekarang: waktu,
    });

    expect(hasilNarasi.sumber).toBe("llm");
    expect(hasilNarasi.modelLabel).toBe("Model Uji");
    expect(hasilNarasi.jenis).toBe("interpretasi");
    expect(hasilNarasi.versi).toBe(`en:${JSON.stringify(input)}`);
    expect(hasilNarasi.dibuatPada).toBe(waktu.toISOString());
    expect(hasilNarasi.alasanFallback).toBeUndefined();
  });

  it("mock default lolos validator untuk interpretasi dan brief", async () => {
    for (const jenis of ["interpretasi", "brief"] as const) {
      for (const nilaiAcak of [0.1, 0.6, 0.9]) {
        const provider = buatMockPlannerProvider(jenis, {
          delayMinMs: 0,
          delayMaxMs: 0,
          acak: () => nilaiAcak,
        });
        const hasilNarasi = await generatePlannerNarrative(jenis, konteks(), {
          provider,
          sekarang: waktu,
        });

        expect(hasilNarasi.sumber).toBe("llm");
        expect(validatePlannerNarrative(hasilNarasi.teks, konteks(), jenis)).toEqual([]);
      }
    }
  });

  it("fallback saat provider gagal", async () => {
    const gagal: PlannerNarrativeProvider = {
      nama: "gagal",
      modelLabel: "Gagal",
      generate: () => Promise.reject(new Error("putus")),
    };
    const hasilNarasi = await generatePlannerNarrative("brief", konteks(), {
      provider: gagal,
      sekarang: waktu,
    });

    expect(hasilNarasi.sumber).toBe("template");
    expect(hasilNarasi.alasanFallback).toBe("error");
    expect(hasilNarasi.teks).toBe(susunBriefTemplate(konteks()));
  });

  it("fallback saat timeout", async () => {
    const lambat: PlannerNarrativeProvider = {
      nama: "lambat",
      modelLabel: "Lambat",
      generate: () => new Promise(() => undefined),
    };
    const hasilNarasi = await generatePlannerNarrative("interpretasi", konteks(), {
      provider: lambat,
      timeoutMs: 20,
      sekarang: waktu,
    });

    expect(hasilNarasi.sumber).toBe("template");
    expect(hasilNarasi.alasanFallback).toBe("timeout");
  });

  it("fallback saat validasi gagal", async () => {
    const nakal: PlannerNarrativeProvider = {
      nama: "nakal",
      modelLabel: "Nakal",
      generate: async () => ({ teks: "Luas genangan 999 ha. Model mock." }),
    };
    const hasilNarasi = await generatePlannerNarrative("interpretasi", konteks(), {
      provider: nakal,
      sekarang: waktu,
    });

    expect(hasilNarasi.sumber).toBe("template");
    expect(hasilNarasi.alasanFallback).toBe("validasi");
  });

  it("template provider menghasilkan teks yang lolos", async () => {
    const template = templatePlannerProvider("brief");
    const draft = await template.generate(konteks());

    expect(validatePlannerNarrative(draft.teks, konteks(), "brief")).toEqual([]);
  });
});
