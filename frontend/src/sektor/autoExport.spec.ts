import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";
import { BuildingDefinition } from "./buildings/parseBuildingDefinitions";

const testDefinitions: BuildingDefinition[] = [
  {
    name: "Reservoir",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [],
      outputs: [{ name: "Water", value: 5 }],
    },
    outputModifiers: [],
    boosters: [],
    properties: { autoExport: false },
  },
  {
    name: "Spring",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [],
      outputs: [{ name: "Water", value: 5 }],
    },
    outputModifiers: [],
    boosters: [],
    properties: {},
  },
];

describe("autoExport", () => {
  it("does not count excess output of an autoExport=false building towards sektor exports", () => {
    const sektor = new Sektor([[{ properties: {} }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Reservoir", location: { x: 0, y: 0 } });

    expect(sektor.getSektorState().exports).toEqual([]);
  });

  it("counts excess output towards sektor exports when autoExport is not set", () => {
    const sektor = new Sektor([[{ properties: {} }]], testDefinitions, { importRestrictions: [], exportRequirements: [] });
    sektor.createBuilding({ type: "Spring", location: { x: 0, y: 0 } });

    expect(sektor.getSektorState().exports).toEqual([
      { name: "Water", value: 5 },
    ]);
  });
});
