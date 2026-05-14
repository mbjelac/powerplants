import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";

describe("createBuilding", () => {
  it("creates building on free location", () => {
    const sektor = new Sektor();

    const result = sektor.createBuilding({ type: "WaterPump", x: 8, y: 6 });

    expect(result).toEqual({
      error: undefined,
      addedBuildings: [{ type: "WaterPump", x: 8, y: 6 }],
    });
  });
});
