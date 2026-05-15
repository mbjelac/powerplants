import p5 from "p5";
import {drawFloor} from "../../shared/drawFloor";
import {BLOCK_SIZE} from "../../shared/constants";
import {initToolbar} from "./toolbar";

const GRID_SIZE = 10;

const sketch = (p: p5) => {
  p.setup = () => {
    const container = document.getElementById("canvas-container")!;
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    const zoom = 1.2;
    const hw = container.offsetWidth * zoom / 2;
    const hh = container.offsetHeight * zoom / 2;
    p.ortho(-hw, hw, -hh, hh);

    const camDist = 800;
    const camAngleY = Math.PI / 4;
    const camAngleX = Math.PI / 6;
    const camX = camDist * Math.sin(camAngleY) * Math.cos(camAngleX);
    const camY = -camDist * Math.sin(camAngleX);
    const camZ = camDist * Math.cos(camAngleY) * Math.cos(camAngleX);
    p.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
  };

  p.draw = () => {
    p.background(30);

    p.ambientLight(60);
    p.pointLight(255, 255, 255, 2 * BLOCK_SIZE, -3 * BLOCK_SIZE, -2 * BLOCK_SIZE);

    p.orbitControl();
    p.stroke(150);

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        p.push();
        p.translate(
          (x - GRID_SIZE / 2 + 0.5) * BLOCK_SIZE,
          0,
          (z - GRID_SIZE / 2 + 0.5) * BLOCK_SIZE,
        );
        drawFloor(p, BLOCK_SIZE);
        p.pop();
      }
    }

    document.getElementById("canvas-container")!.dataset.rendered = "true";
  };
};

new p5(sketch);
initToolbar();
