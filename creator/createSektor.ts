import { SektorData } from "../shared/sektorData";
import restrictionsRequirements from "./restrictions_requirements";

function createSektor(): SektorData {
  return {
    importRestrictions: restrictionsRequirements.importRestrictions,
    exportRequirements: restrictionsRequirements.exportRequirements,
    buildings: [],
    connections: [],
  };
}

console.log(JSON.stringify(createSektor(), null, 2));
