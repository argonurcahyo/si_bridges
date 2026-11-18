import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { bandingkanOpsi, kelurahanToFeatureCollection, runPlanner } from "@/engine/planner";
import { bahasaAktif } from "@/i18n/teks";
import { buildPlannerNarrativeContext } from "@/services/llm/tasks/plannerNarrative";
import { loadKelurahan } from "@/services/kelurahanService";
import { usePlannerStore } from "@/store/plannerStore";

export function usePlanner() {
  const hujan24JamMm = usePlannerStore((state) => state.hujan24JamMm);
  const pasangMeter = usePlannerStore((state) => state.pasangMeter);
  const rthPersen = usePlannerStore((state) => state.rthPersen);
  const moratorium = usePlannerStore((state) => state.moratorium);

  const input = useMemo(
    () => ({ hujan24JamMm, pasangMeter, rthPersen, moratorium }),
    [hujan24JamMm, pasangMeter, rthPersen, moratorium],
  );

  const kelurahan = useQuery({
    queryKey: ["kelurahan"],
    queryFn: loadKelurahan,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const hasil = useMemo(
    () => (kelurahan.data ? runPlanner(kelurahan.data, input) : undefined),
    [kelurahan.data, input],
  );

  const dasar = useMemo(
    () =>
      kelurahan.data
        ? runPlanner(kelurahan.data, { ...input, rthPersen: 0, moratorium: false })
        : undefined,
    [kelurahan.data, input],
  );

  const opsi = useMemo(
    () => (kelurahan.data ? bandingkanOpsi(kelurahan.data, input) : []),
    [kelurahan.data, input],
  );

  const fitur = useMemo(
    () =>
      kelurahan.data && hasil ? kelurahanToFeatureCollection(kelurahan.data, hasil) : undefined,
    [kelurahan.data, hasil],
  );

  const narasiContext = useMemo(
    () =>
      hasil && dasar ? buildPlannerNarrativeContext(input, hasil, dasar, opsi, bahasaAktif) : null,
    [input, hasil, dasar, opsi],
  );

  return {
    input,
    hasil,
    dasar,
    opsi,
    fitur,
    narasiContext,
    kelurahan: kelurahan.data,
    memuat: kelurahan.isLoading,
    galat: kelurahan.isError,
  };
}
