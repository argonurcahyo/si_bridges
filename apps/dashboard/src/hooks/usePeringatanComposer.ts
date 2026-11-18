import { useCallback, useRef, useState } from "react";
import { bahasaAktif } from "@/i18n/teks";
import type { Peringatan } from "@/schemas/peringatan";
import {
  generatePeringatanPublik,
  konteksPeringatan,
  type HasilPeringatan,
} from "@/services/llm/tasks/peringatanPublik";
import { useDemoStore } from "@/store/operatorStore";

type StatusNarasi = {
  hasil?: HasilPeringatan;
  memuat: boolean;
};

export function usePeringatanComposer() {
  const [status, setStatus] = useState<Record<string, StatusNarasi>>({});
  const sedang = useRef(new Set<string>());

  const compose = useCallback(async (item: Peringatan): Promise<HasilPeringatan | undefined> => {
    if (sedang.current.has(item.id)) return undefined;
    sedang.current.add(item.id);

    setStatus((sebelum) => ({
      ...sebelum,
      [item.id]: { ...sebelum[item.id], memuat: true },
    }));

    try {
      const hasil = await generatePeringatanPublik(konteksPeringatan(item, bahasaAktif), {
        paksaGagal: () => useDemoStore.getState().paksaGagalLlm,
      });
      setStatus((sebelum) => ({
        ...sebelum,
        [item.id]: { hasil, memuat: false },
      }));
      return hasil;
    } catch {
      setStatus((sebelum) => ({
        ...sebelum,
        [item.id]: { ...sebelum[item.id], memuat: false },
      }));
      return undefined;
    } finally {
      sedang.current.delete(item.id);
    }
  }, []);

  return { status, compose };
}
