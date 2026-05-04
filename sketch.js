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

const sketch = (p) => {
  p.setup = () => {
    const container = document.getElementById("canvas-container");
    const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);
    canvas.parent(container);
    p.ortho();
  };

  p.draw = () => {
    p.background(30);
    p.orbitControl();
    p.stroke(150);
    drawLandBlock(p, BLOCK_SIZE);
  };
};

new p5(sketch);
