import type { FeatureCollection } from "geojson";
import type { KelurahanFeature } from "@/engine/planner";
import { kelurahanPropertiesSchema } from "@/schemas/kelurahan";

const SUMBER = `${import.meta.env.BASE_URL}geo/kelurahan-koridor.geojson`;

/** Memuat poligon kelurahan koridor Ciliwung (237 fitur, data BPS 2020). */
export async function loadKelurahan(): Promise<KelurahanFeature[]> {
  const response = await fetch(SUMBER);
  if (!response.ok) throw new Error("Data kelurahan tidak dapat dimuat");

  const data = (await response.json()) as FeatureCollection;
  if (!Array.isArray(data.features) || data.features.length === 0) {
    throw new Error("Data kelurahan kosong");
  }

  for (const feature of data.features) {
    kelurahanPropertiesSchema.parse(feature.properties);
  }

  return data.features as KelurahanFeature[];
}
