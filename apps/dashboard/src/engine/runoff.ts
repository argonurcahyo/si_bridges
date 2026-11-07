/**
 * Perhitungan limpasan sederhana (aproksimasi, bukan model hidrologi penuh).
 * Q = 0.00278 x C x I x A  (Rational Method, Q dalam m3/s, I mm/jam, A ha)
 * Semua konstanta adalah nilai mock yang perlu diganti saat model asli tersedia.
 */
export type KomposisiLulc = {
  terbangun: number;
  vegetasi: number;
  terbuka: number;
  badanAir: number;
};

export const C_VALUE: Record<keyof KomposisiLulc, number> = {
  terbangun: 0.9,
  terbuka: 0.5,
  vegetasi: 0.25,
  badanAir: 1.0,
};

const BATAS_C = { min: 0.05, max: 0.95 } as const;

function jepit(nilai: number, min: number, max: number) {
  return Math.min(max, Math.max(min, nilai));
}

/** Konversi lahan memindahkan sebagian area vegetasi menjadi terbangun. */
export function koefisienLimpasan(lulc: KomposisiLulc, konversiLahanPersen: number): number {
  const pindah = Math.min(lulc.vegetasi, Math.max(0, konversiLahanPersen) / 100);
  const terbangun = lulc.terbangun + pindah;
  const vegetasi = lulc.vegetasi - pindah;

  const c =
    terbangun * C_VALUE.terbangun +
    vegetasi * C_VALUE.vegetasi +
    lulc.terbuka * C_VALUE.terbuka +
    lulc.badanAir * C_VALUE.badanAir;

  return jepit(c, BATAS_C.min, BATAS_C.max);
}

export function debitLimpasan(cValue: number, intensitasMmJam: number, luasHa: number): number {
  return 0.00278 * cValue * intensitasMmJam * luasHa;
}
