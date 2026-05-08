import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import {shade} from "./shade";

export function drawPrism(p: p5, sides: number, color?: string) {
  const h = BLOCK_SIZE / 2;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const topY = floorY - BLOCK_SIZE;

  const bottomVerts: [number, number, number][] = [];
  const topVerts: [number, number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
    const x = h * Math.cos(angle);
    const z = h * Math.sin(angle);
    bottomVerts.push([x, floorY, z]);
    topVerts.push([x, topY, z]);
  }

  // Bottom face
  p.fill(...shade(color, 1.0));
  p.beginShape();
  for (const v of bottomVerts) {
    p.vertex(...v);
  }
  p.endShape(p.CLOSE);

  // Top face
  p.fill(...shade(color, 0.9));
  p.beginShape();
  for (const v of topVerts) {
    p.vertex(...v);
  }
  p.endShape(p.CLOSE);

  // Side faces
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const factor = 0.875 - (i * 0.25) / sides;
    p.fill(...shade(color, factor));
    p.beginShape();
    p.vertex(...bottomVerts[i]);
    p.vertex(...bottomVerts[next]);
    p.vertex(...topVerts[next]);
    p.vertex(...topVerts[i]);
    p.endShape(p.CLOSE);
  }
}
