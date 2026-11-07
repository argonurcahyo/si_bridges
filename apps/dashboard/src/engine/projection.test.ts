import { describe, expect, it } from "vitest";
import { hitungKeyakinan } from "./confidence";
import { proyeksiVolume } from "./projection";

describe("proyeksiVolume", () => {
  it("menghasilkan satu titik per jam sesuai horizon", () => {
    const hasil = proyeksiVolume(500, 120, 90, 6);
    expect(hasil).toHaveLength(6);
    expect(hasil.map((titik) => titik.jam)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("volume kumulatif selalu bertambah", () => {
    const hasil = proyeksiVolume(500, 120, 90, 6);
    for (let i = 1; i < hasil.length; i += 1) {
      expect(hasil[i]!.volumeJutaM3).toBeGreaterThan(hasil[i - 1]!.volumeJutaM3);
    }
  });

  it("pita keyakinan mengapit nilai tengah", () => {
    const [titik] = proyeksiVolume(500, 120, 80, 1);
    expect(titik!.batasBawahJutaM3).toBeLessThan(titik!.volumeJutaM3);
    expect(titik!.batasAtasJutaM3).toBeGreaterThan(titik!.volumeJutaM3);
  });

  it("bernilai nol saat debit puncak nol", () => {
    const hasil = proyeksiVolume(0, 120, 93, 3);
    expect(hasil.every((titik) => titik.volumeJutaM3 === 0)).toBe(true);
  });
});

describe("hitungKeyakinan", () => {
  it("turun saat intensitas sangat tinggi", () => {
    expect(hitungKeyakinan(190, 0)).toBeLessThan(hitungKeyakinan(60, 0));
  });

  it("selalu berada di rentang 60 sampai 98", () => {
    for (const intensitas of [0, 60, 120, 200]) {
      const skor = hitungKeyakinan(intensitas, 30);
      expect(skor).toBeGreaterThanOrEqual(60);
      expect(skor).toBeLessThanOrEqual(98);
    }
  });
});
