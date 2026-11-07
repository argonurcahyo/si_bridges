import { z } from "zod";

export const nodeTypeSchema = z.enum(["pintu_air", "penampungan", "sensor"]);
export const dataStatusSchema = z.enum(["open_data", "sintetis", "mock"]);

export const hydroNodeSchema = z.object({
  id: z.string().min(1),
  nama: z.string().min(1),
  tipe: nodeTypeSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  tmaMeter: z.number().nonnegative(),
  ambangWaspadaMeter: z.number().nonnegative(),
  ambangSiagaMeter: z.number().nonnegative(),
  sumber: z.string().min(1),
  status: dataStatusSchema,
});

export const hydroEdgeSchema = z.object({
  id: z.string().min(1),
  dari: z.string().min(1),
  ke: z.string().min(1),
  panjangKm: z.number().positive(),
  lagMenit: z.number().int().nonnegative(),
  sumber: z.string().min(1),
  status: dataStatusSchema,
});

export const hydroNetworkSchema = z
  .object({
    nodes: z.array(hydroNodeSchema).min(1),
    edges: z.array(hydroEdgeSchema),
  })
  .superRefine((network, ctx) => {
    const nodeIds = new Set(network.nodes.map((node) => node.id));

    if (nodeIds.size !== network.nodes.length) {
      ctx.addIssue({ code: "custom", message: "ID node harus unik" });
    }

    network.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.dari) || !nodeIds.has(edge.ke)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index],
          message: `Edge ${edge.id} mengacu ke node yang tidak ada`,
        });
      }
    });
  });

export type HydroNode = z.infer<typeof hydroNodeSchema>;
export type HydroEdge = z.infer<typeof hydroEdgeSchema>;
export type HydroNetwork = z.infer<typeof hydroNetworkSchema>;
export type DataStatus = z.infer<typeof dataStatusSchema>;
