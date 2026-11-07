import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { riskLevel, type RiskLevel } from "@/engine/riskLevel";
import type { HydroNetwork } from "@/schemas/hydro";
import type { SimulationResult } from "@/services/simulationService";

export type NodeProperties = {
  id: string;
  nama: string;
  tipe: string;
  tmaMeter: number;
  debitM3s: number;
  level: RiskLevel;
};

export type EdgeProperties = {
  id: string;
  dari: string;
  ke: string;
  lagMenit: number;
};

export function nodesToFeatureCollection(
  network: HydroNetwork,
  hasil?: SimulationResult,
): FeatureCollection<Point, NodeProperties> {
  return {
    type: "FeatureCollection",
    features: network.nodes.map((node): Feature<Point, NodeProperties> => {
      const debit = hasil?.perNode.find((item) => item.nodeId === node.id);

      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [node.lng, node.lat] },
        properties: {
          id: node.id,
          nama: node.nama,
          tipe: node.tipe,
          tmaMeter: node.tmaMeter,
          debitM3s: Math.round(debit?.debitKumulatifM3s ?? 0),
          level:
            debit?.level ??
            riskLevel(node.tmaMeter, {
              ambangWaspadaMeter: node.ambangWaspadaMeter,
              ambangSiagaMeter: node.ambangSiagaMeter,
            }),
        },
      };
    }),
  };
}

export function edgesToFeatureCollection(
  network: HydroNetwork,
): FeatureCollection<LineString, EdgeProperties> {
  const posisi = new Map(network.nodes.map((node) => [node.id, [node.lng, node.lat]]));

  return {
    type: "FeatureCollection",
    features: network.edges.flatMap((edge): Feature<LineString, EdgeProperties>[] => {
      const dari = posisi.get(edge.dari);
      const ke = posisi.get(edge.ke);
      if (!dari || !ke) return [];

      return [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [dari, ke] },
          properties: {
            id: edge.id,
            dari: edge.dari,
            ke: edge.ke,
            lagMenit: edge.lagMenit,
          },
        },
      ];
    }),
  };
}
