import { z } from "zod";

export const kelurahanPropertiesSchema = z.object({
  kode: z.string().min(1),
  kelurahan: z.string().min(1),
  kecamatan: z.string().min(1),
  kota: z.string().min(1),
  provinsi: z.string().min(1),
  luasHa: z.number().positive(),
  jarakSungaiM: z.number().nonnegative(),
  rw: z.number().int().nonnegative(),
});

export type KelurahanPropertiesData = z.infer<typeof kelurahanPropertiesSchema>;
