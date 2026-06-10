import buildingsMd from "./assets/buildings.md?raw";
import { BuildingFunction } from "./sektor/Sektor";

export type ResourceThroughput = { name: string; value: number };

export interface BuildingFunctionSpec {
  inputs: ResourceThroughput[];
  outputs: ResourceThroughput[];
}

export interface BuildingProperties {
  showFloor?: boolean;
}

export interface BuildingDefinition {
  name: string;
  renderingCode: string;
  buildingFunction: BuildingFunctionSpec | null;
  properties: BuildingProperties;
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

function parseProperties(lines: string[]): BuildingProperties {
  const props: BuildingProperties = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\w+)=(.+)$/);
    if (!match) continue;
    if (match[1] === "showFloor" && match[2] === "false") {
      props.showFloor = false;
    }
  }
  return props;
}

function loadBuildings(): BuildingDefinition[] {
  const buildings: BuildingDefinition[] = [];
  const lines = buildingsMd.split("\n");

  let currentName: string | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let functionLines: string[] = [];
  let propertyLines: string[] = [];
  let codeBlockDone = false;
  let inProperties = false;

  function pushBuilding() {
    if (currentName && codeLines.length > 0) {
      buildings.push({
        name: currentName,
        renderingCode: codeLines.join("\n"),
        buildingFunction: parseBuildingFunctionSpec(functionLines),
        properties: parseProperties(propertyLines),
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
      propertyLines = [];
      inCodeBlock = false;
      codeBlockDone = false;
      inProperties = false;
      continue;
    }

    if (line.match(/^##\s+Properties/)) {
      inProperties = true;
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
    } else if (inProperties) {
      propertyLines.push(line);
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
