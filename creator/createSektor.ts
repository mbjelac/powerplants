import { SektorData } from "../shared/sektorData";
import restrictionsRequirements from "./restrictions_requirements";

const GRID_SIZE = 10;
const PROPERTY_NAMES = ["soil", "groundwater", "ore", "insolation", "wind"];

function createSektor(): SektorData {
  return {
    locationProperties: generateLocationProperties(),
    importRestrictions: restrictionsRequirements.importRestrictions,
    exportRequirements: restrictionsRequirements.exportRequirements,
    buildings: [],
    connections: [],
  };
}

function generateLocationProperties(): { [key: string]: number[][] } {
  return Object.fromEntries(
    PROPERTY_NAMES.map(name => [name, generatePropertyMatrix()])
  );
}

function generatePropertyMatrix(): number[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => generatePropertyValue())
  );
}

function generatePropertyValue(): number {
  return Math.round(Math.random() * 20) / 10;
}

console.log(formatSektorData(createSektor()));

function formatSektorData(sektorData: SektorData): string {
  return JSON.stringify(sektorData, null, 2).replace(
    /\[[\s\d.,]+\]/g,
    numberArray => numberArray.replace(/\s+/g, " ").replace(/\[ /, "[").replace(/ \]/, "]")
  );
}
