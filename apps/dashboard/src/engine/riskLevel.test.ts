import { describe, expect, it } from "vitest";
import { riskLevel } from "./riskLevel";

const thresholds = { ambangWaspadaMeter: 3.0, ambangSiagaMeter: 4.0 };

describe("riskLevel", () => {
  it("mengembalikan aman di bawah ambang waspada", () => {
    expect(riskLevel(2.99, thresholds)).toBe("aman");
  });

  it("mengembalikan waspada tepat pada ambang waspada", () => {
    expect(riskLevel(3.0, thresholds)).toBe("waspada");
  });

  it("mengembalikan siaga tepat pada ambang siaga", () => {
    expect(riskLevel(4.0, thresholds)).toBe("siaga");
  });

  it("mengembalikan siaga di atas ambang siaga", () => {
    expect(riskLevel(5.2, thresholds)).toBe("siaga");
  });
});
