import catchmentsJson from "@/data/catchments.json";
import type { HydroNetwork } from "@/schemas/hydro";
import { catchmentCollectionSchema, type Catchment } from "@/schemas/catchment";

export function loadCatchments(network: HydroNetwork): Catchment[] {
  const collection = catchmentCollectionSchema.parse(catchmentsJson);
  const nodeIds = new Set(network.nodes.map((node) => node.id));

  for (const catchment of collection.catchments) {
    if (!nodeIds.has(catchment.nodeId)) {
      throw new Error(`Catchment mengacu ke node yang tidak ada: ${catchment.nodeId}`);
    }
  }

  return collection.catchments;
}
