import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";
import { BuildingDefinition } from "./buildings/parseBuildingDefinitions";

const testDefinitions: BuildingDefinition[] = [
  {
    name: "Mill",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [{ name: "Wheat", value: 4 }],
      outputs: [{ name: "Flour", value: 3 }],
    },
    properties: {},
  },
];

describe("createBuilding", () => {
  it("creates building on free location", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });

    const result = sektor.createBuilding({ type: "Mill", location: { x: 8, y: 6 } });

    expect(result).toEqual({
      error: undefined,
      addedBuildings: [{ type: "Mill", location: { x: 8, y: 6 } }],
    });
  });

  it("does not create building on occupied location", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });

    sektor.createBuilding({ type: "Mill", location: { x: 8, y: 6 } });
    const result = sektor.createBuilding({ type: "Mill", location: { x: 8, y: 6 } });

    expect(result).toEqual({
      error: "locationOccupied",
      addedBuildings: [],
    });
  });
});
