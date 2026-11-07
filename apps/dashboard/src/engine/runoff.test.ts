import { describe, expect, it } from "vitest";
import { debitLimpasan, koefisienLimpasan, type KomposisiLulc } from "./runoff";

const lulc: KomposisiLulc = { terbangun: 0.4, vegetasi: 0.4, terbuka: 0.18, badanAir: 0.02 };

describe("koefisienLimpasan", () => {
  it("menghitung rata-rata tertimbang komposisi lahan", () => {
    const c = koefisienLimpasan(lulc, 0);
    expect(c).toBeCloseTo(0.4 * 0.9 + 0.4 * 0.25 + 0.18 * 0.5 + 0.02 * 1, 6);
  });

  it("naik saat vegetasi dikonversi menjadi terbangun", () => {
    expect(koefisienLimpasan(lulc, 20)).toBeGreaterThan(koefisienLimpasan(lulc, 0));
  });

  it("tidak melebihi batas atas saat konversi 100 persen", () => {
    const c = koefisienLimpasan({ ...lulc, vegetasi: 0.4 }, 40);
    expect(c).toBeLessThanOrEqual(0.95);
  });

  it("mengabaikan konversi negatif", () => {
    expect(koefisienLimpasan(lulc, -10)).toBeCloseTo(koefisienLimpasan(lulc, 0), 6);
  });
});

describe("debitLimpasan", () => {
  it("mengikuti Q = 0.00278 x C x I x A", () => {
    expect(debitLimpasan(0.5, 60, 1000)).toBeCloseTo(0.00278 * 0.5 * 60 * 1000, 6);
  });

  it("bernilai nol saat tidak ada hujan", () => {
    expect(debitLimpasan(0.5, 0, 1000)).toBe(0);
  });
});
