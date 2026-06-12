
import { BuildingDefinition, BuildingFunction, ResourceThroughput } from "./buildings/parseBuildingDefinitions";

export interface ImportsExports {
  imports: ResourceThroughput[];
  exports: ResourceThroughput[];
}

export interface BuildingConnection {
  to: BuildingLocation;
  resourceType: string;
  amount: number;
}

export interface BuildingState {
  buildingFunction: BuildingFunction;
  imports: ResourceThroughput[];
  inputConnections: BuildingConnection[];
}

export interface BuildingLocation {
  x: number;
  y: number;
}

export interface BuildingCreation {
  type: string;
  location: BuildingLocation;
}

export interface PossibleConnection {
  location: BuildingLocation;
  totalOutput: number;
  remainingOutput: number;
}

export interface AddConnectionResult {
  success: boolean;
  error?: string;
}

interface Connection {
  target: BuildingLocation;
  source: BuildingLocation;
  resourceType: string;
  amount: number;
}

export interface CreateBuildingResult {
  error: undefined | string;
  addedBuildings: BuildingCreation[];
}

export type SoilFertilityMatrix = ReadonlyArray<ReadonlyArray<number>>;

export class Sektor {
  private buildings: BuildingCreation[] = [];
  private connections: Connection[] = [];
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
    const inputConnections = this.connections
      .filter(c => c.target.x === location.x && c.target.y === location.y)
      .map(c => ({ to: c.source, resourceType: c.resourceType, amount: c.amount }));
    const imports = def.buildingFunction.inputs.map(input => ({
      name: input.name,
      value: this.getRemainingImport(location, input.name),
    }));
    return {
      buildingFunction: def.buildingFunction,
      imports,
      inputConnections,
    };
  }

  getImportsExports(): ImportsExports {
    const imports = this.aggregateThroughputs(this.buildings.map(building => this.getInputs(building.type)).flat());
    const exports = this.aggregateThroughputs(this.buildings.map(building => this.getOutputs(building.type)).flat());

    for (const connection of this.connections) {
      const importEntry = imports.find(entry => entry.name === connection.resourceType);
      if (importEntry) importEntry.value -= connection.amount;
      const exportEntry = exports.find(entry => entry.name === connection.resourceType);
      if (exportEntry) exportEntry.value -= connection.amount;
    }

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

  private getRemainingImport(location: BuildingLocation, resourceType: string): number {
    const building = this.buildings.find(b => b.location.x === location.x && b.location.y === location.y);
    if (!building) return 0;
    const input = this.getInputs(building.type).find(i => i.name === resourceType);
    if (!input) return 0;
    const connectedAmount = this.connections
      .filter(c => c.target.x === location.x && c.target.y === location.y && c.resourceType === resourceType)
      .reduce((sum, c) => sum + c.amount, 0);
    return input.value - connectedAmount;
  }

  private getRemainingExport(location: BuildingLocation, resourceType: string): number {
    const building = this.buildings.find(b => b.location.x === location.x && b.location.y === location.y);
    if (!building) return 0;
    const output = this.getOutputs(building.type).find(o => o.name === resourceType);
    if (!output) return 0;
    const connectedAmount = this.connections
      .filter(c => c.source.x === location.x && c.source.y === location.y && c.resourceType === resourceType)
      .reduce((sum, c) => sum + c.amount, 0);
    return output.value - connectedAmount;
  }

  private isAlreadyConnected(target: BuildingLocation, source: BuildingLocation, resourceType: string): boolean {
    return this.connections.some(
      connection => connection.target.x === target.x && connection.target.y === target.y
        && connection.source.x === source.x && connection.source.y === source.y
        && connection.resourceType === resourceType
    );
  }

  private aggregateThroughputs(throughputs: ResourceThroughput[]): ResourceThroughput[] {
    const map = new Map<string, number>();
    for (const t of throughputs) {
      map.set(t.name, (map.get(t.name) ?? 0) + t.value);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  addConnection(target: BuildingLocation, source: BuildingLocation, resourceType: string): AddConnectionResult {
    const targetBuilding = this.buildings.find(b => b.location.x === target.x && b.location.y === target.y);
    if (!targetBuilding) return { success: false, error: "targetBuildingNotFound" };

    const sourceBuilding = this.buildings.find(b => b.location.x === source.x && b.location.y === source.y);
    if (!sourceBuilding) return { success: false, error: "sourceBuildingNotFound" };

    const targetInput = this.getInputs(targetBuilding.type).find(input => input.name === resourceType);
    if (!targetInput) return { success: false, error: "targetHasNoMatchingInput" };

    const sourceOutput = this.getOutputs(sourceBuilding.type).find(output => output.name === resourceType);
    if (!sourceOutput) return { success: false, error: "sourceHasNoMatchingOutput" };

    if (this.isAlreadyConnected(target, source, resourceType)) return { success: false, error: "alreadyConnected" };

    const remainingImport = this.getRemainingImport(target, resourceType);
    if (remainingImport <= 0) return { success: false, error: "targetInputFull" };

    const remainingOutput = this.getRemainingExport(source, resourceType);
    if (remainingOutput <= 0) return { success: false, error: "sourceOutputExhausted" };

    this.connections.push({ target, source, resourceType, amount: 1 });
    return { success: true };
  }

  getPossibleConnectionsForInput(target: BuildingLocation, resourceType: string): PossibleConnection[] {
    return this.buildings
      .filter(building => {
        if (building.location.x === target.x && building.location.y === target.y) return false;
        if (!this.getOutputs(building.type).some(output => output.name === resourceType)) return false;
        if (this.isAlreadyConnected(target, building.location, resourceType)) return false;
        return this.getRemainingExport(building.location, resourceType) > 0;
      })
      .map(building => ({
        location: building.location,
        totalOutput: this.getOutputs(building.type).find(output => output.name === resourceType)!.value,
        remainingOutput: this.getRemainingExport(building.location, resourceType),
      }));
  }

  createBuilding(building: BuildingCreation): CreateBuildingResult {
    if (this.buildings.some((existing) => existing.location.x === building.location.x && existing.location.y === building.location.y)) {
      return { error: "locationOccupied", addedBuildings: [] };
    }

    this.buildings.push(building);
    return { error: undefined, addedBuildings: [building] };
  }
}
