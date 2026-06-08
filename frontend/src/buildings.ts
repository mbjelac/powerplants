import buildingsMd from "./assets/buildings.md?raw";
import { BuildingFunction } from "./sektor/Sektor";

export type ResourceThroughput = { name: string; value: number };

export interface BuildingFunctionSpec {
  inputs: ResourceThroughput[];
  outputs: ResourceThroughput[];
}

export interface BuildingDefinition {
  name: string;
  renderingCode: string;
  buildingFunction: BuildingFunctionSpec | null;
}

function parseBuildingFunctionSpec(lines: string[]): BuildingFunctionSpec | null {
  const inputs: ResourceThroughput[] = [];
  const outputs: ResourceThroughput[] = [];
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
        renderingCode: codeLines.join("\n"),
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

export function getBuildingFunction(type: string): BuildingFunction | null {
  const def = buildingDefinitions.find(b => b.name === type);
  if (!def?.buildingFunction) return null;
  return {
    inputs: def.buildingFunction.inputs.map(i => ({ name: i.name, requiredValue: i.value, currentValue: 0 })),
    outputs: def.buildingFunction.outputs.map(o => ({ name: o.name, requiredValue: o.value, currentValue: 0 })),
  };
}
