import { describe, it, expect } from "vitest";
import { calculateBoost } from "./calculateBoost";
import { Booster } from "./buildings/parseBuildingDefinitions";

describe("calculateBoost", () => {
  it("returns no boost when there are no boosters", () => {
    expect(calculateBoost([], [{ name: "Work", value: 3 }])).toEqual([]);
  });

  it("returns zero boost when booster input is not connected", () => {
    const boosters: Booster[] = [
      { input: { name: "Work", value: 5 }, outputBoost: [{ name: "Energy", value: 2 }] },
    ];

    expect(calculateBoost(boosters, [])).toEqual([
      { name: "Energy", value: 0 },
    ]);
  });

  it("multiplies connected input amount by boost factor", () => {
    const boosters: Booster[] = [
      { input: { name: "Work", value: 5 }, outputBoost: [{ name: "Energy", value: 2 }] },
    ];

    expect(calculateBoost(boosters, [{ name: "Work", value: 3 }])).toEqual([
      { name: "Energy", value: 6 },
    ]);
  });

  it("sums boosts to the same output from multiple boosters", () => {
    const boosters: Booster[] = [
      { input: { name: "Work", value: 5 }, outputBoost: [{ name: "Energy", value: 2 }] },
      { input: { name: "Sun", value: 4 }, outputBoost: [{ name: "Energy", value: 3 }] },
    ];

    expect(calculateBoost(boosters, [{ name: "Work", value: 2 }, { name: "Sun", value: 4 }])).toEqual([
      { name: "Energy", value: 16 },
    ]);
  });

  it("ignores connected amounts that do not match any booster input", () => {
    const boosters: Booster[] = [
      { input: { name: "Work", value: 5 }, outputBoost: [{ name: "Energy", value: 2 }] },
    ];

    expect(calculateBoost(boosters, [{ name: "Water", value: 10 }, { name: "Work", value: 1 }])).toEqual([
      { name: "Energy", value: 2 },
    ]);
  });
});
