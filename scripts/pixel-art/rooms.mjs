/**
 * Room backdrops — the cutaway interior behind each floor of the tower.
 *
 * Authored at 160x48 and upscaled 2x to 320x96 on export, which is the size
 * the floor renders at. Everything is drawn in code so the seven rooms share a
 * single visual language: same wall height, same skirting board, same floor
 * line, so the tower reads as one building rather than seven collages.
 *
 * Layout (in the 160x48 grid):
 *     y 0        ceiling line
 *     y 1-35     back wall
 *     y 36-37    skirting board
 *     y 38-47    floor
 *
 * The upgradeable furniture is NOT drawn here — the game overlays those item
 * sprites on top. What's here is the fixed set dressing: walls, windows,
 * lights, plants, the things that make a room feel like a place.
 */

import { Canvas, shade } from './canvas.mjs';

const W = 160;
const H = 48;
const WALL_BOTTOM = 35;
const SKIRT_TOP = 36;
const FLOOR_TOP = 38;

const INK = '#1b1622';

/** Wall, skirting board and floor — the shell every room starts from. */
function shell(c, { wall, floor, skirting }) {
  c.rect(0, 0, W, FLOOR_TOP, wall);
  c.hline(0, 0, W, shade(wall, -0.35));                  // ceiling shadow
  c.hline(0, 1, W, shade(wall, 0.12));
  // A soft vertical gradient down the wall so it doesn't read as a flat block.
  for (let y = 2; y <= WALL_BOTTOM; y++) {
    const t = (y - 2) / (WALL_BOTTOM - 2);
    if (t > 0.55) c.hline(0, y, W, shade(wall, -0.06 * ((t - 0.55) / 0.45)));
  }
  c.rect(0, SKIRT_TOP, W, 2, skirting);
  c.hline(0, SKIRT_TOP, W, shade(skirting, 0.3));
  c.rect(0, FLOOR_TOP, W, H - FLOOR_TOP, floor);
  c.hline(0, FLOOR_TOP, W, shade(floor, 0.22));
  return c;
}

/** Floorboards running left to right. */
function floorboards(c, floor, step = 4) {
  for (let y = FLOOR_TOP + step; y < H; y += step) c.hline(0, y, W, shade(floor, -0.14));
  return c;
}

/** Square floor tiles, for the harder-edged rooms. */
function floorTiles(c, floor, size = 8) {
  for (let x = 0; x < W; x += size) c.vline(x, FLOOR_TOP + 1, H - FLOOR_TOP - 1, shade(floor, -0.16));
  for (let y = FLOOR_TOP + 5; y < H; y += 5) c.hline(0, y, W, shade(floor, -0.1));
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
    const bw = 4 + Math.floor(random() * 5);
    const bh = 5 + Math.floor(random() * (h - 9));
    const top = base - bh;
    c.rect(bx, top, Math.min(bw, x + w - 4 - bx), bh, '#0e1730');
    for (let ly = top + 2; ly < base - 1; ly += 3) {
      for (let lx = bx + 1; lx < bx + bw - 1; lx += 3) {
        if (lx < x + w - 4 && random() > 0.45) c.px(lx, ly, random() > 0.5 ? '#f5c542' : '#8fb7f5');
      }
    }
    bx += bw + 1;
  }

  // A couple of stars and the window frame itself.
  c.px(x + 6, y + 4, '#ffffff'); c.px(x + w - 8, y + 5, '#cfe0ff');
  c.frame(x, y, w, h, INK);
  c.vline(x + Math.floor(w / 2), y + 2, h - 4, frame);    // mullion
  c.hline(x + 2, y + Math.floor(h / 2), w - 4, frame);    // transom
  return c;
}

/** A potted plant. Every office has one, and it makes a room feel lived in. */
function plant(c, x, potColor = '#b5643f') {
  const leaf = '#4f9f5f';
  c.rect(x + 2, FLOOR_TOP - 5, 5, 5, potColor);
  c.frame(x + 2, FLOOR_TOP - 5, 5, 5, INK);
  c.hline(x + 3, FLOOR_TOP - 5, 3, shade(potColor, 0.3));
  c.vline(x + 4, FLOOR_TOP - 10, 5, shade(leaf, -0.3));   // stem
  c.rect(x + 1, FLOOR_TOP - 13, 3, 3, leaf);
  c.rect(x + 5, FLOOR_TOP - 12, 3, 3, leaf);
  c.rect(x + 3, FLOOR_TOP - 15, 3, 3, shade(leaf, 0.18));
  c.px(x + 4, FLOOR_TOP - 14, shade(leaf, 0.4));
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
    c.rect(x - 4, 4, 20, 1, '#fff6d012');
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
    floorboards(c, '#4a5468', 5);
    stripLights(c, 3);
    nightWindow(c, 96, 8, 52, 24);
    wallPanel(c, 10, 9, 34, 20, '#e8eef7', '#9aa4b2');     // whiteboard
    for (const [x, y, w] of [[14, 13, 22], [14, 17, 16], [14, 21, 25], [14, 25, 12]]) {
      c.hline(x, y, w, '#5b8def');
    }
    c.rect(52, 12, 26, 16, '#26334a');                     // a pinned-up wall of tickets
    c.frame(52, 12, 26, 16, '#1b2537');
    for (let y = 14; y < 27; y += 4) {
      for (let x = 54; x < 76; x += 6) c.rect(x, y, 4, 2, ['#f5c542', '#2ee6a8', '#f5744d'][(x + y) % 3]);
    }
    plant(c, 150);
  },

  /** Server Room — no windows, all blinkenlights. */
  server: (c) => {
    shell(c, { wall: '#16332c', floor: '#1d3a33', skirting: '#0e241f' });
    floorTiles(c, '#1d3a33', 10);
    stripLights(c, 2, '#c8fff0');
    // Cable tray running the length of the ceiling.
    c.rect(0, 5, W, 3, '#0d211c');
    for (let x = 2; x < W; x += 5) c.px(x, 6, ['#2ee6a8', '#4fc3e0', '#f5c542'][x % 3]);
    // A wall of patch panels.
    for (const x of [8, 40]) {
      c.rect(x, 12, 26, 20, '#0e241f');
      c.frame(x, 12, 26, 20, '#2a5a4c');
      for (let y = 15; y < 30; y += 4) {
        for (let lx = x + 3; lx < x + 24; lx += 4) {
          c.rect(lx, y, 2, 2, (lx + y) % 7 === 0 ? '#f5c542' : '#2ee6a8');
        }
      }
    }
    // Warning sign, because it is very loud in here.
    wallPanel(c, 120, 10, 22, 14, '#f5c542', '#8a6a10');
    c.rect(126, 13, 10, 8, '#16332c');
    c.px(130, 15, '#f5c542'); c.px(130, 17, '#f5c542'); c.px(130, 19, '#f5c542');
  },

  /** Break Room — tiles, a clock, and a fridge covered in magnets. */
  breakroom: (c) => {
    shell(c, { wall: '#4a3527', floor: '#6b4f38', skirting: '#33241a' });
    floorTiles(c, '#6b4f38', 8);
    stripLights(c, 2, '#ffe9b0');
    // Tiled splashback along the counter.
    c.rect(0, 20, 78, 16, '#d8cdb8');
    for (let x = 0; x < 78; x += 6) c.vline(x, 20, 16, '#bfae94');
    for (let y = 20; y < 36; y += 6) c.hline(0, y, 78, '#bfae94');
    c.rect(0, 30, 78, 6, '#8a6a45');                       // counter top
    c.hline(0, 30, 78, '#a8855c');
    // Wall clock.
    c.rect(92, 8, 14, 14, '#e8eef7');
    c.frame(92, 8, 14, 14, INK);
    c.vline(99, 11, 5, INK); c.hline(99, 15, 4, INK);
    // Fridge.
    c.rect(124, 6, 30, 30, '#d7dce4');
    c.frame(124, 6, 30, 30, INK);
    c.hline(125, 18, 28, '#9aa4b2');
    c.vline(150, 10, 6, '#6b7688'); c.vline(150, 22, 6, '#6b7688');
    for (const [x, y, col] of [[128, 9, '#f5744d'], [134, 11, '#4fe8a8'], [142, 9, '#6fa8ff'], [130, 22, '#f5c542']]) {
      c.rect(x, y, 4, 3, col);
    }
    plant(c, 84);
  },

  /** Wellness Floor — mirrors, a stripe, and suspiciously good lighting. */
  gym: (c) => {
    shell(c, { wall: '#3a2b4f', floor: '#4a3a5f', skirting: '#261a38' });
    floorboards(c, '#4a3a5f', 6);
    stripLights(c, 3, '#f0dcff');
    // Mirror wall, with a faint reflection of the ceiling lights.
    c.rect(6, 8, 62, 26, '#6a5a88');
    c.frame(6, 8, 62, 26, '#9b8ab8');
    c.rect(8, 10, 58, 22, '#7e6da0');
    for (let i = 0; i < 3; i++) c.rect(16 + i * 20, 12, 8, 2, '#c8b8e8');
    c.rect(10, 26, 54, 6, '#8e7cb0');                      // reflected floor
    // Bold stripe along the wall, gym-style.
    c.rect(74, 18, W - 74, 4, '#b06de8');
    c.rect(74, 22, W - 74, 2, '#7a4fa8');
    // Wall-mounted water bottle rack.
    c.rect(120, 8, 26, 8, '#2f2145');
    c.frame(120, 8, 26, 8, '#9b8ab8');
    for (let x = 123; x < 144; x += 5) c.rect(x, 5, 3, 5, '#4fc3e0');
    plant(c, 150);
  },

  /** Meeting Rooms — a pendant lamp and a big roadmap on the wall. */
  meeting: (c) => {
    shell(c, { wall: '#4a333c', floor: '#5f4450', skirting: '#33222a' });
    floorboards(c, '#5f4450', 5);
    nightWindow(c, 100, 7, 52, 26);
    // Pendant lamp over where the table will be.
    c.vline(40, 1, 7, '#2b2233');
    c.rect(33, 8, 15, 4, '#f5c542');
    c.frame(33, 8, 15, 4, INK);
    c.rect(35, 12, 11, 1, '#fff3b055');
    c.rect(31, 13, 19, 1, '#fff3b033');
    c.rect(27, 14, 27, 1, '#fff3b018');
    // The roadmap nobody has updated.
    wallPanel(c, 8, 14, 44, 18, '#f0e6ea', '#8a6a75');
    for (let i = 0; i < 4; i++) {
      c.rect(12, 17 + i * 4, 10 + i * 8, 2, ['#e86d8a', '#f5c542', '#4fc3e0', '#4fe8a8'][i]);
    }
    c.vline(30, 16, 14, '#8a6a75');                        // today's date line
    plant(c, 62);
  },

  /** Rooftop Lounge — open to the sky, string lights, a city below. */
  lounge: (c) => {
    // The "wall" here is the night sky, so the shell is drawn differently.
    for (let y = 0; y < FLOOR_TOP; y++) {
      const t = y / FLOOR_TOP;
      c.hline(0, y, W, shade('#0d2233', t * 0.5));
    }
    // Stars.
    let seed = 99;
    const random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < 40; i++) {
      c.px(Math.floor(random() * W), Math.floor(random() * 22), random() > 0.6 ? '#ffffff' : '#9fc0e8');
    }
    // The city skyline, below the railing.
    let bx = 0;
    while (bx < W) {
      const bw = 6 + Math.floor(random() * 10);
      const bh = 4 + Math.floor(random() * 10);
      c.rect(bx, 26 - bh, bw, bh + 4, '#0a1a2b');
      for (let ly = 28 - bh; ly < 28; ly += 3) {
        for (let lx = bx + 1; lx < bx + bw - 1; lx += 3) {
          if (random() > 0.5) c.px(lx, ly, '#f5c542');
        }
      }
      bx += bw + 1;
    }
    // Deck floor and railing.
    c.rect(0, 30, W, 2, '#2f4a55');
    c.rect(0, FLOOR_TOP - 6, W, 6, '#3a5a66');
    c.rect(0, FLOOR_TOP, W, H - FLOOR_TOP, '#7a5f42');     // decking
    for (let y = FLOOR_TOP + 3; y < H; y += 3) c.hline(0, y, W, shade('#7a5f42', -0.18));
    for (let x = 4; x < W; x += 12) c.vline(x, 24, 8, '#4a6a76'); // railing posts
    c.hline(0, 24, W, '#5f8290');
    // String lights along the top.
    for (let x = 0; x < W; x += 14) {
      c.px(x + 5, 4, '#2b2233');
      c.rect(x + 4, 5, 3, 3, ['#f5c542', '#f5744d', '#4fe8a8', '#6fa8ff'][(x / 14) % 4]);
      c.hline(x, 3, 14, '#2b2233');
    }
    plant(c, 146, '#3a5a66');
  },

  /** Executive Suite — wood panelling, a rug, and an arched window. */
  exec: (c) => {
    shell(c, { wall: '#3f3320', floor: '#5a4a2e', skirting: '#2a2114' });
    floorboards(c, '#5a4a2e', 4);
    // Wood panelling on the lower wall.
    c.rect(0, 22, W, 14, '#58432a');
    for (let x = 0; x < W; x += 14) {
      c.vline(x, 22, 14, '#3f2f1c');
      c.frame(x + 2, 24, 10, 10, '#6b5233');
    }
    c.hline(0, 22, W, '#7a5f3a');
    // Arched window.
    nightWindow(c, 96, 6, 50, 26, { frame: '#6b5233' });
    c.rect(96, 4, 50, 2, '#6b5233');
    c.rect(100, 2, 42, 2, '#6b5233');
    // Portrait of the founder (you).
    c.rect(12, 6, 28, 22, '#f5c542');
    c.frame(12, 6, 28, 22, '#8a6a10');
    c.rect(15, 9, 22, 16, '#3a2b33');
    c.rect(22, 13, 8, 8, '#d9a88a');                       // a face, roughly
    c.rect(20, 20, 12, 5, '#2b3a5a');                      // shoulders
    c.px(24, 16, INK); c.px(28, 16, INK);
    // Rug.
    c.rect(40, 41, 70, 7, '#7a2f3a');
    c.frame(40, 41, 70, 7, '#a8505f');
    c.hline(44, 44, 62, '#a8505f');
    plant(c, 150, '#8a6a10');
  },
};

/** Draw one room backdrop and return its 160x48 canvas. */
export function drawRoom(id) {
  const draw = ROOMS[id];
  if (!draw) return null;
  const canvas = new Canvas(W, H);
  draw(canvas);
  return canvas;
}

export const ROOM_KEYS = Object.keys(ROOMS);
export default ROOMS;
