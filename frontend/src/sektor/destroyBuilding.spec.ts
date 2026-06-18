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

describe("destroyBuilding", () => {
  it("fails when no building at location", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });

    const result = sektor.destroyBuilding({ x: 0, y: 0 });

    expect(result).toEqual({ success: false, error: "buildingNotFound" });
  });

  it("removes building and its connections and updates imports/exports", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Mill", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });
    sektor.addConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat");

    const result = sektor.destroyBuilding({ x: 0, y: 0 });

    expect(result).toEqual({ success: true });
    expect(sektor.getBuildingState({ x: 0, y: 0 })).toEqual(null);
    expect(sektor.getSektorState()).toEqual({
      imports: [
        { name: "Water", value: 2 },
      ],
      exports: [
        { name: "Wheat", value: 5 },
      ],
      status: "Done",
      importRestrictions: [],
      exportRequirements: [],
    });
  });

  it("removes connections where destroyed building is target", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Mill", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Mill", location: { x: 2, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });
    sektor.addConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat");
    sektor.addConnection({ x: 2, y: 0 }, { x: 1, y: 0 }, "Wheat");

    sektor.destroyBuilding({ x: 0, y: 0 });

    expect(sektor.getBuildingState({ x: 2, y: 0 })!.inputConnections).toEqual([
      { to: { x: 1, y: 0 }, resourceType: "Wheat", amount: 1 },
    ]);
  });

  it("removes connections where destroyed building is source", () => {
    const sektor = new Sektor([[{ properties: { soil: 1.0 } }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Mill", location: { x: 0, y: 0 } });
    sektor.createBuilding({ type: "Farm", location: { x: 1, y: 0 } });
    sektor.addConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, "Wheat");

    sektor.destroyBuilding({ x: 1, y: 0 });

    expect(sektor.getBuildingState({ x: 0, y: 0 })!.inputConnections).toEqual([]);
  });
});
