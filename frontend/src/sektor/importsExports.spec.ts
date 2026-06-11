import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";
import { BuildingDefinition } from "./buildings/parseBuildingDefinitions";

const testDefinitions: BuildingDefinition[] = [
  {
    name: "Well",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [
        { name: "Energy", value: 8 },
        { name: "Work", value: 3 },
      ],
      outputs: [
        { name: "Water", value: 4 },
      ],
    },
    properties: {},
  },
  {
    name: "Farm",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [
        { name: "Water", value: 3 },
        { name: "Energy", value: 1 },
        { name: "Work", value: 5 },
      ],
      outputs: [
        { name: "Food", value: 5 },
      ],
    },
    properties: {},
  },
];

describe("getImportsExports", () => {
  it("returns empty imports and exports when there are no buildings", () => {
    const sektor = new Sektor([[50]], testDefinitions);

    const result = sektor.getImportsExports();

    expect(result).toEqual({
      imports: [],
      exports: [],
    });
  });

  it("returns imports and exports for a single building", () => {
    const sektor = new Sektor([[50]], testDefinitions);
    sektor.createBuilding({ type: "Well", x: 0, y: 0 });

    const result = sektor.getImportsExports();

    expect(result).toEqual({
      imports: [
        { name: "Energy", value: 8 },
        { name: "Work", value: 3 },
      ],
      exports: [
        { name: "Water", value: 4 },
      ],
    });
  });

  it("aggregates imports and exports by resource name across buildings", () => {
    const sektor = new Sektor([[50]], testDefinitions);
    sektor.createBuilding({ type: "Well", x: 0, y: 0 });
    sektor.createBuilding({ type: "Farm", x: 1, y: 0 });

    const result = sektor.getImportsExports();

    expect(result.imports).toEqual([
      { name: "Energy", value: 9 },
      { name: "Work", value: 8 },
      { name: "Water", value: 3 },
    ]);

    expect(result.exports).toEqual([
      { name: "Water", value: 4 },
      { name: "Food", value: 5 },
    ]);
  });
});
