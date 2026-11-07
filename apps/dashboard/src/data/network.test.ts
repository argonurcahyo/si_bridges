import { describe, expect, it } from "vitest";
import { loadNetwork } from "@/services/networkService";

describe("data jaringan mock", () => {
  it("lolos validasi skema dan memuat node serta edge", () => {
    const network = loadNetwork();

    expect(network.nodes.length).toBeGreaterThan(0);
    expect(network.edges.length).toBeGreaterThan(0);
  });

  it("setiap data mock diberi label status mock", () => {
    const network = loadNetwork();

    for (const node of network.nodes) expect(node.status).toBe("mock");
    for (const edge of network.edges) expect(edge.status).toBe("mock");
  });
});
