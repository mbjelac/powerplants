import buildingsMd from "./assets/buildings.md?raw";

export interface BuildingDefinition {
  name: string;
  code: string;
}

export function loadBuildings(): BuildingDefinition[] {
  const buildings: BuildingDefinition[] = [];
  const lines = buildingsMd.split("\n");

  let currentName: string | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)/);
    if (headingMatch) {
      if (currentName && codeLines.length > 0) {
        buildings.push({ name: currentName, code: codeLines.join("\n") });
      }
      currentName = headingMatch[1].trim();
      codeLines = [];
      inCodeBlock = false;
      continue;
    }

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    }
  }

  if (currentName && codeLines.length > 0) {
    buildings.push({ name: currentName, code: codeLines.join("\n") });
  }

  return buildings;
}
