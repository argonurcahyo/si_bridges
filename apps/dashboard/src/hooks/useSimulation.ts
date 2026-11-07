import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSimulationStore } from "@/store/simulationStore";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import { BASELINE, runSimulation } from "@/services/simulationService";

const DEBOUNCE_MS = 300;

export function useSimulation() {
  const intensitasMmJam = useSimulationStore((state) => state.intensitasMmJam);
  const konversiLahanPersen = useSimulationStore((state) => state.konversiLahanPersen);

  const input = useMemo(
    () => ({ intensitasMmJam, konversiLahanPersen }),
    [intensitasMmJam, konversiLahanPersen],
  );
  const inputTertunda = useDebouncedValue(input, DEBOUNCE_MS);

  const jaringan = useMemo(() => {
    const network = loadNetwork();
    return { network, catchments: loadCatchments(network) };
  }, []);

  const simulasi = useQuery({
    queryKey: ["simulation", inputTertunda.intensitasMmJam, inputTertunda.konversiLahanPersen],
    queryFn: () => runSimulation(inputTertunda, jaringan.network, jaringan.catchments),
    staleTime: Number.POSITIVE_INFINITY,
    placeholderData: keepPreviousData,
  });

  const baseline = useQuery({
    queryKey: ["simulation", BASELINE.intensitasMmJam, BASELINE.konversiLahanPersen],
    queryFn: () => runSimulation(BASELINE, jaringan.network, jaringan.catchments),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const menunggu = simulasi.isFetching || input.intensitasMmJam !== inputTertunda.intensitasMmJam;

  return {
    network: jaringan.network,
    catchments: jaringan.catchments,
    hasil: simulasi.data,
    baseline: baseline.data,
    memuat: simulasi.isLoading,
    menunggu,
    galat: simulasi.isError,
    input,
  };
}
