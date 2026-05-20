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

  createBuilding(building: BuildingCreation): CreateBuildingResult {
    if (this.buildings.some((b) => b.x === building.x && b.y === building.y)) {
      return { error: "locationOccupied", addedBuildings: [] };
    }

    this.buildings.push(building);
    return { error: undefined, addedBuildings: [building] };
  }
}
