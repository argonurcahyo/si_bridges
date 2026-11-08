import { describe, expect, it } from "vitest";
import {
  bandingkanOpsi,
  hitungKedalamanM,
  levelKedalaman,
  runPlanner,
  type KelurahanFeature,
} from "@/engine/planner";

const prop = {
  kode: "TEST",
  kelurahan: "Uji",
  kecamatan: "Uji",
  kota: "Kota Uji",
  provinsi: "Dki Jakarta",
  luasHa: 200,
  jarakSungaiM: 300,
  rw: 10,
};

const fitur: KelurahanFeature[] = [
  {
    type: "Feature",
    properties: prop,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [106.8, -6.2],
          [106.81, -6.2],
          [106.81, -6.21],
          [106.8, -6.2],
        ],
      ],
    },
  },
];

const dasar = { hujan24JamMm: 120, pasangMeter: 0, rthPersen: 0, moratorium: false };

describe("hitungKedalamanM", () => {
  it("naik saat hujan bertambah", () => {
    const rendah = hitungKedalamanM(prop, dasar);
    const tinggi = hitungKedalamanM(prop, { ...dasar, hujan24JamMm: 240 });
    expect(tinggi).toBeGreaterThan(rendah);
  });

  it("turun saat RTH bertambah", () => {
    const tanpa = hitungKedalamanM(prop, dasar);
    const rth = hitungKedalamanM(prop, { ...dasar, rthPersen: 30 });
    expect(rth).toBeLessThan(tanpa);
  });

  it("naik saat pasang bertambah", () => {
    const tanpa = hitungKedalamanM(prop, dasar);
    const pasang = hitungKedalamanM(prop, { ...dasar, pasangMeter: 1 });
    expect(pasang).toBeGreaterThan(tanpa);
  });

  it("lebih dalam untuk kelurahan dekat sungai", () => {
    const dekat = hitungKedalamanM(prop, dasar);
    const jauh = hitungKedalamanM({ ...prop, jarakSungaiM: 2500 }, dasar);
    expect(dekat).toBeGreaterThan(jauh);
  });
});

describe("levelKedalaman", () => {
  it("memakai ambang waspada dan siaga", () => {
    expect(levelKedalaman(0.2)).toBe("aman");
    expect(levelKedalaman(0.6)).toBe("waspada");
    expect(levelKedalaman(1.2)).toBe("siaga");
  });
});

describe("runPlanner", () => {
  it("menghasilkan ringkasan yang konsisten", () => {
    const hasil = runPlanner(fitur, dasar);
    const total = Math.round(
      hasil.perKelurahan.reduce((jumlah, item) => jumlah + item.luasGenanganHa, 0),
    );
    expect(hasil.perKelurahan).toHaveLength(1);
    expect(hasil.ringkasan.luasGenanganHa).toBe(total);
    expect(hasil.ringkasan.jumlahAman + hasil.ringkasan.jumlahWaspada + hasil.ringkasan.jumlahSiaga).toBe(1);
  });

  it("skenario RTH menurunkan luas genangan dibanding dasar", () => {
    const input = { ...dasar, hujan24JamMm: 150, rthPersen: 30 };
    const opsi = bandingkanOpsi(fitur, input);
    const dasarOpsi = opsi.find((item) => item.nama === "Dasar");
    const gabungan = opsi.find((item) => item.nama === "Gabungan");
    expect(dasarOpsi && gabungan).toBeTruthy();
    expect(gabungan!.luasGenanganHa).toBeLessThan(dasarOpsi!.luasGenanganHa);
    expect(opsi).toHaveLength(4);
  });
});
