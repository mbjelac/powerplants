import p5 from "p5";
import {BLOCK_SIZE} from "../constants";
import { colorToRgb } from "./colorToRgb";

export function drawSphere(p: p5, color?: string) {
  const radius = BLOCK_SIZE / 2;
  const floorY = -(BLOCK_SIZE * 0.15) / 2;
  const centerY = floorY - radius;

  p.push();
  p.translate(0, centerY, 0);
  p.fill(...colorToRgb(color));
  p.sphere(radius);
  p.pop();
}
