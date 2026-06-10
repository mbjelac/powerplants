import buildingsMd from "../../assets/buildings.md?raw";
import { BuildingDefinition, parseBuildingDefinitions } from "./parseBuildingDefinitions";

export const buildingDefinitions: BuildingDefinition[] = parseBuildingDefinitions(buildingsMd.split("\n"));
