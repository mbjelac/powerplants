import { SektorData } from "../shared/sektorData";
import { MODIFIER_MIN, MODIFIER_MAX } from "../shared/modifierLimits";
import restrictionsRequirements from "./restrictions_requirements";

const GRID_SIZE = 20;
const PROPERTY_NAMES = ["soil", "groundwater", "ore", "insolation", "wind"];

function createSektor(): SektorData {
  return {
    locationProperties: generateLocationProperties(),
    water: generateWater(),
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
const SEA = 2;
const MEANDER_CHANCE = 0.6;
const MAX_RIVER_NEIGHBOURS = 2;
const MAX_RIVER_ATTEMPTS = 200;
const MIN_SEA_FRACTION = 0.15;
const MAX_SEA_FRACTION = 0.4;

// The water matrix holds land (0), river (1) and sea (2) squares. The sea is
// grown first so river creation can treat the sea shore as a map edge.
function generateWater(): number[][] {
  const water = createEmptyWater();
  growSea(water);
  return addRiver(water);
}

function createEmptyWater(): number[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => LAND)
  );
}

// Carves a river between two "edge" squares — map border or sea shore — through
// land only. Start and end must lie on different edges (not the same map side
// and not both on the shoreline). Retries on a copy until one path succeeds.
function addRiver(water: number[][]): number[][] {
  const edges = edgeAndShoreLocations(water);
  if (edges.length < 2) return water;
  for (let attempt = 0; attempt < MAX_RIVER_ATTEMPTS; attempt++) {
    const start = edges[Math.floor(Math.random() * edges.length)];
    const end = pickLocationOnDifferentEdge(edges, start, water);
    if (end === null) continue;
    const candidate = copyWater(water);
    if (carveRiver(candidate, start, end)) {
      return candidate;
    }
  }
  return water;
}

// Land squares touching the map border or a sea square — the river endpoints.
function edgeAndShoreLocations(water: number[][]): { x: number; y: number }[] {
  const locations: { x: number; y: number }[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (water[x][y] !== LAND) continue;
      if (edgesOf({ x, y }, water).size > 0) {
        locations.push({ x, y });
      }
    }
  }
  return locations;
}

function pickLocationOnDifferentEdge(
  locations: { x: number; y: number }[],
  start: { x: number; y: number },
  water: number[][],
): { x: number; y: number } | null {
  const startEdges = edgesOf(start, water);
  const candidates = locations.filter(location => {
    const locationEdges = edgesOf(location, water);
    return [...locationEdges].every(edge => !startEdges.has(edge));
  });
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// The edges a land square belongs to: each touched map border, and/or the
// shoreline if it neighbours a sea square.
function edgesOf(location: { x: number; y: number }, water: number[][]): Set<string> {
  const edges = new Set<string>();
  if (location.x === 0) edges.add("border-x-min");
  if (location.x === GRID_SIZE - 1) edges.add("border-x-max");
  if (location.y === 0) edges.add("border-y-min");
  if (location.y === GRID_SIZE - 1) edges.add("border-y-max");
  if (validNeighbours(location).some(neighbour => water[neighbour.x][neighbour.y] === SEA)) {
    edges.add("shore");
  }
  return edges;
}

function copyWater(water: number[][]): number[][] {
  return water.map(row => row.slice());
}

// Walks a thin, meandering river from start to end. Returns false if the walk
// gets stuck (no step keeps the river thin) so the caller can retry.
function carveRiver(water: number[][], start: { x: number; y: number }, end: { x: number; y: number }): boolean {
  let current = { x: start.x, y: start.y };
  water[current.x][current.y] = RIVER;
  let steps = 0;
  const maxSteps = GRID_SIZE * GRID_SIZE * 2;
  const maxMeanderSteps = GRID_SIZE * GRID_SIZE;
  while (current.x !== end.x || current.y !== end.y) {
    if (steps >= maxSteps) return false;
    const next = nextRiverStep(water, current, end, steps < maxMeanderSteps);
    if (next === null) return false;
    water[next.x][next.y] = RIVER;
    current = next;
    steps++;
  }
  return true;
}

function nextRiverStep(
  water: number[][],
  current: { x: number; y: number },
  end: { x: number; y: number },
  meander: boolean,
): { x: number; y: number } | null {
  const neighbours = validNeighbours(current).filter(
    neighbour => water[neighbour.x][neighbour.y] === LAND && keepsRiverThin(water, neighbour)
  );
  if (neighbours.length === 0) {
    return null;
  }
  if (meander && Math.random() < MEANDER_CHANCE) {
    return neighbours[Math.floor(Math.random() * neighbours.length)];
  }
  const towardsEnd = neighbours.filter(
    neighbour => manhattanDistance(neighbour, end) < manhattanDistance(current, end)
  );
  const choices = towardsEnd.length > 0 ? towardsEnd : neighbours;
  return choices[Math.floor(Math.random() * choices.length)];
}

// A candidate becomes river only if it would not touch more than 2 river
// squares, and would not push any neighbouring river square over that limit.
function keepsRiverThin(water: number[][], candidate: { x: number; y: number }): boolean {
  const riverNeighbours = validNeighbours(candidate).filter(
    neighbour => water[neighbour.x][neighbour.y] === RIVER
  );
  if (riverNeighbours.length > MAX_RIVER_NEIGHBOURS) {
    return false;
  }
  return riverNeighbours.every(
    neighbour => countRiverNeighbours(water, neighbour) < MAX_RIVER_NEIGHBOURS
  );
}

function countRiverNeighbours(water: number[][], location: { x: number; y: number }): number {
  return validNeighbours(location).filter(
    neighbour => water[neighbour.x][neighbour.y] === RIVER
  ).length;
}

// Grows a sea inland from a random map edge, advancing over random frontier
// squares until it reaches a random target size capped at 40% of the map.
function growSea(water: number[][]): void {
  const maxSeaSquares = Math.floor(GRID_SIZE * GRID_SIZE * MAX_SEA_FRACTION);
  const minSeaSquares = Math.floor(GRID_SIZE * GRID_SIZE * MIN_SEA_FRACTION);
  const targetSeaSquares = minSeaSquares + Math.floor(Math.random() * (maxSeaSquares - minSeaSquares + 1));
  let seaSquares = 0;
  for (const location of pickRandomSide()) {
    if (water[location.x][location.y] !== LAND) continue;
    water[location.x][location.y] = SEA;
    seaSquares++;
  }
  while (seaSquares < targetSeaSquares) {
    const frontier = seaFrontier(water);
    if (frontier.length === 0) break;
    const next = frontier[Math.floor(Math.random() * frontier.length)];
    water[next.x][next.y] = SEA;
    seaSquares++;
  }
}

function pickRandomSide(): { x: number; y: number }[] {
  const side = Math.floor(Math.random() * 4);
  const locations: { x: number; y: number }[] = [];
  for (let index = 0; index < GRID_SIZE; index++) {
    if (side === 0) locations.push({ x: 0, y: index });
    else if (side === 1) locations.push({ x: GRID_SIZE - 1, y: index });
    else if (side === 2) locations.push({ x: index, y: 0 });
    else locations.push({ x: index, y: GRID_SIZE - 1 });
  }
  return locations;
}

function seaFrontier(water: number[][]): { x: number; y: number }[] {
  const frontier: { x: number; y: number }[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (water[x][y] !== LAND) continue;
      if (validNeighbours({ x, y }).some(neighbour => water[neighbour.x][neighbour.y] === SEA)) {
        frontier.push({ x, y });
      }
    }
  }
  return frontier;
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
