/**
 * Proyeksi volume kumulatif 1-6 jam ke depan.
 * Memakai hidrograf sintetis: naik sampai waktu puncak, lalu resesi eksponensial.
 * Aproksimasi untuk demo, bukan hasil model hidrodinamika.
 */
export type TitikProyeksi = {
  jam: number;
  volumeJutaM3: number;
  batasBawahJutaM3: number;
  batasAtasJutaM3: number;
};

const LANGKAH_MENIT = 5;
const RESESI_MENIT = 120;

function debitPadaMenit(debitPuncak: number, waktuPuncakMenit: number, menit: number): number {
  if (menit <= 0) return 0;
  if (menit <= waktuPuncakMenit) {
    return debitPuncak * Math.pow(menit / Math.max(1, waktuPuncakMenit), 1.5);
  }
  return debitPuncak * Math.exp(-(menit - waktuPuncakMenit) / RESESI_MENIT);
}

export function proyeksiVolume(
  debitPuncakM3s: number,
  waktuPuncakMenit: number,
  keyakinanPersen: number,
  horizonJam = 6,
): TitikProyeksi[] {
  const ketidakpastian = (100 - keyakinanPersen) / 100;
  const hasil: TitikProyeksi[] = [];

  for (let jam = 1; jam <= horizonJam; jam += 1) {
    let volumeM3 = 0;
    const hinggaMenit = jam * 60;

    for (let menit = 0; menit < hinggaMenit; menit += LANGKAH_MENIT) {
      const q1 = debitPadaMenit(debitPuncakM3s, waktuPuncakMenit, menit);
      const q2 = debitPadaMenit(debitPuncakM3s, waktuPuncakMenit, menit + LANGKAH_MENIT);
      volumeM3 += ((q1 + q2) / 2) * (LANGKAH_MENIT * 60);
    }

    const juta = volumeM3 / 1_000_000;
    hasil.push({
      jam,
      volumeJutaM3: Number(juta.toFixed(3)),
      batasBawahJutaM3: Number((juta * (1 - ketidakpastian * 0.35)).toFixed(3)),
      batasAtasJutaM3: Number((juta * (1 + ketidakpastian * 0.35)).toFixed(3)),
    });
  }

  return hasil;
}
