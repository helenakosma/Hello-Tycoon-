/**
 * Room backdrops — the cutaway interior behind each floor of the tower.
 *
 * Authored at 160x36 and upscaled 3x to 480x108 on export, which is the shape
 * the floor renders at. Everything is drawn in code so the seven rooms share a
 * single visual language: same wall height, same skirting board, same floor
 * line, so the tower reads as one building rather than seven collages.
 *
 * Layout (in the 160x36 grid):
 *     y 0        ceiling line
 *     y 1-25     back wall
 *     y 26-27    skirting board
 *     y 28-35    floor
 *
 * The room is deliberately wide and short: the furniture sprites are 16px tall,
 * so they fill nearly half the room's height and the floor reads as busy rather
 * than as a big empty wall with something small at the bottom.
 *
 * The upgradeable furniture is NOT drawn here — the game overlays those item
 * sprites on top. What's here is the fixed set dressing: walls, windows,
 * lights, plants, the things that make a room feel like a place.
 */

import { Canvas, shade } from './canvas.mjs';

const W = 160;
const H = 36;
const WALL_BOTTOM = 25;
const SKIRT_TOP = 26;
const FLOOR_TOP = 28;

const INK = '#1b1622';

/** Wall, skirting board and floor — the shell every room starts from. */
function shell(c, { wall, floor, skirting }) {
  c.rect(0, 0, W, FLOOR_TOP, wall);
  c.hline(0, 0, W, shade(wall, -0.4));                   // ceiling shadow
  c.hline(0, 1, W, shade(wall, 0.14));
  // A soft gradient down the wall so it doesn't read as a flat block.
  for (let y = 2; y <= WALL_BOTTOM; y++) {
    const t = (y - 2) / (WALL_BOTTOM - 2);
    if (t > 0.5) c.hline(0, y, W, shade(wall, -0.09 * ((t - 0.5) / 0.5)));
  }
  c.rect(0, SKIRT_TOP, W, 2, skirting);
  c.hline(0, SKIRT_TOP, W, shade(skirting, 0.35));
  c.rect(0, FLOOR_TOP, W, H - FLOOR_TOP, floor);
  c.hline(0, FLOOR_TOP, W, shade(floor, 0.25));
  return c;
}

/** Floorboards running left to right. */
function floorboards(c, floor, step = 3) {
  for (let y = FLOOR_TOP + step; y < H; y += step) c.hline(0, y, W, shade(floor, -0.15));
  return c;
}

/** Square floor tiles, for the harder-edged rooms. */
function floorTiles(c, floor, size = 8) {
  for (let x = 0; x < W; x += size) c.vline(x, FLOOR_TOP + 1, H - FLOOR_TOP - 1, shade(floor, -0.18));
  c.hline(0, FLOOR_TOP + 4, W, shade(floor, -0.1));
  return c;
}

/**
 * A window onto the night city — the single biggest reason the rooms feel
 * like they're high up in a tower.
 */
function nightWindow(c, x, y, w, h, { frame = '#3c4658', sky = '#16203a' } = {}) {
  c.rect(x, y, w, h, frame);
  c.rect(x + 2, y + 2, w - 4, h - 4, sky);

  // Distant skyline silhouette with lit windows.
  const base = y + h - 3;
  let bx = x + 3;
  let seed = x * 7 + y * 13;
  const random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  while (bx < x + w - 4) {
    const bw = 3 + Math.floor(random() * 4);
    const bh = 4 + Math.floor(random() * Math.max(2, h - 8));
    const top = base - bh;
    c.rect(bx, top, Math.min(bw, x + w - 4 - bx), bh, '#0e1730');
    for (let ly = top + 1; ly < base - 1; ly += 2) {
      for (let lx = bx + 1; lx < bx + bw - 1; lx += 2) {
        if (lx < x + w - 4 && random() > 0.45) c.px(lx, ly, random() > 0.5 ? '#f5c542' : '#8fb7f5');
      }
    }
    bx += bw + 1;
  }

  c.px(x + 5, y + 3, '#ffffff'); c.px(x + w - 7, y + 4, '#cfe0ff');   // stars
  c.frame(x, y, w, h, INK);
  c.vline(x + Math.floor(w / 2), y + 2, h - 4, frame);                 // mullion
  return c;
}

/** A potted plant. Every office has one, and it makes a room feel lived in. */
function plant(c, x, potColor = '#b5643f') {
  const leaf = '#4f9f5f';
  const base = FLOOR_TOP + 2;
  c.rect(x + 2, base - 4, 5, 4, potColor);
  c.frame(x + 2, base - 4, 5, 4, INK);
  c.hline(x + 3, base - 4, 3, shade(potColor, 0.3));
  c.vline(x + 4, base - 8, 4, shade(leaf, -0.3));
  c.rect(x + 1, base - 11, 3, 3, leaf);
  c.rect(x + 5, base - 10, 3, 3, leaf);
  c.rect(x + 3, base - 13, 3, 3, shade(leaf, 0.2));
  c.px(x + 4, base - 12, shade(leaf, 0.45));
  return c;
}

/** Ceiling strip lights with a pool of light under each. */
function stripLights(c, count, color = '#fff6d0') {
  const gap = Math.floor(W / (count + 1));
  for (let i = 1; i <= count; i++) {
    const x = gap * i - 6;
    c.rect(x, 1, 12, 2, color);
    c.frame(x, 1, 12, 2, shade(color, -0.45));
    c.rect(x - 2, 3, 16, 1, '#fff6d022');
    c.rect(x - 4, 4, 20, 1, '#fff6d010');
  }
  return c;
}

/** A framed thing on the wall — poster, whiteboard, screen. */
function wallPanel(c, x, y, w, h, fill, frameColor = '#2f3644') {
  c.rect(x, y, w, h, fill);
  c.frame(x, y, w, h, frameColor);
  c.hline(x + 1, y + 1, w - 2, shade(fill, 0.2));
  return c;
}

// ---------------------------------------------------------------------------
// The seven rooms
// ---------------------------------------------------------------------------

const ROOMS = {
  /** Coding Bullpen — bright, busy, a whiteboard nobody has erased. */
  bullpen: (c) => {
    shell(c, { wall: '#33455f', floor: '#4a5468', skirting: '#22304a' });
    floorboards(c, '#4a5468', 3);
    stripLights(c, 3);

    wallPanel(c, 8, 7, 30, 16, '#e8eef7', '#9aa4b2');            // whiteboard
    for (const [x, y, w] of [[11, 10, 20], [11, 13, 14], [11, 16, 23], [11, 19, 10]]) {
      c.hline(x, y, w, '#5b8def');
    }
    c.rect(44, 9, 22, 13, '#26334a');                            // wall of tickets
    c.frame(44, 9, 22, 13, '#1b2537');
    for (let y = 11; y < 21; y += 3) {
      for (let x = 46; x < 64; x += 5) {
        c.rect(x, y, 3, 2, ['#f5c542', '#2ee6a8', '#f5744d'][(x + y) % 3]);
      }
    }
    nightWindow(c, 96, 6, 48, 18);
    plant(c, 150);
  },

  /** Server Room — no windows, all blinkenlights. */
  server: (c) => {
    shell(c, { wall: '#16332c', floor: '#1d3a33', skirting: '#0e241f' });
    floorTiles(c, '#1d3a33', 10);
    stripLights(c, 2, '#c8fff0');

    c.rect(0, 4, W, 3, '#0d211c');                               // cable tray
    for (let x = 2; x < W; x += 4) c.px(x, 5, ['#2ee6a8', '#4fc3e0', '#f5c542'][x % 3]);

    for (const x of [8, 38]) {                                   // patch panels
      c.rect(x, 9, 24, 15, '#0e241f');
      c.frame(x, 9, 24, 15, '#2a5a4c');
      for (let y = 11; y < 22; y += 3) {
        for (let lx = x + 3; lx < x + 22; lx += 4) {
          c.rect(lx, y, 2, 2, (lx + y) % 7 === 0 ? '#f5c542' : '#2ee6a8');
        }
      }
    }
    wallPanel(c, 122, 8, 20, 12, '#f5c542', '#8a6a10');           // warning sign
    c.rect(128, 10, 8, 8, '#16332c');
    c.px(131, 11, '#f5c542'); c.px(131, 13, '#f5c542'); c.px(131, 16, '#f5c542');
  },

  /** Break Room — tiles, a clock, and a fridge covered in magnets. */
  breakroom: (c) => {
    shell(c, { wall: '#4a3527', floor: '#6b4f38', skirting: '#33241a' });
    floorTiles(c, '#6b4f38', 8);
    stripLights(c, 2, '#ffe9b0');

    c.rect(0, 13, 70, 13, '#d8cdb8');                            // tiled splashback
    for (let x = 0; x < 70; x += 6) c.vline(x, 13, 13, '#bfae94');
    for (let y = 13; y < 26; y += 6) c.hline(0, y, 70, '#bfae94');
    c.rect(0, 22, 70, 4, '#8a6a45');                             // counter top
    c.hline(0, 22, 70, '#a8855c');

    c.rect(84, 5, 12, 12, '#e8eef7');                            // wall clock
    c.frame(84, 5, 12, 12, INK);
    c.vline(90, 7, 4, INK); c.hline(90, 10, 3, INK);

    c.rect(124, 4, 28, 22, '#d7dce4');                           // fridge
    c.frame(124, 4, 28, 22, INK);
    c.hline(125, 13, 26, '#9aa4b2');
    c.vline(148, 7, 4, '#6b7688'); c.vline(148, 16, 4, '#6b7688');
    for (const [x, y, col] of [[127, 6, '#f5744d'], [133, 8, '#4fe8a8'], [141, 6, '#6fa8ff'], [129, 17, '#f5c542']]) {
      c.rect(x, y, 4, 3, col);
    }
    plant(c, 106);
  },

  /** Wellness Floor — mirrors, a bold stripe, suspiciously good lighting. */
  gym: (c) => {
    shell(c, { wall: '#3a2b4f', floor: '#4a3a5f', skirting: '#261a38' });
    floorboards(c, '#4a3a5f', 4);
    stripLights(c, 3, '#f0dcff');

    c.rect(5, 6, 56, 18, '#6a5a88');                             // mirror wall
    c.frame(5, 6, 56, 18, '#9b8ab8');
    c.rect(7, 8, 52, 14, '#7e6da0');
    for (let i = 0; i < 3; i++) c.rect(13 + i * 18, 9, 7, 2, '#c8b8e8');
    c.rect(8, 18, 48, 4, '#8e7cb0');                             // reflected floor

    c.rect(68, 13, W - 68, 3, '#b06de8');                        // stripe
    c.rect(68, 16, W - 68, 2, '#7a4fa8');

    c.rect(118, 5, 24, 6, '#2f2145');                            // bottle rack
    c.frame(118, 5, 24, 6, '#9b8ab8');
    for (let x = 121; x < 140; x += 5) c.rect(x, 3, 3, 4, '#4fc3e0');
    plant(c, 150);
  },

  /** Meeting Rooms — a pendant lamp and a roadmap nobody has updated. */
  meeting: (c) => {
    shell(c, { wall: '#4a333c', floor: '#5f4450', skirting: '#33222a' });
    floorboards(c, '#5f4450', 3);

    c.vline(40, 1, 4, '#2b2233');                                // pendant lamp
    c.rect(34, 5, 13, 3, '#f5c542');
    c.frame(34, 5, 13, 3, INK);
    c.rect(36, 8, 9, 1, '#fff3b055');
    c.rect(32, 9, 17, 1, '#fff3b030');
    c.rect(28, 10, 25, 1, '#fff3b016');

    wallPanel(c, 6, 11, 40, 14, '#f0e6ea', '#8a6a75');           // the roadmap
    for (let i = 0; i < 4; i++) {
      c.rect(9, 13 + i * 3, 8 + i * 7, 2, ['#e86d8a', '#f5c542', '#4fc3e0', '#4fe8a8'][i]);
    }
    c.vline(26, 12, 12, '#8a6a7599');

    nightWindow(c, 100, 5, 48, 19);
    plant(c, 56);
  },

  /** Rooftop Lounge — open to the sky, string lights, the city below. */
  lounge: (c) => {
    for (let y = 0; y < FLOOR_TOP; y++) {                        // night sky
      c.hline(0, y, W, shade('#0d2233', (y / FLOOR_TOP) * 0.55));
    }
    let seed = 99;
    const random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < 34; i++) {
      c.px(Math.floor(random() * W), Math.floor(random() * 14), random() > 0.6 ? '#ffffff' : '#9fc0e8');
    }

    let bx = 0;                                                  // skyline
    while (bx < W) {
      const bw = 5 + Math.floor(random() * 9);
      const bh = 4 + Math.floor(random() * 9);
      c.rect(bx, 22 - bh, bw, bh + 3, '#0a1a2b');
      for (let ly = 24 - bh; ly < 24; ly += 3) {
        for (let lx = bx + 1; lx < bx + bw - 1; lx += 3) {
          if (random() > 0.5) c.px(lx, ly, '#f5c542');
        }
      }
      bx += bw + 1;
    }

    c.rect(0, 24, W, 2, '#2f4a55');                              // parapet
    c.rect(0, SKIRT_TOP, W, 2, '#3a5a66');
    c.rect(0, FLOOR_TOP, W, H - FLOOR_TOP, '#7a5f42');           // decking
    for (let y = FLOOR_TOP + 2; y < H; y += 2) c.hline(0, y, W, shade('#7a5f42', -0.2));
    for (let x = 4; x < W; x += 12) c.vline(x, 19, 6, '#4a6a76'); // railing
    c.hline(0, 19, W, '#5f8290');

    for (let x = 0; x < W; x += 14) {                            // string lights
      c.hline(x, 3, 14, '#2b2233');
      c.px(x + 5, 4, '#2b2233');
      c.rect(x + 4, 5, 3, 3, ['#f5c542', '#f5744d', '#4fe8a8', '#6fa8ff'][(x / 14) % 4]);
    }
    plant(c, 148, '#3a5a66');
  },

  /** Executive Suite — wood panelling, a rug, and an arched window. */
  exec: (c) => {
    shell(c, { wall: '#3f3320', floor: '#5a4a2e', skirting: '#2a2114' });
    floorboards(c, '#5a4a2e', 3);

    c.rect(0, 15, W, 11, '#58432a');                             // panelling
    for (let x = 0; x < W; x += 14) {
      c.vline(x, 15, 11, '#3f2f1c');
      c.frame(x + 2, 17, 10, 7, '#6b5233');
    }
    c.hline(0, 15, W, '#7a5f3a');

    nightWindow(c, 98, 5, 46, 19, { frame: '#6b5233' });          // arched window
    c.rect(98, 3, 46, 2, '#6b5233');
    c.rect(102, 1, 38, 2, '#6b5233');

    c.rect(12, 4, 24, 18, '#f5c542');                            // portrait of you
    c.frame(12, 4, 24, 18, '#8a6a10');
    c.rect(15, 6, 18, 14, '#3a2b33');
    c.rect(20, 9, 8, 7, '#d9a88a');
    c.rect(18, 15, 12, 5, '#2b3a5a');
    c.px(22, 11, INK); c.px(26, 11, INK);

    c.rect(44, 31, 66, 5, '#5e2630');                            // rug
    c.frame(44, 31, 66, 5, '#874049');
    c.hline(48, 33, 58, '#874049');
    plant(c, 150, '#8a6a10');
  },
};

/** Draw one room backdrop and return its 160x36 canvas. */
export function drawRoom(id) {
  const draw = ROOMS[id];
  if (!draw) return null;
  const canvas = new Canvas(W, H);
  draw(canvas);
  return canvas;
}

export const ROOM_KEYS = Object.keys(ROOMS);
export const ROOM_SIZE = { width: W, height: H };
export default ROOMS;
