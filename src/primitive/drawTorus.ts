import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import { colorToRgb } from "./colorToRgb";

export function drawTorus(p: p5, color?: string) {
  const radius = BLOCK_SIZE / 2;
  const tubeRadius = radius / 3;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const centerY = floorY - tubeRadius;

  p.push();
  p.translate(0, centerY, 0);
  p.rotateX(Math.PI / 2);
  p.fill(...colorToRgb(color));
  p.torus(radius, tubeRadius);
  p.pop();
}
