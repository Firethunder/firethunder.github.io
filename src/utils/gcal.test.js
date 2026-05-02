import { describe, it, expect } from "vitest";
import { mergeGCalTermine } from "./gcal";

describe("gcal.js - Integration Logic", () => {
  it("mergeGCalTermine should prioritize external data and preserve IDs", () => {
    const local = [
      { id: 1, datum: "2026-05-10 19:00:00", name: "Alt", source: "manual" },
      { id: 2, datum: "2026-05-11 10:00:00", name: "Bleibt", source: "manual" }
    ];
    const external = [
      { datum: "2026-05-10 19:00:00", name: "Alt", source: "gcal", Gruppe: "Zug" }
    ];

    const merged = mergeGCalTermine(local, external);
    expect(merged).toHaveLength(2);
    expect(merged.find(m => m.id === 1).source).toBe("gcal");
    expect(merged.find(m => m.id === 1).Gruppe).toBe("Zug");
  });
});
