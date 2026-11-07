import { create } from "zustand";
import type { NarrativeSource } from "@/services/llm/types";

export type PilihanOperator = "diterima" | "ditolak" | "perlu_verifikasi";

export type LogKeputusan = {
  id: string;
  rekomendasiId: string;
  pilihan: PilihanOperator;
  waktu: string;
  sumber: NarrativeSource;
  ringkasan: string;
};

type OperatorStore = {
  keputusan: Record<string, PilihanOperator>;
  log: LogKeputusan[];
  catat: (entri: Omit<LogKeputusan, "id" | "waktu">, waktu?: Date) => void;
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
          ...entri,
          id: `${entri.rekomendasiId}-${state.log.length + 1}`,
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
