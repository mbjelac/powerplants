import p5 from "p5";
import {loadBuildings, type BuildingFunction} from "./buildings";
import {parseCommands} from "../../shared/parseCommands";
import {applyCommands} from "../../shared/applyCommands";
import {BLOCK_SIZE} from "../../shared/constants";

let selectedBuilding: string | null = null;
let buildingCodeMap: Map<string, string> = new Map();
let buildingFunctionMap: Map<string, BuildingFunction | null> = new Map();

export function getSelectedBuilding(): string | null {
  return selectedBuilding;
}

export function deselectBuilding(): void {
  selectedBuilding = null;
  document.querySelectorAll(".building-item").forEach((el) => el.classList.remove("selected"));
  hideToolbarFunctionPanel();
}

export function getBuildingCode(name: string): string | null {
  return buildingCodeMap.get(name) ?? null;
}

export function getBuildingFunction(name: string): BuildingFunction | null {
  return buildingFunctionMap.get(name) ?? null;
}

let toolbarFnPanel: HTMLElement | null = null;

function showToolbarFunctionPanel(fn: BuildingFunction, anchorEl: HTMLElement) {
  hideToolbarFunctionPanel();

  toolbarFnPanel = document.createElement("div");
  toolbarFnPanel.id = "toolbar-function-panel";

  const inputsCol = document.createElement("div");
  inputsCol.className = "bf-col";
  for (const input of fn.inputs) {
    const row = document.createElement("div");
    row.textContent = `${input.name} ${input.value}`;
    inputsCol.appendChild(row);
  }
  toolbarFnPanel.appendChild(inputsCol);

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  toolbarFnPanel.appendChild(equalsEl);

  const outputsCol = document.createElement("div");
  outputsCol.className = "bf-col";
  for (const output of fn.outputs) {
    const row = document.createElement("div");
    row.textContent = `${output.name} ${output.value}`;
    outputsCol.appendChild(row);
  }
  toolbarFnPanel.appendChild(outputsCol);

  document.body.appendChild(toolbarFnPanel);

  // Position to the right of the toolbar, at the anchor's vertical position
  const rect = anchorEl.getBoundingClientRect();
  const toolbar = document.getElementById("toolbar")!;
  const toolbarRect = toolbar.getBoundingClientRect();
  toolbarFnPanel.style.left = `${toolbarRect.right + 4}px`;
  toolbarFnPanel.style.top = `${rect.top}px`;
}

function hideToolbarFunctionPanel() {
  if (toolbarFnPanel) {
    toolbarFnPanel.remove();
    toolbarFnPanel = null;
  }
}

export function initToolbar() {
  const toolbar = document.getElementById("toolbar")!;
  const buildings = loadBuildings();

  for (const building of buildings) {
    buildingCodeMap.set(building.name, building.code);
    buildingFunctionMap.set(building.name, building.buildingFunction);
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
        hideToolbarFunctionPanel();
      } else {
        toolbar.querySelectorAll(".building-item").forEach((el) => el.classList.remove("selected"));
        selectedBuilding = building.name;
        item.classList.add("selected");
        if (building.buildingFunction) {
          showToolbarFunctionPanel(building.buildingFunction, item);
        }
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
