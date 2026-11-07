/**
 * Skor keyakinan mock. Nilai diturunkan dari seberapa ekstrem input skenario,
 * karena skenario ekstrem berada di luar rentang kalibrasi data historis.
 * Bukan probabilitas statistik. Harus dijelaskan di UI.
 */
export function hitungKeyakinan(intensitasMmJam: number, konversiLahanPersen: number): number {
  let skor = 93;

  if (intensitasMmJam > 150) skor -= 6;
  if (intensitasMmJam > 180) skor -= 4;
  if (konversiLahanPersen >= 30) skor -= 3;
  if (intensitasMmJam === 0) skor -= 2;

  return Math.min(98, Math.max(60, skor));
}

export const AMBANG_KEYAKINAN_RENDAH = 85;
