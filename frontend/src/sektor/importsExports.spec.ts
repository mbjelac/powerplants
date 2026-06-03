import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";

describe("getImportsExports", () => {
  it("returns empty imports and exports when there are no buildings", () => {
    const sektor = new Sektor([[50]]);

    const result = sektor.getImportsExports();

    expect(result).toEqual({
      imports: [],
      exports: [],
    });
  });

  it("returns imports and exports for a single building", () => {
    const sektor = new Sektor([[50]]);
    sektor.createBuilding({ type: "WaterExtractor", x: 0, y: 0 });

    const result = sektor.getImportsExports();

    expect(result).toEqual({
      imports: [
        { name: "EnergyElectric", value: 8 },
        { name: "WorkTechnical", value: 3 },
      ],
      exports: [
        { name: "WaterPottable", value: 4 },
      ],
    });
  });

  it("aggregates imports and exports by resource name across buildings", () => {
    const sektor = new Sektor([[50]]);
    sektor.createBuilding({ type: "WaterExtractor", x: 0, y: 0 });
    sektor.createBuilding({ type: "Agriplot", x: 1, y: 0 });

    const result = sektor.getImportsExports();

    // WaterExtractor inputs: EnergyElectric 8, WorkTechnical 3
    // Agriplot inputs: WaterPottable 3, EnergyElectric 1, WorkTechnical 5
    expect(result.imports).toEqual([
      { name: "EnergyElectric", value: 9 },
      { name: "WorkTechnical", value: 8 },
      { name: "WaterPottable", value: 3 },
    ]);

    // WaterExtractor outputs: WaterPottable 4
    // Agriplot outputs: FoodRaw 5
    expect(result.exports).toEqual([
      { name: "WaterPottable", value: 4 },
      { name: "FoodRaw", value: 5 },
    ]);
  });
});
