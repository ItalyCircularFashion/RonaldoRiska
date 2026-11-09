export type Obstacle = { xMin: number; xMax: number; zMin: number; zMax: number };
export type Point = { x: number; z: number };

export function collide(point: Point, obstacles: readonly Obstacle[], radius = 0.42): boolean {
  return obstacles.some(o => point.x + radius > o.xMin && point.x - radius < o.xMax && point.z + radius > o.zMin && point.z - radius < o.zMax);
}

// Axis-separated sweep in short steps prevents tunnelling and lets the avatar slide along walls.
export function moveWithCollisions(from: Point, dx: number, dz: number, obstacles: readonly Obstacle[], radius = 0.42): Point {
  const pos = { ...from };
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (radius * 0.75)));
  for (let i = 0; i < steps; i++) {
    const testX = { x: pos.x + dx / steps, z: pos.z };
    if (!collide(testX, obstacles, radius)) pos.x = testX.x;
    const testZ = { x: pos.x, z: pos.z + dz / steps };
    if (!collide(testZ, obstacles, radius)) pos.z = testZ.z;
  }
  return pos;
}

export function near(a: Point, b: Point, distance: number): boolean { return Math.hypot(a.x-b.x, a.z-b.z) <= distance; }

export const outsideWalls: Obstacle[] = [
  { xMin:-35,xMax:-34,zMin:-42,zMax:34 },{ xMin:34,xMax:35,zMin:-42,zMax:34 },
  { xMin:-35,xMax:35,zMin:-42,zMax:-41 },{ xMin:-35,xMax:35,zMin:33,zMax:34 },
  // Entrance gap at x=-1.6..1.6; no invisible collider across the doorway.
  { xMin:-8,xMax:-1.6,zMin:-15.4,zMax:-14.6 },{ xMin:1.6,xMax:8,zMin:-15.4,zMax:-14.6 },
  { xMin:-8,xMax:-7.4,zMin:-29,zMax:-15 },{ xMin:7.4,xMax:8,zMin:-29,zMax:-15 },
  { xMin:-8,xMax:8,zMin:-29,zMax:-28.4 },
  { xMin:-26,xMax:-15,zMin:-30,zMax:-18 },{ xMin:14,xMax:26,zMin:-32,zMax:-19 },
  { xMin:-30,xMax:-17,zMin:-5,zMax:5 },{ xMin:16,xMax:29,zMin:-6,zMax:3 },
];
export const insideWalls: Obstacle[] = [
  {xMin:49.5,xMax:50.2,zMin:-8,zMax:8}, {xMin:65.8,xMax:66.5,zMin:-8,zMax:8},
  {xMin:50,xMax:66,zMin:-8.5,zMax:-7.8},
  {xMin:50,xMax:56.3,zMin:7.8,zMax:8.5}, {xMin:59.7,xMax:66,zMin:7.8,zMax:8.5},
  {xMin:56.1,xMax:59.9,zMin:-3.3,zMax:-0.6}, // loom is solid
  {xMin:50.7,xMax:52.9,zMin:-5.3,zMax:-1.8},
];
