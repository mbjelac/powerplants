import { ResourceThroughput } from "./buildings/parseBuildingDefinitions";
import { BuildingCreation, Connection } from "./Sektor";

export interface SektorData {
  importRestrictions: ResourceThroughput[];
  exportRequirements: ResourceThroughput[];
  buildings: BuildingCreation[];
  connections: Connection[];
}

export function getSektorData(name: string): SektorData | null {
  const stored = localStorage.getItem(`sektor_${name}`);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function saveSektorData(name: string, data: SektorData): void {
  localStorage.setItem(`sektor_${name}`, JSON.stringify(data));
}
