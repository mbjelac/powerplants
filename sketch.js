import p5 from "p5";

const mapText = await fetch("/map1.txt").then((r) => r.text());

const BLOCK_SIZE = 100;
const INSET = 15;

const CAM_KEYS = ["eyeX", "eyeY", "eyeZ", "centerX", "centerY", "centerZ", "upX", "upY", "upZ"];

function loadCamera(cam) {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("eyeX")) return;
  const vals = {};
  for (const k of CAM_KEYS) {
    const v = parseFloat(params.get(k));
    if (isNaN(v)) return;
    vals[k] = v;
  }
  cam.camera(
    vals.eyeX, vals.eyeY, vals.eyeZ,
    vals.centerX, vals.centerY, vals.centerZ,
    vals.upX, vals.upY, vals.upZ
  );
}

function saveCamera(cam) {
  const params = new URLSearchParams();
  for (const k of CAM_KEYS) {
    params.set(k, cam[k].toFixed(1));
  }
  window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
}

function drawLandBlock(p, s, edges) {
  const h = s / 2;
  const green = [30, 200, 80];
  const brown = [180, 140, 90];
  const darkBrown = [100, 70, 40];

  // Top face (green)
  p.fill(...green);
  p.beginShape();
  p.vertex(-h, -h, -h);
  p.vertex(h, -h, -h);
  p.vertex(h, -h, h);
  p.vertex(-h, -h, h);
  p.endShape(p.CLOSE);

  // Bottom face
  p.fill(...brown);
  p.beginShape();
  p.vertex(-h, h, -h);
  p.vertex(h, h, -h);
  p.vertex(h, h, h);
  p.vertex(-h, h, h);
  p.endShape(p.CLOSE);

  // Front face (+z)
  p.fill(...(edges.front ? darkBrown : brown));
  p.beginShape();
  p.vertex(-h, -h, h);
  p.vertex(h, -h, h);
  p.vertex(h, h, h);
  p.vertex(-h, h, h);
  p.endShape(p.CLOSE);

  // Back face (-z)
  p.fill(...(edges.back ? darkBrown : brown));
  p.beginShape();
  p.vertex(-h, -h, -h);
  p.vertex(h, -h, -h);
  p.vertex(h, h, -h);
  p.vertex(-h, h, -h);
  p.endShape(p.CLOSE);

  // Left face (-x)
  p.fill(...(edges.left ? darkBrown : brown));
  p.beginShape();
  p.vertex(-h, -h, -h);
  p.vertex(-h, -h, h);
  p.vertex(-h, h, h);
  p.vertex(-h, h, -h);
  p.endShape(p.CLOSE);

  // Right face (+x)
  p.fill(...(edges.right ? darkBrown : brown));
  p.beginShape();
  p.vertex(h, -h, -h);
  p.vertex(h, -h, h);
  p.vertex(h, h, h);
  p.vertex(h, h, -h);
  p.endShape(p.CLOSE);
}

function drawPyramid(p, s, height) {
  const h = s / 2;
  const apex = -(height ?? s);

  p.fill(160, 160, 160);

  // Front face
  p.beginShape();
  p.vertex(-h, 0, h);
  p.vertex(h, 0, h);
  p.vertex(0, apex, 0);
  p.endShape(p.CLOSE);

  // Back face
  p.beginShape();
  p.vertex(-h, 0, -h);
  p.vertex(h, 0, -h);
  p.vertex(0, apex, 0);
  p.endShape(p.CLOSE);

  // Left face
  p.beginShape();
  p.vertex(-h, 0, -h);
  p.vertex(-h, 0, h);
  p.vertex(0, apex, 0);
  p.endShape(p.CLOSE);

  // Right face
  p.beginShape();
  p.vertex(h, 0, -h);
  p.vertex(h, 0, h);
  p.vertex(0, apex, 0);
  p.endShape(p.CLOSE);
}

function isOnMap(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[row].length;
}

const sketch = (p) => {
  let grid;
  let cam;

  p.setup = () => {
    p.createCanvas(1400, 800, p.WEBGL);
    p.ortho();
    grid = mapText.trim().split("\n").map((row) => row.split(""));

    cam = p._renderer.states.curCamera;
    loadCamera(cam);
  };

  p.draw = () => {
    p.background(30);
    p.orbitControl();
    saveCamera(cam);

    const rows = grid.length;
    const cols = grid[0].length;
    const offsetX = ((cols - 1) * BLOCK_SIZE) / 2;
    const offsetZ = ((rows - 1) * BLOCK_SIZE) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col];
        const x = col * BLOCK_SIZE - offsetX;
        const z = row * BLOCK_SIZE - offsetZ;

        p.push();

        if (cell === "g") {
          p.translate(x, 0, z);
          p.stroke(150);
          drawLandBlock(p, BLOCK_SIZE, {
            left: !isOnMap(grid, row, col - 1),
            right: !isOnMap(grid, row, col + 1),
            front: !isOnMap(grid, row + 1, col),
            back: !isOnMap(grid, row - 1, col),
          });
        } else if (cell === "m") {
          p.translate(x, 0, z);
          p.stroke(150);
          drawLandBlock(p, BLOCK_SIZE, {
            left: !isOnMap(grid, row, col - 1),
            right: !isOnMap(grid, row, col + 1),
            front: !isOnMap(grid, row + 1, col),
            back: !isOnMap(grid, row - 1, col),
          });
          // pyramid sits on top of the land block
          p.translate(0, -BLOCK_SIZE / 2, 0);
          p.stroke(120);
          drawPyramid(p, BLOCK_SIZE);
        } else if (cell === "r") {
          p.translate(x, INSET, z);
          p.fill(60, 120, 255);
          p.stroke(150);
          p.box(BLOCK_SIZE, BLOCK_SIZE - INSET * 2, BLOCK_SIZE);
        }

        p.pop();
      }
    }

    // Extra pyramids at corners where four mountains meet
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        if (
          grid[row][col] === "m" &&
          grid[row][col + 1] === "m" &&
          grid[row + 1][col] === "m" &&
          grid[row + 1][col + 1] === "m"
        ) {
          const cx = (col + 0.5) * BLOCK_SIZE - offsetX;
          const cz = (row + 0.5) * BLOCK_SIZE - offsetZ;
          p.push();
          p.translate(cx, -BLOCK_SIZE / 2, cz);
          p.stroke(120);
          drawPyramid(p, BLOCK_SIZE, BLOCK_SIZE * 1.5);
          p.pop();
        }
      }
    }
  };
};

new p5(sketch);
