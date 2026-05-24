import p5 from "p5";
import {loadBuildings} from "./buildings";
import {parseCommands} from "../../shared/parseCommands";
import {applyCommands} from "../../shared/applyCommands";
import {BLOCK_SIZE} from "../../shared/constants";

let selectedBuilding: string | null = null;
let buildingCodeMap: Map<string, string> = new Map();

export function getSelectedBuilding(): string | null {
  return selectedBuilding;
}

export function deselectBuilding(): void {
  selectedBuilding = null;
  document.querySelectorAll(".building-item").forEach((el) => el.classList.remove("selected"));
}

export function getBuildingCode(name: string): string | null {
  return buildingCodeMap.get(name) ?? null;
}

export function initToolbar() {
  const toolbar = document.getElementById("toolbar")!;
  const buildings = loadBuildings();

  for (const building of buildings) {
    buildingCodeMap.set(building.name, building.code);
  }

  for (const building of buildings) {
    const item = document.createElement("div");
    item.className = "building-item";
    item.dataset.buildingName = building.name;

    const canvasContainer = document.createElement("div");
    item.appendChild(canvasContainer);

    const label = document.createElement("div");
    label.className = "building-name";
    label.textContent = building.name;
    item.appendChild(label);

    item.addEventListener("click", () => {
      if (selectedBuilding === building.name) {
        selectedBuilding = null;
        item.classList.remove("selected");
      } else {
        toolbar.querySelectorAll(".building-item").forEach((el) => el.classList.remove("selected"));
        selectedBuilding = building.name;
        item.classList.add("selected");
      }
    });

    toolbar.appendChild(item);

    const size = 100;
    new p5((p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(size, size, p.WEBGL);
        canvas.parent(canvasContainer);
        const viewSize = size / 0.7;
        p.ortho(-viewSize / 2, viewSize / 2, -viewSize / 2, viewSize / 2);

        const camDist = 800;
        const camAngleY = Math.PI / 4;
        const camAngleX = Math.PI / 6;
        const camX = camDist * Math.sin(camAngleY) * Math.cos(camAngleX);
        const camY = -camDist * Math.sin(camAngleX);
        const camZ = camDist * Math.cos(camAngleY) * Math.cos(camAngleX);
        p.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
        p.noLoop();
      };

      p.draw = () => {
        p.background(42);
        p.ambientLight(60);
        p.pointLight(255, 255, 255, 2 * BLOCK_SIZE, -3 * BLOCK_SIZE, -2 * BLOCK_SIZE);
        p.noStroke();

        p.translate(0, BLOCK_SIZE * 0.3, 0);
        const commands = parseCommands(building.code);
        applyCommands(p, commands);
      };
    });
  }
}
