import { en } from "./en";
import { id, type Teks } from "./id";

export type Bahasa = "id" | "en";

const KUNCI_BAHASA = "hydrotwin-bahasa";

function bacaBahasa(): Bahasa {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(KUNCI_BAHASA) === "id" ? "id" : "en";
  } catch {
    return "en";
  }
}

export const bahasaAktif: Bahasa = bacaBahasa();
export const teks: Teks = bahasaAktif === "id" ? id : en;

if (typeof document !== "undefined") {
  document.documentElement.lang = bahasaAktif;
  document.title =
    bahasaAktif === "id"
      ? "HydroTwin-AI — Dashboard Operasional & Konsol Perencana"
      : "HydroTwin-AI — Early Warning System & Simulator";
}

export function gantiBahasa(bahasa: Bahasa): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_BAHASA, bahasa);
  window.location.reload();
}
