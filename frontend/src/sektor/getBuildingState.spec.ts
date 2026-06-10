import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";
import { BuildingDefinition } from "./buildings/parseBuildingDefinitions";

const testDefinitions: BuildingDefinition[] = [
  {
    name: "Mill",
    renderingCode: "box s(1,1,1)",
    buildingFunction: {
      inputs: [
        { name: "Wheat", value: 4 },
        { name: "Energy", value: 2 },
      ],
      outputs: [
        { name: "Flour", value: 3 },
      ],
    },
    properties: {},
  },
];

describe("getBuildingState", () => {
  it("returns null when no building at location", () => {
    const sektor = new Sektor([[50]], testDefinitions);

    expect(sektor.getBuildingState(0, 0)).toEqual(null);
  });

  it("returns building function and imports for a placed building", () => {
    const sektor = new Sektor([[50]], testDefinitions);
    sektor.createBuilding({ type: "Mill", x: 3, y: 5 });

    const state = sektor.getBuildingState(3, 5);

    expect(state).toEqual({
      buildingFunction: {
        inputs: [
          { name: "Wheat", value: 4 },
          { name: "Energy", value: 2 },
        ],
        outputs: [
          { name: "Flour", value: 3 },
        ],
      },
      imports: [
        { name: "Wheat", value: 4 },
        { name: "Energy", value: 2 },
      ],
    });
  });
});
