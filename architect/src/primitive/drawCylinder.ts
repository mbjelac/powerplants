import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import { colorToRgb } from "./colorToRgb";

export function drawCylinder(p: p5, color?: string) {
  const radius = BLOCK_SIZE / 2;
  const height = BLOCK_SIZE;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const centerY = floorY - height / 2;

  p.push();
  p.translate(0, centerY, 0);
  p.fill(...colorToRgb(color));
  p.cylinder(radius, height);
  p.pop();
}
