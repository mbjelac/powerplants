import p5 from "p5";
import { parseCommands } from "../../../../shared/parseCommands";
import { applyCommands } from "../../../../shared/applyCommands";
import { drawFloor } from "../../../../shared/drawFloor";
import { BLOCK_SIZE } from "../../../../shared/constants";
import { createFunctionDisplay } from "../buildingFunctionDisplay.ui";
import { BuildingFunction, ResourceThroughput } from "./parseBuildingDefinitions";
import { BuildingLocation } from "../Sektor";

let panelEl: HTMLElement | null = null;
let previewP5: p5 | null = null;
let previewContainer: HTMLElement | null = null;
let currentDraw: { code: string; floorColor: [number, number, number] } | null = null;

function ensurePreviewP5(parent: HTMLElement) {
  if (previewP5) {
    // Re-parent the existing canvas
    parent.appendChild(previewP5.canvas.parentElement ?? previewP5.canvas);
    return;
  }

  const size = 120;
  previewP5 = new p5((p: p5) => {
    p.setup = () => {
      const canvas = p.createCanvas(size, size, p.WEBGL);
      canvas.parent(parent);
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
      if (!currentDraw) return;
      p.background(42);
      p.ambientLight(60);
      p.pointLight(255, 255, 255, 2 * BLOCK_SIZE, -3 * BLOCK_SIZE, -2 * BLOCK_SIZE);
      p.noStroke();

      p.translate(0, BLOCK_SIZE * 0.3, 0);
      drawFloor(p, BLOCK_SIZE, currentDraw.floorColor);
      const commands = parseCommands(currentDraw.code);
      applyCommands(p, commands);
    };
  });
}

export function showBuildingPanel({ name, code, buildingFunction, imports, floorColor, location, onAddInputConnection, onDestroy }: {
  name: string,
  code: string,
  buildingFunction: BuildingFunction,
  imports: ResourceThroughput[],
  floorColor: [number, number, number],
  location: BuildingLocation,
  onAddInputConnection?: (resourceType: string) => void,
  onDestroy?: () => void
}) {
  hideBuildingPanel();

  panelEl = document.createElement("div");
  panelEl.id = "building-panel";

  const topRow = document.createElement("div");
  topRow.className = "bf-top-row";

  const locationEl = document.createElement("div");
  locationEl.className = "bf-location";
  locationEl.textContent = `Location: ${location.x} , ${location.y}`;
  topRow.appendChild(locationEl);

  if (onDestroy) {
    const destroyButton = document.createElement("button");
    destroyButton.className = "bf-destroy";
    destroyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';
    destroyButton.addEventListener("click", onDestroy);
    topRow.appendChild(destroyButton);
  }

  panelEl.appendChild(topRow);

  // Building preview canvas + name
  const header = document.createElement("div");
  header.className = "bf-header";

  previewContainer = document.createElement("div");
  previewContainer.className = "bf-preview";
  header.appendChild(previewContainer);

  const nameEl = document.createElement("div");
  nameEl.className = "bf-name";
  nameEl.textContent = name;
  header.appendChild(nameEl);

  panelEl.appendChild(header);

  panelEl.appendChild(createFunctionDisplay({ buildingFunction: buildingFunction, imports: imports, onAddInputConnection: onAddInputConnection }));

  document.getElementById("canvas-container")!.appendChild(panelEl);

  // Set draw data and render
  currentDraw = { code, floorColor };
  ensurePreviewP5(previewContainer);
  previewP5!.redraw();
}

export function hideBuildingPanel() {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
  currentDraw = null;
}
