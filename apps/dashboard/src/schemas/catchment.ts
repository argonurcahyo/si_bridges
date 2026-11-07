import { z } from "zod";
import { dataStatusSchema } from "./hydro";

export const lulcSchema = z
  .object({
    terbangun: z.number().min(0).max(1),
    vegetasi: z.number().min(0).max(1),
    terbuka: z.number().min(0).max(1),
    badanAir: z.number().min(0).max(1),
  })
  .refine(
    (lulc) => Math.abs(lulc.terbangun + lulc.vegetasi + lulc.terbuka + lulc.badanAir - 1) < 0.01,
    { message: "Komposisi lahan harus berjumlah 1" },
  );

export const catchmentSchema = z.object({
  nodeId: z.string().min(1),
  luasHa: z.number().positive(),
  terpengaruhKonversi: z.boolean().default(false),
  lulc: lulcSchema,
  ambangWaspadaM3s: z.number().positive(),
  ambangSiagaM3s: z.number().positive(),
});

export const catchmentCollectionSchema = z.object({
  keterangan: z.string(),
  status: dataStatusSchema,
  catchments: z.array(catchmentSchema).min(1),
});

export type Catchment = z.infer<typeof catchmentSchema>;
export type CatchmentCollection = z.infer<typeof catchmentCollectionSchema>;
