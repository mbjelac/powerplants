import { Location, SektorData } from "../shared/sektorData";
import restrictionsRequirements from "./restrictions_requirements";

const GRID_SIZE = 10;
const PROPERTY_NAMES = ["soil", "groundwater", "ore", "insolation", "wind"];

function createSektor(): SektorData {
  return {
    locations: generateLocations(),
    importRestrictions: restrictionsRequirements.importRestrictions,
    exportRequirements: restrictionsRequirements.exportRequirements,
    buildings: [],
    connections: [],
  };
}

function generateLocations(): Location[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      properties: Object.fromEntries(
        PROPERTY_NAMES.map(name => [name, generatePropertyValue()])
      ),
    }))
  );
}

function generatePropertyValue(): number {
  return Math.round(Math.random() * 20) / 10;
}

console.log(JSON.stringify(createSektor(), null, 2));
