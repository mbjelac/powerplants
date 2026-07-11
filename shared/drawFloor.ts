import p5 from "p5";

export function drawFloor(p: p5, s: number, topColor?: [number, number, number], sideColor?: [number, number, number]) {
  const h = s / 2;
  const height = s * 0.15;
  const green: [number, number, number] = topColor ?? [30, 200, 80];
  const brown: [number, number, number] = [180, 140, 90];
  const darkBrown: [number, number, number] = sideColor ?? [100, 70, 40];

  // Top face (green)
  p.fill(...green);
  p.beginShape();
  p.normal(0, -1, 0);
  p.vertex(-h, -height / 2, -h);
  p.vertex(h, -height / 2, -h);
  p.vertex(h, -height / 2, h);
  p.vertex(-h, -height / 2, h);
  p.endShape(p.CLOSE);

  // Bottom face
  p.fill(...brown);
  p.beginShape();
  p.normal(0, 1, 0);
  p.vertex(-h, height / 2, -h);
  p.vertex(h, height / 2, -h);
  p.vertex(h, height / 2, h);
  p.vertex(-h, height / 2, h);
  p.endShape(p.CLOSE);

  // Front face (+z)
  p.fill(...darkBrown);
  p.beginShape();
  p.normal(0, 0, 1);
  p.vertex(-h, -height / 2, h);
  p.vertex(h, -height / 2, h);
  p.vertex(h, height / 2, h);
  p.vertex(-h, height / 2, h);
  p.endShape(p.CLOSE);

  // Back face (-z)
  p.fill(...darkBrown);
  p.beginShape();
  p.normal(0, 0, -1);
  p.vertex(-h, -height / 2, -h);
  p.vertex(h, -height / 2, -h);
  p.vertex(h, height / 2, -h);
  p.vertex(-h, height / 2, -h);
  p.endShape(p.CLOSE);

  // Left face (-x)
  p.fill(...darkBrown);
  p.beginShape();
  p.normal(-1, 0, 0);
  p.vertex(-h, -height / 2, -h);
  p.vertex(-h, -height / 2, h);
  p.vertex(-h, height / 2, h);
  p.vertex(-h, height / 2, -h);
  p.endShape(p.CLOSE);

  // Right face (+x)
  p.fill(...darkBrown);
  p.beginShape();
  p.normal(1, 0, 0);
  p.vertex(h, -height / 2, -h);
  p.vertex(h, -height / 2, h);
  p.vertex(h, height / 2, h);
  p.vertex(h, height / 2, -h);
  p.endShape(p.CLOSE);
}
