import p5 from "p5";

const BLOCK_SIZE = 100;

function drawLandBlock(p, s) {
  const h = s / 2;
  const height = s * 0.15;
  const green = [30, 200, 80];
  const brown = [180, 140, 90];
  const darkBrown = [100, 70, 40];

  // Top face (green)
  p.fill(...green);
  p.beginShape();
  p.vertex(-h, -height / 2, -h);
  p.vertex(h, -height / 2, -h);
  p.vertex(h, -height / 2, h);
  p.vertex(-h, -height / 2, h);
  p.endShape(p.CLOSE);

  // Bottom face
  p.fill(...brown);
  p.beginShape();
  p.vertex(-h, height / 2, -h);
  p.vertex(h, height / 2, -h);
  p.vertex(h, height / 2, h);
  p.vertex(-h, height / 2, h);
  p.endShape(p.CLOSE);

  // Front face (+z)
  p.fill(...darkBrown);
  p.beginShape();
  p.vertex(-h, -height / 2, h);
  p.vertex(h, -height / 2, h);
  p.vertex(h, height / 2, h);
  p.vertex(-h, height / 2, h);
  p.endShape(p.CLOSE);

  // Back face (-z)
  p.fill(...darkBrown);
  p.beginShape();
  p.vertex(-h, -height / 2, -h);
  p.vertex(h, -height / 2, -h);
  p.vertex(h, height / 2, -h);
  p.vertex(-h, height / 2, -h);
  p.endShape(p.CLOSE);

  // Left face (-x)
  p.fill(...darkBrown);
  p.beginShape();
  p.vertex(-h, -height / 2, -h);
  p.vertex(-h, -height / 2, h);
  p.vertex(-h, height / 2, h);
  p.vertex(-h, height / 2, -h);
  p.endShape(p.CLOSE);

  // Right face (+x)
  p.fill(...darkBrown);
  p.beginShape();
  p.vertex(h, -height / 2, -h);
  p.vertex(h, -height / 2, h);
  p.vertex(h, height / 2, h);
  p.vertex(h, height / 2, -h);
  p.endShape(p.CLOSE);
}

function parseTranslate(str) {
  const match = str.match(/t\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("pyr3")) {
    const rest = trimmed.slice(4).trim();
    const translate = rest ? parseTranslate(rest) : null;
    return { type: "pyr3", translate };
  }

  return null;
}

function parseCommands(text) {
  return text.split("\n").map(parseLine).filter((cmd) => cmd !== null);
}

function drawPyramid3(p, s) {
  const h = s / 2;
  const floorY = -(s * 0.15) / 2;
  const apexY = floorY - s;
  const r = h;

  const angle0 = -Math.PI / 2;
  const angle1 = angle0 + (2 * Math.PI) / 3;
  const angle2 = angle0 + (4 * Math.PI) / 3;

  const v0 = [r * Math.cos(angle0), floorY, r * Math.sin(angle0)];
  const v1 = [r * Math.cos(angle1), floorY, r * Math.sin(angle1)];
  const v2 = [r * Math.cos(angle2), floorY, r * Math.sin(angle2)];
  const apex = [0, apexY, 0];

  p.fill(160, 160, 160);

  // Base
  p.beginShape();
  p.vertex(...v0);
  p.vertex(...v1);
  p.vertex(...v2);
  p.endShape(p.CLOSE);

  // Side faces
  p.fill(140, 140, 140);
  p.beginShape();
  p.vertex(...v0);
  p.vertex(...v1);
  p.vertex(...apex);
  p.endShape(p.CLOSE);

  p.fill(120, 120, 120);
  p.beginShape();
  p.vertex(...v1);
  p.vertex(...v2);
  p.vertex(...apex);
  p.endShape(p.CLOSE);

  p.fill(100, 100, 100);
  p.beginShape();
  p.vertex(...v2);
  p.vertex(...v0);
  p.vertex(...apex);
  p.endShape(p.CLOSE);
}

const sketch = (p) => {
  let commands = [];

  p.setup = () => {
    const container = document.getElementById("canvas-container");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    p.ortho();

    const textarea = document.querySelector("#editor textarea");
    textarea.addEventListener("input", () => {
      commands = parseCommands(textarea.value);
    });
  };

  p.draw = () => {
    p.background(30);
    p.orbitControl();
    p.rotateX(-Math.PI / 4);
    p.rotateY(Math.PI / 4);
    p.stroke(150);
    drawLandBlock(p, BLOCK_SIZE);

    for (const cmd of commands) {
      if (cmd.type === "pyr3") {
        p.push();
        if (cmd.translate) {
          const scale = BLOCK_SIZE / 100;
          p.translate(
            cmd.translate[0] * scale,
            -cmd.translate[2] * scale,
            cmd.translate[1] * scale
          );
        }
        drawPyramid3(p, BLOCK_SIZE);
        p.pop();
      }
    }
  };
};

new p5(sketch);
