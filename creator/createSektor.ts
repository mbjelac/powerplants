import { SektorData } from "../shared/sektorData";
import { MODIFIER_MIN, MODIFIER_MAX } from "../shared/modifierLimits";
import restrictionsRequirements from "./restrictions_requirements";

const GRID_SIZE = 20;
const PROPERTY_NAMES = ["soil", "groundwater", "ore", "insolation", "wind"];

function createSektor(): SektorData {
  return {
    locationProperties: generateLocationProperties(),
    river: generateRiver(),
    importRestrictions: restrictionsRequirements.importRestrictions,
    exportRequirements: restrictionsRequirements.exportRequirements,
    buildings: [],
    connections: [],
  };
}

function generateLocationProperties(): { [key: string]: number[][] } {
  return Object.fromEntries(
    PROPERTY_NAMES.map(name => [name, generatePropertyMatrix()])
  );
}

function generatePropertyMatrix(): number[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => generatePropertyValue())
  );
}

function generatePropertyValue(): number {
  return Math.floor(Math.random() * (MODIFIER_MAX - MODIFIER_MIN + 1)) + MODIFIER_MIN;
}

const LAND = 0;
const RIVER = 1;
const MEANDER_CHANCE = 0.6;

function generateRiver(): number[][] {
  const river = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => LAND)
  );
  const start = pickRandomEdgeLocation();
  const end = pickDifferentEdgeLocation(start);
  carveRiver(river, start, end);
  return river;
}

function pickRandomEdgeLocation(): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4);
  const along = Math.floor(Math.random() * GRID_SIZE);
  if (side === 0) return { x: 0, y: along };
  if (side === 1) return { x: GRID_SIZE - 1, y: along };
  if (side === 2) return { x: along, y: 0 };
  return { x: along, y: GRID_SIZE - 1 };
}

function pickDifferentEdgeLocation(other: { x: number; y: number }): { x: number; y: number } {
  let location = pickRandomEdgeLocation();
  while (location.x === other.x && location.y === other.y) {
    location = pickRandomEdgeLocation();
  }
  return location;
}

function carveRiver(river: number[][], start: { x: number; y: number }, end: { x: number; y: number }): void {
  let current = { x: start.x, y: start.y };
  river[current.x][current.y] = RIVER;
  let steps = 0;
  const maxMeanderSteps = GRID_SIZE * GRID_SIZE;
  while (current.x !== end.x || current.y !== end.y) {
    current = nextRiverStep(current, end, steps < maxMeanderSteps);
    river[current.x][current.y] = RIVER;
    steps++;
  }
}

function nextRiverStep(
  current: { x: number; y: number },
  end: { x: number; y: number },
  meander: boolean,
): { x: number; y: number } {
  const neighbours = validNeighbours(current);
  if (meander && Math.random() < MEANDER_CHANCE) {
    return neighbours[Math.floor(Math.random() * neighbours.length)];
  }
  const towardsEnd = neighbours.filter(
    neighbour => manhattanDistance(neighbour, end) < manhattanDistance(current, end)
  );
  const choices = towardsEnd.length > 0 ? towardsEnd : neighbours;
  return choices[Math.floor(Math.random() * choices.length)];
}

function validNeighbours(location: { x: number; y: number }): { x: number; y: number }[] {
  const candidates = [
    { x: location.x - 1, y: location.y },
    { x: location.x + 1, y: location.y },
    { x: location.x, y: location.y - 1 },
    { x: location.x, y: location.y + 1 },
  ];
  return candidates.filter(
    candidate =>
      candidate.x >= 0 && candidate.x < GRID_SIZE && candidate.y >= 0 && candidate.y < GRID_SIZE
  );
}

function manhattanDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

console.log(formatSektorData(createSektor()));

function formatSektorData(sektorData: SektorData): string {
  return JSON.stringify(sektorData, null, 2).replace(
    /\[[\s\d.,-]+]/g,
    numberArray => numberArray.replace(/\s+/g, " ").replace(/\[ /, "[").replace(/ ]/, "]")
  );
}
