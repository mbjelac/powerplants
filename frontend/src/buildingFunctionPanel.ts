import p5 from "p5";
import { type BuildingFunction } from "./buildings";
import { parseCommands } from "../../shared/parseCommands";
import { applyCommands } from "../../shared/applyCommands";
import { drawFloor } from "../../shared/drawFloor";
import { BLOCK_SIZE } from "../../shared/constants";
import { createFunctionDisplay } from "./functionDisplay";

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

export function showBuildingFunction(name: string, code: string, fn: BuildingFunction, floorColor: [number, number, number]) {
  hideBuildingFunction();

  panelEl = document.createElement("div");
  panelEl.id = "building-function-panel";

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

  panelEl.appendChild(createFunctionDisplay(fn));

  document.getElementById("canvas-container")!.appendChild(panelEl);

  // Set draw data and render
  currentDraw = { code, floorColor };
  ensurePreviewP5(previewContainer);
  previewP5!.redraw();
}

export function hideBuildingFunction() {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
  currentDraw = null;
}
