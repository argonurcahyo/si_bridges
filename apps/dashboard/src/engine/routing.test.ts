import { describe, expect, it } from "vitest";
import { akumulasiDebit, levelDebit } from "./routing";

const edges = [
  { dari: "a", ke: "b" },
  { dari: "b", ke: "c" },
  { dari: "x", ke: "c" },
];

describe("akumulasiDebit", () => {
  it("menjumlahkan debit hulu sampai hilir", () => {
    const lokal = new Map([
      ["a", 10],
      ["b", 5],
      ["x", 2],
      ["c", 1],
    ]);
    const hasil = akumulasiDebit(["a", "b", "x", "c"], edges, lokal);

    expect(hasil.get("a")).toBe(10);
    expect(hasil.get("b")).toBe(15);
    expect(hasil.get("c")).toBe(18);
  });

  it("memakai nol untuk node tanpa debit lokal", () => {
    const hasil = akumulasiDebit(["a", "b"], [{ dari: "a", ke: "b" }], new Map([["a", 7]]));
    expect(hasil.get("b")).toBe(7);
  });

  it("tidak berputar tanpa akhir pada data siklik", () => {
    const siklik = [
      { dari: "a", ke: "b" },
      { dari: "b", ke: "a" },
    ];
    expect(() => akumulasiDebit(["a", "b"], siklik, new Map([["a", 1]]))).not.toThrow();
  });
});

describe("levelDebit", () => {
  const ambang = { ambangWaspadaM3s: 100, ambangSiagaM3s: 150 };

  it("aman di bawah ambang waspada", () => {
    expect(levelDebit(99, ambang)).toBe("aman");
  });

  it("waspada mulai ambang waspada", () => {
    expect(levelDebit(100, ambang)).toBe("waspada");
  });

  it("siaga mulai ambang siaga", () => {
    expect(levelDebit(150, ambang)).toBe("siaga");
  });
});
