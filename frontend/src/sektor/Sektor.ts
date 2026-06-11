
import { BuildingDefinition, BuildingFunction, ResourceThroughput } from "./buildings/parseBuildingDefinitions";

export interface ImportsExports {
  imports: ResourceThroughput[];
  exports: ResourceThroughput[];
}

export interface BuildingState {
  buildingFunction: BuildingFunction;
  imports: ResourceThroughput[];
}

export interface BuildingLocation {
  x: number;
  y: number;
}

export interface BuildingCreation {
  type: string;
  location: BuildingLocation;
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

  getBuildingState(location: BuildingLocation): BuildingState | null {
    const building = this.buildings.find(b => b.location.x === location.x && b.location.y === location.y);
    if (!building) return null;
    const def = this.buildingDefinitions.find(b => b.name === building.type);
    if (!def) return null;
    return {
      buildingFunction: def.buildingFunction,
      imports: def.buildingFunction.inputs.map(i => ({ name: i.name, value: i.value })),
    };
  }

  getImportsExports(): ImportsExports {
    const imports = this.aggregateThroughputs(this.buildings.map(building => this.getInputs(building.type)).flat());
    const exports = this.aggregateThroughputs(this.buildings.map(building => this.getOutputs(building.type)).flat());
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

  getPossibleConnectionsForInput(target: BuildingLocation, resourceType: string): BuildingLocation[] {
    return this.buildings
      .filter(building => {
        if (building.location.x === target.x && building.location.y === target.y) return false;
        return this.getOutputs(building.type).some(output => output.name === resourceType);
      })
      .map(building => building.location);
  }

  createBuilding(building: BuildingCreation): CreateBuildingResult {
    if (this.buildings.some((existing) => existing.location.x === building.location.x && existing.location.y === building.location.y)) {
      return { error: "locationOccupied", addedBuildings: [] };
    }

    this.buildings.push(building);
    return { error: undefined, addedBuildings: [building] };
  }
}
