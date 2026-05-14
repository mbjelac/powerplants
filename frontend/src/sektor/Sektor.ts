export interface BuildingCreation {
  type: string;
  x: number;
  y: number;
}

export interface CreateBuildingResult {
  error: undefined | string;
  addedBuildings: BuildingCreation[];
}

export class Sektor {
  createBuilding(building: BuildingCreation): CreateBuildingResult {
    return {
      error: undefined,
      addedBuildings: [building],
    };
  }
}
