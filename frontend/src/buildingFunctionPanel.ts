import p5 from "p5";
import { type BuildingFunction } from "./buildings";
import { parseCommands } from "../../shared/parseCommands";
import { applyCommands } from "../../shared/applyCommands";
import { drawFloor } from "../../shared/drawFloor";
import { BLOCK_SIZE } from "../../shared/constants";

let panelEl: HTMLElement | null = null;
let panelP5: p5 | null = null;

export function showBuildingFunction(name: string, code: string, fn: BuildingFunction, floorColor: [number, number, number]) {
  hideBuildingFunction();

  panelEl = document.createElement("div");
  panelEl.id = "building-function-panel";

  // Building preview canvas + name
  const header = document.createElement("div");
  header.className = "bf-header";

  const canvasContainer = document.createElement("div");
  canvasContainer.className = "bf-preview";
  header.appendChild(canvasContainer);

  const nameEl = document.createElement("div");
  nameEl.className = "bf-name";
  nameEl.textContent = name;
  header.appendChild(nameEl);

  panelEl.appendChild(header);

  // Function display: inputs = outputs
  const fnDisplay = document.createElement("div");
  fnDisplay.className = "bf-function";

  const inputsCol = document.createElement("div");
  inputsCol.className = "bf-col";
  for (const input of fn.inputs) {
    const row = document.createElement("div");
    row.textContent = `${input.name} ${input.value}`;
    inputsCol.appendChild(row);
  }
  fnDisplay.appendChild(inputsCol);

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  fnDisplay.appendChild(equalsEl);

  const outputsCol = document.createElement("div");
  outputsCol.className = "bf-col";
  for (const output of fn.outputs) {
    const row = document.createElement("div");
    row.textContent = `${output.name} ${output.value}`;
    outputsCol.appendChild(row);
  }
  fnDisplay.appendChild(outputsCol);

  panelEl.appendChild(fnDisplay);

  document.getElementById("canvas-container")!.appendChild(panelEl);

  // Render building preview
  const size = 120;
  panelP5 = new p5((p: p5) => {
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
      drawFloor(p, BLOCK_SIZE, floorColor);
      const commands = parseCommands(code);
      applyCommands(p, commands);
    };
  });
}

export function hideBuildingFunction() {
  if (panelP5) {
    panelP5.remove();
    panelP5 = null;
  }
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
}
