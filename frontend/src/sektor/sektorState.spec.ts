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

describe("getSektorState", () => {
  it("returns empty imports and exports when there are no buildings", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });

    const result = sektor.getSektorState();

    expect(result).toEqual({
      imports: [],
      exports: [],
      status: "Done",
      importRestrictions: [],
      exportRequirements: [],
    });
  });

  it("returns imports and exports for a single building", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Well", location: { x: 0, y: 0 } });

    const result = sektor.getSektorState();

    expect(result).toEqual({
      imports: [
        { name: "Energy", value: 8 },
        { name: "Work", value: 3 },
      ],
      exports: [
        { name: "Water", value: 4 },
      ],
      status: "Done",
      importRestrictions: [],
      exportRequirements: [],
    });
  });

  it("aggregates imports and exports by resource name across buildings", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Well", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });

    const result = sektor.getSektorState();

    expect(result).toEqual({
      imports: [
        { name: "Energy", value: 9 },
        { name: "Work", value: 8 },
        { name: "Water", value: 3 },
      ],
      exports: [
        { name: "Water", value: 4 },
        { name: "Food", value: 5 },
      ],
      status: "Done",
      importRestrictions: [],
      exportRequirements: [],
    });
  });

  it("decreases imports and exports when a connection is added", () => {
    const sektor = new Sektor([[50]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Well", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });

    sektor.addConnection({ x: 1, y: 0 }, { x: 0, y: 0 }, "Water");

    const result = sektor.getSektorState();

    expect(result).toEqual({
      imports: [
        { name: "Energy", value: 9 },
        { name: "Work", value: 8 },
        { name: "Water", value: 2 },
      ],
      exports: [
        { name: "Water", value: 3 },
        { name: "Food", value: 5 },
      ],
      status: "Done",
      importRestrictions: [],
      exportRequirements: [],
    });
  });
});
