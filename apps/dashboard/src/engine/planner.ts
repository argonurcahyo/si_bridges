import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { BATAS_PLANNER, PLANNER_BASELINE } from "@/engine/plannerParams";
import type { RiskLevel } from "@/engine/riskLevel";

export { BATAS_PLANNER, PLANNER_BASELINE };

export type KelurahanProperties = {
  kode: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  luasHa: number;
  jarakSungaiM: number;
  rw: number;
};

export type KelurahanFeature = Feature<Polygon | MultiPolygon, KelurahanProperties>;

export type KelurahanPropertiesPeta = KelurahanProperties & {
  kedalamanM: number;
  level: RiskLevel;
};

export type PlannerInput = {
  hujan24JamMm: number;
  pasangMeter: number;
  rthPersen: number;
  moratorium: boolean;
};

export const AMBANG_KEDALAMAN = { waspada: 0.5, siaga: 0.9 } as const;

function clamp(nilai: number, min: number, maks: number) {
  return Math.min(maks, Math.max(min, nilai));
}

/**
 * Kedalaman genangan mock per kelurahan. Dipengaruhi jarak ke sungai,
 * hujan 24 jam, pasang, RTH, dan moratorium. Bukan keluaran HEC-RAS.
 */
export function hitungKedalamanM(prop: KelurahanProperties, input: PlannerInput): number {
  const hujanFaktor = clamp((input.hujan24JamMm - 60) / 120, 0, 2);
  const dasar = 0.18 + 1.15 * Math.exp(-prop.jarakSungaiM / 550);
  const pasang = 1 + input.pasangMeter * 0.55;
  const rth = 1 - input.rthPersen * 0.01;
  const moratorium = input.moratorium ? 0.99 : 1;

  return clamp((0.05 + dasar * hujanFaktor) * pasang * rth * moratorium, 0, 3);
}

export function levelKedalaman(kedalamanM: number): RiskLevel {
  if (kedalamanM >= AMBANG_KEDALAMAN.siaga) return "siaga";
  if (kedalamanM >= AMBANG_KEDALAMAN.waspada) return "waspada";
  return "aman";
}

export type HasilKelurahan = KelurahanProperties & {
  kedalamanM: number;
  level: RiskLevel;
  luasGenanganHa: number;
  rwTerdampak: number;
};

export type PlannerSummary = {
  luasGenanganHa: number;
  rwTerdampak: number;
  puncakJam: number;
  keyakinan: number;
  level: RiskLevel;
  jumlahAman: number;
  jumlahWaspada: number;
  jumlahSiaga: number;
};

export type PlannerResult = {
  input: PlannerInput;
  perKelurahan: HasilKelurahan[];
  ringkasan: PlannerSummary;
};

export type OpsiSkenario = {
  nama: string;
  luasGenanganHa: number;
  aktif: boolean;
};

function ringkas(perKelurahan: HasilKelurahan[], input: PlannerInput): PlannerSummary {
  let luas = 0;
  let rw = 0;
  let aman = 0;
  let waspada = 0;
  let siaga = 0;

  for (const item of perKelurahan) {
    luas += item.luasGenanganHa;
    rw += item.rwTerdampak;
    if (item.level === "siaga") siaga += 1;
    else if (item.level === "waspada") waspada += 1;
    else aman += 1;
  }

  const puncakJam = clamp(2.5 + input.hujan24JamMm / 60 + input.pasangMeter * 0.4, 2, 12);
  const keyakinan = clamp(
    0.92 - (input.hujan24JamMm - 120) / 900 - input.pasangMeter * 0.06 - input.rthPersen * 0.001,
    0.55,
    0.92,
  );

  return {
    luasGenanganHa: Math.round(luas),
    rwTerdampak: Math.round(rw),
    puncakJam: Math.round(puncakJam * 10) / 10,
    keyakinan: Math.round(keyakinan * 100),
    level: siaga > 0 ? "siaga" : waspada > 0 ? "waspada" : "aman",
    jumlahAman: aman,
    jumlahWaspada: waspada,
    jumlahSiaga: siaga,
  };
}

export function runPlanner(features: KelurahanFeature[], input: PlannerInput): PlannerResult {
  const perKelurahan: HasilKelurahan[] = features.map((feature) => {
    const prop = feature.properties;
    const kedalamanM = hitungKedalamanM(prop, input);

    return {
      ...prop,
      kedalamanM: Math.round(kedalamanM * 100) / 100,
      level: levelKedalaman(kedalamanM),
      luasGenanganHa: prop.luasHa * clamp((kedalamanM - 0.3) / 0.7, 0, 1),
      rwTerdampak: prop.rw * clamp((kedalamanM - 0.35) / 0.7, 0, 1),
    };
  });

  return { input, perKelurahan, ringkasan: ringkas(perKelurahan, input) };
}

export function bandingkanOpsi(features: KelurahanFeature[], input: PlannerInput): OpsiSkenario[] {
  const opsi: Array<{ nama: string; input: PlannerInput; aktif: boolean }> = [
    { nama: "Dasar", input: { ...input, rthPersen: 0, moratorium: false }, aktif: false },
    { nama: "RTH", input: { ...input, moratorium: false }, aktif: false },
    { nama: "Moratorium", input: { ...input, rthPersen: 0 }, aktif: false },
    { nama: "Gabungan", input, aktif: true },
  ];

  return opsi.map((item) => ({
    nama: item.nama,
    luasGenanganHa: runPlanner(features, item.input).ringkasan.luasGenanganHa,
    aktif: item.aktif,
  }));
}

export function kelurahanToFeatureCollection(
  features: KelurahanFeature[],
  hasil: PlannerResult,
): FeatureCollection<Polygon | MultiPolygon, KelurahanPropertiesPeta> {
  const peta = new Map(hasil.perKelurahan.map((item) => [item.kode, item]));

  return {
    type: "FeatureCollection",
    features: features.map((feature) => {
      const nilai = peta.get(feature.properties.kode);
      return {
        ...feature,
        properties: {
          ...feature.properties,
          kedalamanM: nilai?.kedalamanM ?? 0,
          level: nilai?.level ?? "aman",
        },
      };
    }),
  };
}

export function kelurahanTerdalam(hasil: PlannerResult, jumlah = 3): HasilKelurahan[] {
  return [...hasil.perKelurahan].sort((a, b) => b.kedalamanM - a.kedalamanM).slice(0, jumlah);
}
