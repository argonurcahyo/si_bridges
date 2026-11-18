import { z } from "zod";

export const statusPeringatanSchema = z.enum([
  "draf",
  "disiarkan",
  "ditarik",
  "ditolak",
  "kedaluwarsa",
]);

export const levelPeringatanSchema = z.enum(["waspada", "siaga"]);
export const sumberPeringatanSchema = z.enum(["llm", "template"]);

export const peringatanSchema = z.object({
  id: z.string().min(1),
  wilayahKode: z.string().min(1),
  wilayahNama: z.string().min(1),
  nodeId: z.string().min(1),
  level: levelPeringatanSchema,
  debitKumulatifM3s: z.number().nonnegative(),
  kedalamanM: z.number().nonnegative().nullable(),
  estimasiTibaMenit: z.number().int().positive().nullable(),
  puncakJam: z.number().positive(),
  keyakinan: z.number().min(0).max(100),
  teksAwal: z.string().min(1),
  teksFinal: z.string().min(1),
  sumberNarasi: sumberPeringatanSchema,
  modelLabel: z.string().min(1),
  status: statusPeringatanSchema,
  dibuatPada: z.string().min(1),
  narasiDibuatPada: z.string().nullable().optional(),
  alasanFallback: z.enum(["timeout", "error", "validasi"]).nullable().optional(),
  disuntingPada: z.string().nullable().optional(),
  disiarkanPada: z.string().nullable().optional(),
  disiarkanOleh: z.string().nullable().optional(),
  ditarikPada: z.string().nullable().optional(),
  ditolakPada: z.string().nullable().optional(),
  kedaluwarsaPada: z.string().nullable().optional(),
  berlakuHingga: z.string().nullable().optional(),
  versiSimulasi: z.string().min(1),
});

export const indeksPeringatanSchema = z.object({
  diperbaruiPada: z.string().min(1),
  peringatan: z.array(peringatanSchema),
});

export type StatusPeringatan = z.infer<typeof statusPeringatanSchema>;
export type LevelPeringatan = z.infer<typeof levelPeringatanSchema>;
export type SumberPeringatan = z.infer<typeof sumberPeringatanSchema>;
export type Peringatan = z.infer<typeof peringatanSchema>;
export type IndeksPeringatan = z.infer<typeof indeksPeringatanSchema>;
