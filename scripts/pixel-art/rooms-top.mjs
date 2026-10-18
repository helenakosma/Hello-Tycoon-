/**
 * Top-down room floors — the floor plan you see in the room view.
 *
 * Authored at 160x72 and upscaled 3x to 480x216. This is the backdrop only:
 * walls, floor covering, doors, and the fixed décor. The machines you buy are
 * overlaid on top by the game (see items-top.mjs).
 *
 * Each room keeps the same palette as its side-on version in rooms.mjs, so a
 * floor looks like the same place from either angle.
 */

import { Canvas, shade } from './canvas.mjs';

const W = 160;
const H = 72;
const WALL = 5;          // thickness of the wall band around the room

const INK = '#1b1622';

/** Walls around the outside, floor in the middle. */
function shell(c, { wall, floor }) {
  c.rect(0, 0, W, H, wall);
  c.rect(WALL, WALL, W - WALL * 2, H - WALL * 2, floor);
  c.frame(0, 0, W, H, INK);
  c.frame(WALL - 1, WALL - 1, W - WALL * 2 + 2, H - WALL * 2 + 2, shade(wall, -0.4));
  // A soft highlight along the top wall so the room reads as lit from above.
  c.hline(WALL, WALL, W - WALL * 2, shade(floor, 0.12));
  return c;
}

/** Floorboards running the length of the room. */
function boards(c, floor, step = 6) {
  for (let y = WALL + step; y < H - WALL; y += step) {
    c.hline(WALL, y, W - WALL * 2, shade(floor, -0.13));
  }
  return c;
}

/** Square floor tiles. */
function tiles(c, floor, size = 12) {
  for (let x = WALL + size; x < W - WALL; x += size) c.vline(x, WALL, H - WALL * 2, shade(floor, -0.16));
  for (let y = WALL + size; y < H - WALL; y += size) c.hline(WALL, y, W - WALL * 2, shade(floor, -0.16));
  return c;
}

/** A rug, to break up a big empty floor. */
function rug(c, x, y, w, h, fill, edge) {
  c.rect(x, y, w, h, fill);
  c.frame(x, y, w, h, edge);
  c.frame(x + 2, y + 2, w - 4, h - 4, edge);
  return c;
}

/** The way in. Drawn as a gap in the left-hand wall with a mat in front. */
function door(c, accent) {
  c.rect(0, H / 2 - 7, WALL, 14, '#241c16');
  c.rect(0, H / 2 - 7, 2, 14, accent);
  c.rect(WALL, H / 2 - 5, 4, 10, '#00000026');
  return c;
}

/** A potted plant from above: leaves in a circle around a pot. */
function plant(c, cx, cy) {
  const leaf = '#4f9f5f';
  for (let y = -4; y <= 4; y++) {
    for (let x = -4; x <= 4; x++) {
      if (x * x + y * y <= 16) c.px(cx + x, cy + y, leaf);
    }
  }
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      if (x * x + y * y <= 4) c.px(cx + x, cy + y, '#b5643f');
    }
  }
  c.px(cx - 2, cy - 3, shade(leaf, 0.4));
  c.px(cx + 3, cy + 1, shade(leaf, -0.3));
  return c;
}

const ROOMS = {
  bullpen: (c) => {
    shell(c, { wall: '#33455f', floor: '#4a5468' });
    boards(c, '#4a5468', 7);
    door(c, '#5b8def');
    rug(c, 52, 24, 56, 26, '#3c4a63', '#5b8def55');
    plant(c, 146, 14);
    plant(c, 146, 58);
    c.rect(WALL, WALL, W - WALL * 2, 2, '#3d5273');   // light strip along the top wall
  },

  server: (c) => {
    shell(c, { wall: '#16332c', floor: '#1d3a33' });
    tiles(c, '#1d3a33', 12);
    door(c, '#2ee6a8');
    // Cable runs taped to the floor.
    for (const y of [20, 52]) {
      c.hline(WALL, y, W - WALL * 2, '#0d211c');
      for (let x = WALL + 4; x < W - WALL; x += 8) c.px(x, y, '#2ee6a8');
    }
    c.rect(W - 22, 10, 14, 10, '#f5c542');            // the warning sign, on the wall
    c.frame(W - 22, 10, 14, 10, '#8a6a10');
  },

  breakroom: (c) => {
    shell(c, { wall: '#4a3527', floor: '#6b4f38' });
    tiles(c, '#6b4f38', 11);
    door(c, '#e8a33d');
    c.rect(WALL, WALL, W - WALL * 2, 9, '#8a6a45');   // counter along the top wall
    c.hline(WALL, WALL + 9, W - WALL * 2, '#a8855c');
    rug(c, 58, 30, 44, 22, '#5a4030', '#e8a33d44');
    plant(c, 146, 60);
  },

  gym: (c) => {
    shell(c, { wall: '#3a2b4f', floor: '#4a3a5f' });
    boards(c, '#4a3a5f', 8);
    door(c, '#b06de8');
    rug(c, 46, 20, 68, 34, '#55436d', '#b06de866');   // the mat area
    c.hline(46, 37, 68, '#b06de844');
    c.rect(WALL, H - WALL - 3, W - WALL * 2, 3, '#6a5a88');  // mirror along the bottom wall
  },

  meeting: (c) => {
    shell(c, { wall: '#4a333c', floor: '#5f4450' });
    boards(c, '#5f4450', 7);
    door(c, '#e86d8a');
    rug(c, 40, 16, 80, 42, '#523a46', '#e86d8a55');
    c.rect(W - 18, 24, 10, 26, '#f0e6ea');            // the whiteboard, on the wall
    c.frame(W - 18, 24, 10, 26, '#8a6a75');
  },

  lounge: (c) => {
    shell(c, { wall: '#2f4a55', floor: '#7a5f42' });
    boards(c, '#7a5f42', 5);                          // decking
    door(c, '#3dd6e8');
    // The parapet runs round the outside, with the city below beyond it.
    c.rect(0, 0, W, 3, '#0a1a2b');
    c.rect(0, H - 3, W, 3, '#0a1a2b');
    for (let x = 2; x < W; x += 6) { c.px(x, 1, '#f5c542'); c.px(x + 3, H - 2, '#f5c542'); }
    rug(c, 54, 24, 52, 26, '#6a5138', '#3dd6e855');
    plant(c, 146, 14);
  },

  exec: (c) => {
    shell(c, { wall: '#3f3320', floor: '#5a4a2e' });
    boards(c, '#5a4a2e', 6);
    door(c, '#f5c542');
    rug(c, 44, 18, 74, 38, '#5e2630', '#874049');
    c.hline(48, 37, 66, '#874049');
    plant(c, 146, 14);
    plant(c, 146, 58);
    c.rect(WALL, WALL, W - WALL * 2, 2, '#7a5f3a');   // picture rail
  },
};

/** Draw one top-down room floor and return its 160x72 canvas. */
export function drawRoomTop(id) {
  const draw = ROOMS[id];
  if (!draw) return null;
  const canvas = new Canvas(W, H);
  draw(canvas);
  return canvas;
}

export const ROOM_TOP_KEYS = Object.keys(ROOMS);
export const ROOM_TOP_SIZE = { width: W, height: H };
export default ROOMS;
