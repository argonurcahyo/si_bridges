import networkJson from "@/data/network.json";
import { hydroNetworkSchema, type HydroNetwork } from "@/schemas/hydro";

export function loadNetwork(): HydroNetwork {
  return hydroNetworkSchema.parse(networkJson);
}
