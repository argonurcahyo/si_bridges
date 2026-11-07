import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { generateNarrative, susunSaran } from "@/services/llm";
import { idRekomendasi } from "@/services/llm/types";
import type { HydroNetwork } from "@/schemas/hydro";
import type { SimulationResult } from "@/services/simulationService";
import { useDemoStore } from "@/store/operatorStore";

export function useRecommendation(
  hasil: SimulationResult | undefined,
  network: HydroNetwork | undefined,
) {
  const paksaGagal = useDemoStore((state) => state.paksaGagalLlm);

  const input = useMemo(() => {
    if (!hasil || !network) return null;
    return { hasil, saran: susunSaran(hasil, network) };
  }, [hasil, network]);

  const query = useQuery({
    queryKey: ["narrative", input ? idRekomendasi(input.hasil) : "kosong", paksaGagal],
    queryFn: () =>
      generateNarrative(input!, {
        paksaGagal: () => useDemoStore.getState().paksaGagalLlm,
      }),
    enabled: input !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 0,
  });

  return { narasi: query.data, saran: input?.saran, memuat: query.isLoading };
}
