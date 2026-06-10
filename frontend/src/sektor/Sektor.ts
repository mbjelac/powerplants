import { BuildingDefinition, ResourceThroughput } from "../buildings";

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
  private readonly buildingDefinitions: BuildingDefinition[];

  constructor(soilFertility: SoilFertilityMatrix, buildingDefinitions: BuildingDefinition[]) {
    this.soilFertility = soilFertility;
    this.buildingDefinitions = buildingDefinitions;
  }

  getSoilFertility(): SoilFertilityMatrix {
    return this.soilFertility;
  }

  getImportsExports(): ImportsExports {
    const imports = this.aggregateThroughputs(this.buildings.map(b => this.getInputs(b.type)).flat());
    const exports = this.aggregateThroughputs(this.buildings.map(b => this.getOutputs(b.type)).flat());
    return { imports, exports };
  }

  private getInputs(type: string): ResourceThroughput[] {
    const def = this.buildingDefinitions.find(b => b.name === type);
    return def?.buildingFunction?.inputs ?? [];
  }

  private getOutputs(type: string): ResourceThroughput[] {
    const def = this.buildingDefinitions.find(b => b.name === type);
    return def?.buildingFunction?.outputs ?? [];
  }

  private aggregateThroughputs(throughputs: ResourceThroughput[]): ResourceThroughput[] {
    const map = new Map<string, number>();
    for (const t of throughputs) {
      map.set(t.name, (map.get(t.name) ?? 0) + t.value);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  createBuilding(building: BuildingCreation): CreateBuildingResult {
    if (this.buildings.some((b) => b.x === building.x && b.y === building.y)) {
      return { error: "locationOccupied", addedBuildings: [] };
    }

    this.buildings.push(building);
    return { error: undefined, addedBuildings: [building] };
  }
}
