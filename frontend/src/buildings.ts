import buildingsMd from "./assets/buildings.md?raw";

export interface BuildingFunctionSpec {
  inputs: { name: string; value: number }[];
  outputs: { name: string; value: number }[];
}

export interface BuildingDefinition {
  name: string;
  code: string;
  buildingFunction: BuildingFunctionSpec | null;
}

function parseBuildingFunctionSpec(lines: string[]): BuildingFunctionSpec | null {
  const inputs: { name: string; value: number }[] = [];
  const outputs: { name: string; value: number }[] = [];
  let seenEquals = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === "=") {
      seenEquals = true;
      continue;
    }
    const match = trimmed.match(/^(\S+)\s+(\d+)$/);
    if (!match) continue;
    const entry = { name: match[1], value: parseInt(match[2]) };
    if (seenEquals) {
      outputs.push(entry);
    } else {
      inputs.push(entry);
    }
  }

  if (inputs.length === 0 && outputs.length === 0) return null;
  return { inputs, outputs };
}

function loadBuildings(): BuildingDefinition[] {
  const buildings: BuildingDefinition[] = [];
  const lines = buildingsMd.split("\n");

  let currentName: string | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let functionLines: string[] = [];
  let codeBlockDone = false;

  function pushBuilding() {
    if (currentName && codeLines.length > 0) {
      buildings.push({
        name: currentName,
        code: codeLines.join("\n"),
        buildingFunction: parseBuildingFunctionSpec(functionLines),
      });
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)/);
    if (headingMatch) {
      pushBuilding();
      currentName = headingMatch[1].trim();
      codeLines = [];
      functionLines = [];
      inCodeBlock = false;
      codeBlockDone = false;
      continue;
    }

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        codeBlockDone = true;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    } else if (codeBlockDone) {
      functionLines.push(line);
    }
  }

  pushBuilding();

  return buildings;
}

export const buildingDefinitions: BuildingDefinition[] = loadBuildings();
