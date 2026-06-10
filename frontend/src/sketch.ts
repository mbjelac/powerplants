import p5 from "p5";
import {drawFloor} from "../../shared/drawFloor";
import {parseCommands} from "../../shared/parseCommands";
import {applyCommands} from "../../shared/applyCommands";
import {BLOCK_SIZE} from "../../shared/constants";
import {initToolbar, getSelectedBuilding, deselectBuilding, getBuildingCode} from "./toolbar";
import {Sektor} from "./sektor/Sektor";
import { buildingDefinitions } from "./buildings";
import {showBuildingFunctionSpec, hideBuildingFunctionSpec} from "./buildingFunctionPanel";
import {updateImportExportPanel} from "./importExportPanel";

const GRID_SIZE = 10;
const isTestMode = new URLSearchParams(window.location.search).get("test") === "true";

function createFertilityMatrix(gridSize: number): number[][] {
  if (isTestMode) {
    return Array.from({ length: gridSize }, (_, x) =>
      Array.from({ length: gridSize }, (_, z) => ((x * 17 + z * 31) % 101))
    );
  }
  return Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.floor(Math.random() * 101))
  );
}

const sektor = new Sektor(createFertilityMatrix(GRID_SIZE), buildingDefinitions);
const soilFertility = sektor.getSoilFertility();
const placedBuildings: { type: string; x: number; y: number; code: string }[] = [];
let errorTimeout: ReturnType<typeof setTimeout> | null = null;

// Interpolate between #E3CA86 (fertility 0) and #86E389 (fertility 100)
const COLOR_0: [number, number, number] = [0xE3, 0xCA, 0x86];
const COLOR_100: [number, number, number] = [0x86, 0xE3, 0x89];

function fertilityColor(value: number): [number, number, number] {
  const t = value / 100;
  return [
    Math.round(COLOR_0[0] + (COLOR_100[0] - COLOR_0[0]) * t),
    Math.round(COLOR_0[1] + (COLOR_100[1] - COLOR_0[1]) * t),
    Math.round(COLOR_0[2] + (COLOR_100[2] - COLOR_0[2]) * t),
  ];
}

const ZOOM = 1.2;

const HALF = BLOCK_SIZE / 2;
const FLOOR_HEIGHT = BLOCK_SIZE * 0.15;

function gridToWorld(gx: number, gy: number): { wx: number; wz: number } {
  return {
    wx: (gx - GRID_SIZE / 2 + 0.5) * BLOCK_SIZE,
    wz: (gy - GRID_SIZE / 2 + 0.5) * BLOCK_SIZE,
  };
}

function rayAABB(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  minX: number, minY: number, minZ: number,
  maxX: number, maxY: number, maxZ: number,
): number | null {
  let tmin = -Infinity;
  let tmax = Infinity;

  if (Math.abs(dx) < 1e-10) {
    if (ox < minX || ox > maxX) return null;
  } else {
    let t1 = (minX - ox) / dx;
    let t2 = (maxX - ox) / dx;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  if (Math.abs(dy) < 1e-10) {
    if (oy < minY || oy > maxY) return null;
  } else {
    let t1 = (minY - oy) / dy;
    let t2 = (maxY - oy) / dy;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  if (Math.abs(dz) < 1e-10) {
    if (oz < minZ || oz > maxZ) return null;
  } else {
    let t1 = (minZ - oz) / dz;
    let t2 = (maxZ - oz) / dz;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }

  return tmin;
}

// Read the current view matrix from p5's renderer (includes orbit transforms).
// The view matrix is column-major. World-space camera axes are rows of the 3x3 rotation part.
// The eye position is recovered by: eye = -R^T * t (where t is the translation column).
function getCameraBasis(p: p5): {
  eyeX: number; eyeY: number; eyeZ: number;
  rightX: number; rightY: number; rightZ: number;
  upX: number; upY: number; upZ: number;
  fwdX: number; fwdY: number; fwdZ: number;
} {
  const m = (p as any)._renderer.states.uViewMatrix.mat4;

  // Column-major layout: m[col*4 + row]
  // Row 0 of rotation = right axis
  const rX = m[0], rY = m[4], rZ = m[8];
  // Row 1 = up axis
  const uX = m[1], uY = m[5], uZ = m[9];
  // Row 2 = -forward axis (camera looks along -Z in view space)
  const fX = -m[2], fY = -m[6], fZ = -m[10];

  // Translation column
  const tx = m[12], ty = m[13], tz = m[14];

  // Eye = -R^T * t
  const eyeX = -(rX * tx + uX * ty + (-fX) * tz);
  const eyeY = -(rY * tx + uY * ty + (-fY) * tz);
  const eyeZ = -(rZ * tx + uZ * ty + (-fZ) * tz);

  return {
    eyeX, eyeY, eyeZ,
    rightX: rX, rightY: rY, rightZ: rZ,
    upX: uX, upY: uY, upZ: uZ,
    fwdX: fX, fwdY: fY, fwdZ: fZ,
  };
}

function findClickedTile(p: p5, currentZoom: number): { x: number; y: number } | null {
  const { eyeX, eyeY, eyeZ, rightX, rightY, rightZ, upX, upY, upZ, fwdX, fwdY, fwdZ } = getCameraBasis(p);

  const ndcX = (p.mouseX / p.width) * 2 - 1;
  const ndcY = (p.mouseY / p.height) * 2 - 1;

  const hw = p.width * currentZoom / 2;
  const hh = p.height * currentZoom / 2;

  const ox = eyeX + rightX * ndcX * hw + upX * ndcY * hh;
  const oy = eyeY + rightY * ndcX * hw + upY * ndcY * hh;
  const oz = eyeZ + rightZ * ndcX * hw + upZ * ndcY * hh;

  let bestT = Infinity;
  let bestTile: { x: number; y: number } | null = null;

  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      const { wx, wz } = gridToWorld(gx, gy);
      const t = rayAABB(
        ox, oy, oz,
        fwdX, fwdY, fwdZ,
        wx - HALF, -FLOOR_HEIGHT / 2, wz - HALF,
        wx + HALF, FLOOR_HEIGHT / 2, wz + HALF,
      );
      if (t !== null && t < bestT) {
        bestT = t;
        bestTile = { x: gx, y: gy };
      }
    }
  }

  return bestTile;
}

const CAM_DIST = 800;
const CAM_ELEVATION = Math.PI / 6;

const sketch = (p: p5) => {
  let camAngleY = Math.PI / 4;
  let camElevation = CAM_ELEVATION;
  let isDragging = false;
  let didDrag = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let zoom = ZOOM;

  function updateOrtho(container: HTMLElement) {
    const hw = container.offsetWidth * zoom / 2;
    const hh = container.offsetHeight * zoom / 2;
    p.ortho(-hw, hw, -hh, hh);
  }

  p.setup = () => {
    const container = document.getElementById("canvas-container")!;
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    updateOrtho(container);

    updateCamera(p);

    canvas.elt.addEventListener("mousedown", (e: MouseEvent) => {
      isDragging = true;
      didDrag = false;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    window.addEventListener("mouseup", () => { isDragging = false; });
    window.addEventListener("mousemove", (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      camAngleY -= dx * 0.005;
      camElevation += dy * 0.005;
      camElevation = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, camElevation));
      updateCamera(p);
    });
    canvas.elt.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();
      zoom *= e.deltaY > 0 ? 1.05 : 0.95;
      zoom = Math.max(0.3, Math.min(3, zoom));
      updateOrtho(container);
    }, { passive: false });
  };

  function updateCamera(p: p5) {
    const camX = CAM_DIST * Math.sin(camAngleY) * Math.cos(camElevation);
    const camY = -CAM_DIST * Math.sin(camElevation);
    const camZ = CAM_DIST * Math.cos(camAngleY) * Math.cos(camElevation);
    p.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
  }

  p.mouseReleased = () => {
    if (didDrag) return;

    const selected = getSelectedBuilding();

    const grid = findClickedTile(p, zoom);
    if (!grid) {
      hideBuildingFunctionSpec();
      return;
    }

    if (!selected) {
      // No building tool selected — check if there's a placed building to inspect
      const placed = placedBuildings.find(b => b.x === grid.x && b.y === grid.y);
      if (placed) {
        const def = buildingDefinitions.find(b => b.name === placed.type);
        if (def?.buildingFunction) {
          const code = getBuildingCode(placed.type);
          if (code) {
            const floorColor = fertilityColor(soilFertility[placed.x][placed.y]);
            showBuildingFunctionSpec(placed.type, code, def.buildingFunction, floorColor, { x: placed.x, y: placed.y });
          }
        }
      } else {
        hideBuildingFunctionSpec();
      }
      return;
    }

    const result = sektor.createBuilding({ type: selected, x: grid.x, y: grid.y });

    for (const building of result.addedBuildings) {
      const code = getBuildingCode(building.type);
      if (code) {
        placedBuildings.push({ type: building.type, x: building.x, y: building.y, code });
      }
    }

    if (result.error === undefined) {
      deselectBuilding();
      updateImportExportPanel(sektor.getImportsExports());
    }

    if (result.error !== undefined) {
      const errorEl = document.getElementById("error-message")!;
      errorEl.textContent = result.error;
      errorEl.style.display = "block";
      if (errorTimeout) clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        errorEl.style.display = "none";
      }, 5000);
    }
  };

  p.draw = () => {
    p.background(30);

    p.ambientLight(60);
    p.pointLight(255, 255, 255, 2 * BLOCK_SIZE, -3 * BLOCK_SIZE, -2 * BLOCK_SIZE);

    p.stroke(150, 150, 150, 80);

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const placed = placedBuildings.find(b => b.x === x && b.y === z);
        if (placed) {
          const def = buildingDefinitions.find(d => d.name === placed.type);
          if (def?.properties.showFloor === false) continue;
        }
        p.push();
        const { wx, wz } = gridToWorld(x, z);
        p.translate(wx, 0, wz);
        drawFloor(p, BLOCK_SIZE, fertilityColor(soilFertility[x][z]));
        p.pop();
      }
    }
    p.noStroke();
    for (const building of placedBuildings) {
      p.push();
      const { wx, wz } = gridToWorld(building.x, building.y);
      p.translate(wx, 0, wz);
      const commands = parseCommands(building.code);
      applyCommands(p, commands);
      p.pop();
    }

    document.getElementById("canvas-container")!.dataset.rendered = "true";
  };
};

new p5(sketch);
initToolbar();
