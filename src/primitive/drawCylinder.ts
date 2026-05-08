import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import {shade} from "./shade";

export function drawCylinder(p: p5, color?: string) {
  const radius = BLOCK_SIZE / 2;
  const height = BLOCK_SIZE;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const centerY = floorY - height / 2;

  p.push();
  p.translate(0, centerY, 0);
  p.fill(...shade(color, 0.8));
  p.cylinder(radius, height);
  p.pop();
}
