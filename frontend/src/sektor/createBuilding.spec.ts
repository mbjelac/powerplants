import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";

const aBuildingType = "WellField";

describe("createBuilding", () => {
  it("creates building on free location", () => {
    const sektor = new Sektor([[50]]);

    const result = sektor.createBuilding({ type: aBuildingType, x: 8, y: 6 });

    expect(result).toEqual({
      error: undefined,
      addedBuildings: [{ type: aBuildingType, x: 8, y: 6 }],
    });
  });

  it("does not create building on occupied location", () => {
    const sektor = new Sektor([[50]]);

    sektor.createBuilding({ type: aBuildingType, x: 8, y: 6 });
    const result = sektor.createBuilding({ type: aBuildingType, x: 8, y: 6 });

    expect(result).toEqual({
      error: "locationOccupied",
      addedBuildings: [],
    });
  });
});
