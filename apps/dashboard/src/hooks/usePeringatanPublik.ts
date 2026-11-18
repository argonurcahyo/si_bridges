import { useEffect, useMemo, useRef, useState } from "react";
import { AKTOR_DEMO } from "@/lib/constants";
import type { IndeksPeringatan, Peringatan } from "@/schemas/peringatan";
import {
  bacaIndeks,
  daftarPeringatanAktif,
  kedaluwarsakanPeringatan,
  langgananPublikasi,
} from "@/services/publicationService";
import { useOperatorStore } from "@/store/operatorStore";

export function usePeringatanPublik(): {
  indeks: IndeksPeringatan;
  aktif: ReturnType<typeof daftarPeringatanAktif>;
} {
  const [indeks, setIndeks] = useState<IndeksPeringatan>(() => bacaIndeks());
  const sudahDicatat = useRef(new Set<string>());

  useEffect(() => {
    const segarkan = () => setIndeks(bacaIndeks());
    const batalLangganan = langgananPublikasi(segarkan);

    const catatKedaluwarsa = (daftar: Peringatan[]) => {
      for (const item of daftar) {
        if (sudahDicatat.current.has(item.id)) continue;
        sudahDicatat.current.add(item.id);
        useOperatorStore.getState().catatAudit(
          {
            jenis: "peringatan_kedaluwarsa",
            referensiId: item.id,
            aktor: AKTOR_DEMO,
            ringkasan: `${item.wilayahNama}: kedaluwarsa`,
          },
          item.kedaluwarsaPada ? new Date(item.kedaluwarsaPada) : new Date(),
        );
      }
    };

    catatKedaluwarsa(kedaluwarsakanPeringatan());
    segarkan();

    // Perbarui juga saat peringatan melewati TTL tanpa aksi operator.
    const timer =
      typeof window === "undefined"
        ? null
        : window.setInterval(() => {
            catatKedaluwarsa(kedaluwarsakanPeringatan());
            segarkan();
          }, 60_000);

    return () => {
      batalLangganan();
      if (timer !== null) window.clearInterval(timer);
    };
  }, []);

  const aktif = useMemo(() => daftarPeringatanAktif(indeks), [indeks]);

  return { indeks, aktif };
}
