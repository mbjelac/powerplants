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
    outputModifiers: [],
    properties: {},
  },
  {
    name: "Farm",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [{ name: "Water", value: 2 }],
      outputs: [{ name: "Wheat", value: 5 }],
    },
    outputModifiers: [],
    properties: {},
  },
];

describe("removeInputConnection", () => {
  it("removes an input connection", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Mill", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });
    sektor.addConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat");

    sektor.removeInputConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat");

    expect(sektor.getBuildingState({ x: 0, y: 0 })!.inputConnections).toEqual([]);
  });

  it("throws when removing a non-existing connection", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Mill", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });

    expect(() => sektor.removeInputConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat")).toThrowError("connectionNotFound");
  });
});
