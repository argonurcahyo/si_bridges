import { create } from "zustand";
import { AKTOR_DEMO } from "@/lib/constants";
import type { NarrativeSource } from "@/services/llm/types";

export type PilihanOperator = "diterima" | "ditolak" | "perlu_verifikasi";

export type JenisAudit =
  | "keputusan"
  | "peringatan_disunting"
  | "peringatan_disiarkan"
  | "peringatan_ditolak"
  | "peringatan_ditarik"
  | "peringatan_kedaluwarsa";

export type LogAudit = {
  id: string;
  jenis: JenisAudit;
  referensiId: string;
  waktu: string;
  aktor: string;
  ringkasan: string;
  pilihan?: PilihanOperator;
  sumber?: NarrativeSource;
};

export type EntriAudit = Omit<LogAudit, "id" | "waktu">;

type OperatorStore = {
  keputusan: Record<string, PilihanOperator>;
  log: LogAudit[];
  catat: (
    entri: {
      rekomendasiId: string;
      pilihan: PilihanOperator;
      sumber: NarrativeSource;
      ringkasan: string;
    },
    waktu?: Date,
  ) => void;
  catatAudit: (entri: EntriAudit, waktu?: Date) => void;
  reset: () => void;
};

export const useOperatorStore = create<OperatorStore>((set) => ({
  keputusan: {},
  log: [],
  catat: (entri, waktu = new Date()) =>
    set((state) => ({
      keputusan: { ...state.keputusan, [entri.rekomendasiId]: entri.pilihan },
      log: [
        {
          id: `${entri.rekomendasiId}-${state.log.length + 1}`,
          jenis: "keputusan",
          referensiId: entri.rekomendasiId,
          waktu: waktu.toISOString(),
          aktor: AKTOR_DEMO,
          ringkasan: entri.ringkasan,
          pilihan: entri.pilihan,
          sumber: entri.sumber,
        },
        ...state.log,
      ],
    })),
  catatAudit: (entri, waktu = new Date()) =>
    set((state) => ({
      log: [
        {
          ...entri,
          id: `${entri.referensiId}-${state.log.length + 1}`,
          waktu: waktu.toISOString(),
        },
        ...state.log,
      ],
    })),
  reset: () => set({ keputusan: {}, log: [] }),
}));

type DemoStore = {
  paksaGagalLlm: boolean;
  setPaksaGagalLlm: (aktif: boolean) => void;
};

export const useDemoStore = create<DemoStore>((set) => ({
  paksaGagalLlm: false,
  setPaksaGagalLlm: (aktif) => set({ paksaGagalLlm: aktif }),
}));
