import { describe, it, expect } from "vitest";
import { parseBuildingDefinitions } from "./parseBuildingDefinitions";

describe("parseBuildingDefinitions", () => {
  it("returns empty array for empty input", () => {
    expect(parseBuildingDefinitions([])).toEqual([]);
  });

  it("returns empty array when there is no heading", () => {
    expect(parseBuildingDefinitions(["some text", "more text"])).toEqual([]);
  });

  it("returns empty array when heading has no code block", () => {
    expect(parseBuildingDefinitions(["# MyBuilding", "some text"])).toEqual([]);
  });

  it("parses a building with code only and no function", () => {
    const result = parseBuildingDefinitions([
      "# MyBuilding",
      "```",
      "box s(10,10,10)",
      "```",
    ]);

    expect(result).toEqual([{
      name: "MyBuilding",
      renderingCode: "box s(10,10,10)",
      buildingFunction: { inputs: [], outputs: [] },
      properties: {},
    }]);
  });

  it("parses rendering code with multiple lines", () => {
    const result = parseBuildingDefinitions([
      "# MyBuilding",
      "```",
      "box s(10,10,10)",
      "cyl s(5,5,5)",
      "```",
    ]);

    expect(result[0].renderingCode).toEqual("box s(10,10,10)\ncyl s(5,5,5)");
  });

  it("parses building function with inputs and outputs", () => {
    const result = parseBuildingDefinitions([
      "# Factory",
      "```",
      "box s(10,10,10)",
      "```",
      "Iron 3",
      "Coal 2",
      "=",
      "Steel 5",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [
        { name: "Iron", value: 3 },
        { name: "Coal", value: 2 },
      ],
      outputs: [
        { name: "Steel", value: 5 },
      ],
    });
  });

  it("parses building function with inputs only", () => {
    const result = parseBuildingDefinitions([
      "# Consumer",
      "```",
      "box s(10,10,10)",
      "```",
      "Water 5",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [{ name: "Water", value: 5 }],
      outputs: [],
    });
  });

  it("parses building function with outputs only", () => {
    const result = parseBuildingDefinitions([
      "# Source",
      "```",
      "box s(10,10,10)",
      "```",
      "=",
      "Energy 10",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [],
      outputs: [{ name: "Energy", value: 10 }],
    });
  });

  it("ignores blank lines in rendering code section", () => {
    const result = parseBuildingDefinitions([
      "# MyBuilding",
      "",
      "```",
      "box s(10,10,10)",
      "",
      "cyl s(5,5,5)",
      "```",
      "",
    ]);

    expect(result[0].renderingCode).toEqual("box s(10,10,10)\n\ncyl s(5,5,5)");
  });

  it("ignores blank lines in function section", () => {
    const result = parseBuildingDefinitions([
      "# Factory",
      "```",
      "box s(10,10,10)",
      "```",
      "",
      "Iron 3",
      "",
      "=",
      "",
      "Steel 5",
      "",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [{ name: "Iron", value: 3 }],
      outputs: [{ name: "Steel", value: 5 }],
    });
  });

  it("ignores lines that don't match resource format", () => {
    const result = parseBuildingDefinitions([
      "# Factory",
      "```",
      "box s(10,10,10)",
      "```",
      "some random text",
      "Iron 3",
      "=",
      "Steel 5",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [{ name: "Iron", value: 3 }],
      outputs: [{ name: "Steel", value: 5 }],
    });
  });

  it("parses showFloor=false property", () => {
    const result = parseBuildingDefinitions([
      "# Mine",
      "```",
      "box s(10,10,10)",
      "```",
      "Iron 3",
      "=",
      "Ore 5",
      "## Properties",
      "showFloor=false",
    ]);

    expect(result[0].properties).toEqual({ showFloor: false });
  });

  it("returns empty properties when no Properties section exists", () => {
    const result = parseBuildingDefinitions([
      "# Factory",
      "```",
      "box s(10,10,10)",
      "```",
    ]);

    expect(result[0].properties).toEqual({});
  });

  it("returns empty properties when Properties section has no recognized properties", () => {
    const result = parseBuildingDefinitions([
      "# Factory",
      "```",
      "box s(10,10,10)",
      "```",
      "## Properties",
      "unknownProp=true",
    ]);

    expect(result[0].properties).toEqual({});
  });

  it("ignores blank lines in properties section", () => {
    const result = parseBuildingDefinitions([
      "# Mine",
      "```",
      "box s(10,10,10)",
      "```",
      "## Properties",
      "",
      "showFloor=false",
      "",
    ]);

    expect(result[0].properties).toEqual({ showFloor: false });
  });

  it("parses multiple buildings", () => {
    const result = parseBuildingDefinitions([
      "# BuildingA",
      "```",
      "box s(1,1,1)",
      "```",
      "Water 2",
      "=",
      "Steam 1",
      "# BuildingB",
      "```",
      "cyl s(5,5,5)",
      "```",
      "Iron 4",
      "=",
      "Steel 3",
    ]);

    expect(result).toEqual([
      {
        name: "BuildingA",
        renderingCode: "box s(1,1,1)",
        buildingFunction: {
          inputs: [{ name: "Water", value: 2 }],
          outputs: [{ name: "Steam", value: 1 }],
        },
        properties: {},
      },
      {
        name: "BuildingB",
        renderingCode: "cyl s(5,5,5)",
        buildingFunction: {
          inputs: [{ name: "Iron", value: 4 }],
          outputs: [{ name: "Steel", value: 3 }],
        },
        properties: {},
      },
    ]);
  });

  it("trims whitespace from building name", () => {
    const result = parseBuildingDefinitions([
      "#   SpacedName  ",
      "```",
      "box s(1,1,1)",
      "```",
    ]);

    expect(result[0].name).toEqual("SpacedName");
  });

  it("properties section stops function line collection", () => {
    const result = parseBuildingDefinitions([
      "# Mine",
      "```",
      "box s(10,10,10)",
      "```",
      "Iron 3",
      "=",
      "Ore 5",
      "## Properties",
      "showFloor=false",
    ]);

    expect(result[0].buildingFunction).toEqual({
      inputs: [{ name: "Iron", value: 3 }],
      outputs: [{ name: "Ore", value: 5 }],
    });
  });
});
