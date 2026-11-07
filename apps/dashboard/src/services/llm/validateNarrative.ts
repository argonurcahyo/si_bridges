import type { SimulationResult } from "@/services/simulationService";
import type { Saran } from "./saran";

/** Angka yang dikenal dari hasil simulasi dan rencana saran. */
export function angkaDiizinkan(hasil: SimulationResult, saran: Saran): Set<number> {
  const izin = new Set<number>();

  const tambah = (nilai: number) => izin.add(Number(nilai.toFixed(2)));

  tambah(hasil.intensitasMmJam);
  tambah(hasil.konversiLahanPersen);
  tambah(hasil.keyakinan);
  tambah(saran.persenBukaan);
  tambah(saran.menit);

  for (let jam = 1; jam <= 6; jam += 1) tambah(jam);

  for (const node of hasil.perNode) {
    tambah(Math.round(node.debitKumulatifM3s));
    tambah(Math.round(node.debitLokalM3s));
  }

  for (const titik of hasil.proyeksi) {
    tambah(titik.volumeJutaM3);
    tambah(titik.batasBawahJutaM3);
    tambah(titik.batasAtasJutaM3);
  }

  return izin;
}

/** Mengubah angka berformat Indonesia ("4.385", "12,5") menjadi number. */
export function parseAngkaIndonesia(token: string): number {
  if (/^\d{1,3}(\.\d{3})+$/.test(token)) {
    return Number(token.replace(/\./g, ""));
  }
  return Number(token.replace(",", "."));
}

export function ekstrakAngka(teks: string): number[] {
  const token = teks.match(/\d+(?:[.,]\d+)?/g) ?? [];
  return token.map(parseAngkaIndonesia).filter((angka) => Number.isFinite(angka));
}

/**
 * FR-R5: setiap angka dalam narasi harus berasal dari hasil simulasi.
 * Mengembalikan daftar angka yang tidak dikenal (kosong berarti lolos).
 */
export function validateNarrative(teks: string, hasil: SimulationResult, saran: Saran): number[] {
  const izin = angkaDiizinkan(hasil, saran);
  return ekstrakAngka(teks).filter((angka) => {
    const dibulatkan = Number(angka.toFixed(2));
    if (izin.has(dibulatkan)) return false;

    // Toleransi untuk angka yang dibulatkan ke bilangan bulat.
    return ![...izin].some((nilai) => Math.abs(nilai - dibulatkan) < 0.5);
  });
}
