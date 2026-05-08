import p5 from "p5";
import {drawFloor} from "./drawFloor";
import {readCommands} from "./readCommands";
import {applyCommands} from "./applyCommands";
import {BLOCK_SIZE} from "./constants";
import {initEditorPanel} from "./editor/editorPanel";

const sketch = (p: p5) => {
  let wireframeOn = true;

  p.setup = () => {
    const container = document.getElementById("canvas-container")!;
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    p.ortho();

    const toggle = document.getElementById("wireframe-toggle")!;
    toggle.addEventListener("click", () => {
      wireframeOn = !wireframeOn;
      toggle.classList.toggle("on", wireframeOn);
    });
  };

  p.draw = () => {
    p.background(30);
    p.orbitControl();
    p.rotateX(-Math.PI / 4);
    p.rotateY(Math.PI / 4);
    if (wireframeOn) {
      p.stroke(150);
    } else {
      p.noStroke();
    }
    drawFloor(p, BLOCK_SIZE);

    const commands = readCommands();
    applyCommands(p, commands);

    document.getElementById("canvas-container")!.dataset.rendered = "true";
  };
};

new p5(sketch);
initEditorPanel();
