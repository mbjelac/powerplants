import buildingsMd from "../../assets/buildings.md?raw";
import testBuildingsMd from "../../assets/buildings.test.md?raw";
import { BuildingDefinition, parseBuildingDefinitions } from "./parseBuildingDefinitions";

const isTestMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get("test") === "true";
const source = isTestMode ? testBuildingsMd : buildingsMd;

export const buildingDefinitions: BuildingDefinition[] = parseBuildingDefinitions(source.split("\n"));
