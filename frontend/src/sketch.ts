import p5 from "p5";
import {drawFloor} from "../../shared/drawFloor";
import {parseCommands} from "../../shared/parseCommands";
import {applyCommands} from "../../shared/applyCommands";
import {BLOCK_SIZE} from "../../shared/constants";

const sketch = (p: p5) => {
  p.setup = () => {
    const container = document.getElementById("canvas-container")!;
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    p.ortho();

    const camDist = 800;
    const camAngleY = Math.PI / 4;
    const camAngleX = Math.PI / 4;
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

    drawFloor(p, BLOCK_SIZE);

    const commands = parseCommands("");
    applyCommands(p, commands);

    document.getElementById("canvas-container")!.dataset.rendered = "true";
  };
};

new p5(sketch);
