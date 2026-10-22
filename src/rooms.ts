// The rooms, in order. Each room is drawn as up to three PNGs in art/rooms/:
//   <key>_map.png   object map (required): flat colours on 40 px cells
//   <key>.png       what the player sees; leave windows transparent
//   <key>_back.png  back pane, only visible through the windows
// Rooms are 720 px tall and any multiple of 40 px wide (1280 = one screen).

export interface RoomDef {
  key: string;
  name: string;
  /** Room behind the door. Leave out for the last room. */
  next?: string;
  /** What people (orange cells) say, in the order they appear left to right. */
  lines?: string[];
}

export const ROOMS: RoomDef[] = [
  {
    key: 'home',
    name: 'Home',
    next: 'street',
    lines: ['Mirror: "You look tired." Thanks, mirror.'],
  },
  { key: 'street', name: 'The street', next: 'office' },
  {
    key: 'office',
    name: 'The office',
    lines: ['Colleague: "Careful, he\'s at the coffee machine again."'],
  },
];

export const FIRST_ROOM = ROOMS[0].key;

export const roomByKey = (key: string): RoomDef => {
  const room = ROOMS.find((r) => r.key === key);
  if (!room) throw new Error(`Unknown room: ${key}`);
  return room;
};

// Object map colours.
export type Cell = 'empty' | 'solid' | 'platform' | 'door' | 'start' | 'enemy' | 'boss' | 'interaction';

export const MAP_COLOURS: { cell: Cell; rgb: [number, number, number] }[] = [
  { cell: 'solid', rgb: [0, 0, 0] },
  { cell: 'platform', rgb: [0, 0, 255] },
  { cell: 'door', rgb: [0, 255, 0] },
  { cell: 'start', rgb: [255, 255, 0] },
  { cell: 'enemy', rgb: [255, 0, 0] },
  { cell: 'boss', rgb: [255, 0, 255] },
  { cell: 'interaction', rgb: [255, 128, 0] },
];

/** Matches a pixel to the nearest map colour; transparent or unclear pixels are empty. */
export function classifyPixel(r: number, g: number, b: number, a: number): Cell {
  if (a < 128) return 'empty';
  let best: Cell = 'empty';
  let bestDist = 90 * 90; // tolerance for slightly-off colours
  for (const { cell, rgb } of MAP_COLOURS) {
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = cell;
    }
  }
  return best;
}

export interface Blob {
  cell: Cell;
  /** Bounding box in cells. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Groups touching cells of the same kind (for doors, enemies, people, start). */
export function findBlobs(grid: Cell[][], kind: Cell): Blob[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const seen = grid.map((r) => r.map(() => false));
  const blobs: Blob[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (seen[y][x] || grid[y][x] !== kind) continue;
      let minX = x, maxX = x, minY = y, maxY = y;
      const stack = [[x, y]];
      seen[y][x] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny][nx] && grid[ny][nx] === kind) {
            seen[ny][nx] = true;
            stack.push([nx, ny]);
          }
        }
      }
      blobs.push({ cell: kind, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    }
  }
  return blobs.sort((a, b) => a.x - b.x || a.y - b.y);
}
