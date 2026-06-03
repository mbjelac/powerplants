import { buildingDefinitions, ResourceThroughput } from "../buildings";

export interface BuildingFunctionEntry {
  name: string;
  requiredValue: number;
  currentValue: number;
}

export interface BuildingFunction {
  inputs: BuildingFunctionEntry[];
  outputs: BuildingFunctionEntry[];
}

export interface ImportsExports {
  imports: ResourceThroughput[];
  exports: ResourceThroughput[];
}

export interface BuildingCreation {
  type: string;
  x: number;
  y: number;
}

export interface CreateBuildingResult {
  error: undefined | string;
  addedBuildings: BuildingCreation[];
}

export type SoilFertilityMatrix = ReadonlyArray<ReadonlyArray<number>>;

export class Sektor {
  private buildings: BuildingCreation[] = [];
  private readonly soilFertility: SoilFertilityMatrix;

  constructor(soilFertility: SoilFertilityMatrix) {
    this.soilFertility = soilFertility;
  }

  getSoilFertility(): SoilFertilityMatrix {
    return this.soilFertility;
  }

  getBuildingFunction(type: string): BuildingFunction | null {
    const def = buildingDefinitions.find(b => b.name === type);
    if (!def?.buildingFunction) return null;
    return {
      inputs: def.buildingFunction.inputs.map(i => ({ name: i.name, requiredValue: i.value, currentValue: 0 })),
      outputs: def.buildingFunction.outputs.map(o => ({ name: o.name, requiredValue: o.value, currentValue: 0 })),
    };
  }

  getImportsExports(): ImportsExports {
    return { imports: [], exports: [] };
  }

  createBuilding(building: BuildingCreation): CreateBuildingResult {
    if (this.buildings.some((b) => b.x === building.x && b.y === building.y)) {
      return { error: "locationOccupied", addedBuildings: [] };
    }

    this.buildings.push(building);
    return { error: undefined, addedBuildings: [building] };
  }
}
