import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import { colorToRgb } from "./colorToRgb";

export function drawPrism(p: p5, sides: number, color?: string) {
  const h = BLOCK_SIZE / 2;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const topY = floorY - BLOCK_SIZE;

  const bottomVerts: [number, number, number][] = [];
  const topVerts: [number, number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + Math.PI / 4 + (2 * Math.PI * i) / sides;
    const x = h * Math.cos(angle);
    const z = h * Math.sin(angle);
    bottomVerts.push([x, floorY, z]);
    topVerts.push([x, topY, z]);
  }

  p.fill(...colorToRgb(color));

  // Bottom face (normal pointing down)
  p.beginShape();
  p.normal(0, 1, 0);
  for (const v of bottomVerts) {
    p.vertex(...v);
  }
  p.endShape(p.CLOSE);

  // Top face (normal pointing up)
  p.beginShape();
  p.normal(0, -1, 0);
  for (const v of topVerts) {
    p.vertex(...v);
  }
  p.endShape(p.CLOSE);

  // Side faces
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const n = faceNormal(bottomVerts[i], bottomVerts[next], topVerts[next]);
    p.beginShape();
    p.normal(...n);
    p.vertex(...bottomVerts[i]);
    p.vertex(...bottomVerts[next]);
    p.vertex(...topVerts[next]);
    p.vertex(...topVerts[i]);
    p.endShape(p.CLOSE);
  }
}

function faceNormal(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
): [number, number, number] {
  const e1: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const e2: [number, number, number] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / len, ny / len, nz / len];
}
