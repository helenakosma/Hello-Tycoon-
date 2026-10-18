/**
 * Top-down machine sprites — what you see in the room view below the tower.
 *
 * Same upgrade lines and tiers as items.mjs, but drawn from above so they can
 * be placed on a floor plan. Each is 16x16 and exported at 3x (48x48).
 *
 * The key must match the item's `sprite` field in src/data/items.js minus the
 * "item." prefix, so `item.chair` tier 2 is the key 'chair.t2'. generate.mjs
 * writes them as public/assets/items/<name>_t<N>_top.png.
 *
 * ARTISTS: these are ordinary PNGs like everything else — paint over them.
 */

import { Canvas, shade } from './canvas.mjs';

const INK = '#1b1622';
const DROP = '#00000038';   // soft shadow under a machine, offset down-right

/** Filled box with an outline and a top-left highlight. */
function box(c, x, y, w, h, fill, { outline = INK, highlight = true } = {}) {
  c.rect(x, y, w, h, fill);
  c.frame(x, y, w, h, outline);
  if (highlight && w > 2 && h > 2) c.hline(x + 1, y + 1, w - 2, shade(fill, 0.28));
  return c;
}

/** The shadow that lifts a machine off the floor plan. */
function drop(c, x, y, w, h) {
  c.rect(x + 1, y + h, w, 1, DROP);
  c.rect(x + w, y + 1, 1, h, DROP);
  return c;
}

/** A rough filled circle, for round things seen from above. */
function disc(c, cx, cy, r, fill, outline = INK) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) c.px(cx + x, cy + y, fill);
    }
  }
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d <= r * r && d > (r - 1) * (r - 1)) c.px(cx + x, cy + y, outline);
    }
  }
  return c;
}

/** A chair seen from above: seat square plus a backrest bar. */
function chairTop(c, x, y, size, fill, backSide = 'top') {
  box(c, x, y, size, size, fill);
  if (backSide === 'top') c.rect(x, y, size, 2, shade(fill, -0.35));
  else c.rect(x, y + size - 2, size, 2, shade(fill, -0.35));
  c.frame(x, y, size, size, INK);
  return c;
}

const SPRITES = {
  // ======================= BULLPEN =========================================
  'chair.t1': (c) => {                     // folding chair
    drop(c, 5, 5, 6, 6);
    chairTop(c, 5, 5, 6, '#8e97a6');
  },
  'chair.t2': (c) => {                     // ergonomic, with armrests
    drop(c, 4, 4, 8, 8);
    chairTop(c, 4, 4, 8, '#4f8ce0');
    c.rect(2, 7, 2, 3, '#3a6ab0');         // armrests
    c.rect(12, 7, 2, 3, '#3a6ab0');
    c.px(7, 9, '#7fb2f5'); c.px(8, 9, '#7fb2f5');
  },
  'chair.t3': (c) => {                     // gaming chair, winged and lit
    drop(c, 3, 3, 10, 10);
    chairTop(c, 3, 3, 10, '#a45de8');
    c.rect(3, 3, 2, 4, '#f5c542');         // wing tips
    c.rect(11, 3, 2, 4, '#f5c542');
    c.rect(1, 6, 2, 4, '#7a3fb8');         // armrests
    c.rect(13, 6, 2, 4, '#7a3fb8');
    c.rect(5, 8, 6, 3, '#c78cf5');
    c.rect(4, 13, 8, 1, '#a45de855');      // under-glow
  },

  'computer.t1': (c) => {                  // CRT on a desk corner
    drop(c, 3, 2, 10, 11);
    box(c, 3, 2, 10, 6, '#c9bfa0');        // the monitor's footprint
    c.rect(5, 3, 6, 3, '#6f7f6a');
    box(c, 4, 9, 8, 4, '#b5ab8d');         // keyboard
    for (let y = 10; y < 12; y++) for (let x = 5; x < 11; x += 2) c.px(x, y, '#8a8370');
  },
  'computer.t2': (c) => {                  // two screens side by side
    drop(c, 1, 2, 14, 11);
    box(c, 1, 2, 6, 5, '#3a4657');
    c.rect(2, 3, 4, 3, '#6fa8ff');
    box(c, 9, 2, 6, 5, '#3a4657');
    c.rect(10, 3, 4, 3, '#6fa8ff');
    box(c, 3, 9, 10, 4, '#2f3644');        // keyboard
    for (let y = 10; y < 12; y++) for (let x = 4; x < 12; x += 2) c.px(x, y, '#5c6b80');
  },
  'computer.t3': (c) => {                  // ultrawide, curved, RGB
    drop(c, 0, 2, 16, 11);
    box(c, 0, 2, 16, 5, '#2f3644', { highlight: false });
    const rgb = ['#ff5f8d', '#ff9f43', '#f5e663', '#4fe8a8', '#4fa8ff', '#b06de8'];
    for (let x = 1; x < 15; x++) c.vline(x, 3, 3, rgb[Math.floor(((x - 1) / 14) * rgb.length)]);
    c.hline(1, 3, 14, '#ffffff55');
    box(c, 3, 9, 10, 4, '#262c38');
    for (let y = 10; y < 12; y++) for (let x = 4; x < 12; x += 2) c.px(x, y, '#b06de8');
  },

  'desk.t1': (c) => {                      // particleboard slab
    drop(c, 1, 4, 14, 8);
    box(c, 1, 4, 14, 8, '#a8855c');
    c.hline(2, 9, 12, shade('#a8855c', -0.3));
  },
  'desk.t2': (c) => {                      // sit/stand, with a control pad
    drop(c, 1, 3, 14, 9);
    box(c, 1, 3, 14, 9, '#b89a72');
    c.rect(11, 9, 3, 2, '#4f8ce0');
    c.hline(2, 8, 12, shade('#b89a72', -0.28));
  },
  'desk.t3': (c) => {                      // motorised L-shaped corner desk
    drop(c, 0, 2, 15, 12);
    box(c, 0, 2, 10, 6, '#9b7bd4');
    box(c, 8, 7, 7, 7, '#8f6cce');
    c.px(2, 4, '#f5c542');
    c.rect(1, 13, 13, 1, '#b06de844');
  },

  // ======================= SERVER ROOM =====================================
  'rack.t1': (c) => {                      // a tower PC on the floor
    drop(c, 5, 3, 6, 10);
    box(c, 5, 3, 6, 10, '#7a8391');
    c.hline(6, 5, 4, '#5c6673');
    c.px(6, 11, '#4fe86a');
  },
  'rack.t2': (c) => {                      // one 19" rack
    drop(c, 3, 2, 10, 12);
    box(c, 3, 2, 10, 12, '#39424f');
    for (let y = 4; y <= 11; y += 2) {
      c.rect(4, y, 8, 1, '#556173');
      c.px(5, y, '#2ee6a8'); c.px(8, y, '#2ee6a8');
    }
  },
  'rack.t3': (c) => {                      // a row of blades
    drop(c, 1, 2, 14, 12);
    for (const x of [1, 6, 11]) {
      box(c, x, 2, 4, 12, '#2f3a46');
      for (let y = 4; y <= 11; y += 2) c.rect(x + 1, y, 2, 1, '#2ee6a8');
    }
  },
  'rack.t4': (c) => {                      // quantum pod, glowing core
    drop(c, 2, 2, 12, 12);
    disc(c, 8, 8, 6, '#1d2b33');
    disc(c, 8, 8, 4, '#0f5f66', '#0f5f66');
    disc(c, 8, 8, 2, '#4fe8f5', '#7df5d0');
    c.px(8, 8, '#ffffff');
    c.px(4, 4, '#7df5d0'); c.px(12, 12, '#7df5d0');
  },

  'cooling.t1': (c) => {                   // desk fan, blades from above
    drop(c, 4, 4, 8, 8);
    disc(c, 8, 8, 4, '#c8d2e0');
    c.rect(7, 5, 2, 6, '#8e97a6');
    c.rect(5, 7, 6, 2, '#8e97a6');
    c.px(8, 8, INK);
  },
  'cooling.t2': (c) => {                   // wall air-con blowing into the room
    drop(c, 1, 2, 14, 4);
    box(c, 1, 2, 14, 4, '#e8eef7');
    c.px(12, 3, '#4fc3e0');
    for (let x = 3; x <= 12; x += 3) {
      c.vline(x, 8, 2, '#8fe0f5');
      c.vline(x + 1, 11, 2, '#bfeeff');
    }
  },
  'cooling.t3': (c) => {                   // liquid loop snaking across the floor
    drop(c, 2, 3, 12, 10);
    box(c, 2, 3, 12, 10, '#26313d', { highlight: false });
    c.frame(4, 5, 8, 6, '#4fd6e8');
    c.frame(5, 6, 6, 4, '#7df0ff');
    c.rect(6, 7, 4, 2, '#2a4a5a');
    c.px(3, 4, '#5de8d6'); c.px(12, 11, '#5de8d6');
  },

  // ======================= BREAK ROOM ======================================
  'coffee.t1': (c) => {                    // drip pot on a hotplate
    drop(c, 4, 4, 8, 8);
    box(c, 4, 4, 8, 8, '#8e97a6');
    disc(c, 8, 8, 2, '#3a2b22');
    c.px(8, 8, '#6b3f26');
    c.px(5, 5, '#f5744d');
  },
  'coffee.t2': (c) => {                    // espresso bar counter
    drop(c, 1, 3, 14, 8);
    box(c, 1, 3, 14, 8, '#d7dce4');
    c.rect(2, 4, 12, 2, '#f0f3f7');
    c.px(3, 8, '#f5c542'); c.px(5, 8, '#2ee6a8');
    disc(c, 11, 8, 2, '#ffffff');
    c.px(11, 8, '#6b3f26');
  },
  'coffee.t3': (c) => {                    // barista robot and its arm
    drop(c, 2, 3, 12, 10);
    box(c, 2, 3, 6, 10, '#c9d2de');
    c.rect(3, 4, 4, 2, '#4f8ce0');
    c.rect(8, 6, 5, 2, '#9aa4b2');         // the arm, reaching
    disc(c, 12, 10, 2, '#ffffff');
    c.px(12, 10, '#a8703f');
    c.px(13, 3, '#f5c542');
  },

  'snacks.t1': (c) => {                    // vending machine footprint
    drop(c, 4, 2, 8, 12);
    box(c, 4, 2, 8, 12, '#3f5a8a');
    c.rect(5, 3, 4, 8, '#7fb7e8');
    for (let y = 4; y <= 9; y += 2) c.rect(6, y, 2, 1, '#f5c542');
    c.rect(10, 4, 1, 3, '#26313d');
  },
  'snacks.t2': (c) => {                    // a long wall of shelves
    drop(c, 0, 3, 16, 7);
    box(c, 0, 3, 16, 7, '#8a6a45');
    const treats = ['#f5744d', '#f5c542', '#4fe8a8', '#6fa8ff', '#f57fb0'];
    for (let y = 4; y <= 7; y += 3) {
      for (let x = 1; x < 15; x += 2) c.rect(x, y, 2, 2, treats[(x + y) % treats.length]);
    }
  },
  'snacks.t3': (c) => {                    // catered table, dishes from above
    drop(c, 1, 3, 14, 10);
    box(c, 1, 3, 14, 10, '#f0f3f7');
    disc(c, 5, 7, 2, '#4fe8a8');
    disc(c, 10, 6, 2, '#f5744d');
    c.rect(7, 10, 5, 2, '#f5c542');
    c.frame(7, 10, 5, 2, INK);
  },

  // ======================= GYM =============================================
  'cardio.t1': (c) => {                    // one treadmill
    drop(c, 4, 1, 8, 13);
    box(c, 4, 1, 8, 13, '#3f4654');
    for (let y = 4; y < 13; y += 2) c.hline(5, y, 6, '#6b7688');
    c.rect(5, 2, 6, 2, '#26313d');         // console end
    c.px(7, 3, '#f5744d');
  },
  'cardio.t2': (c) => {                    // rowing machine, long rail
    drop(c, 2, 2, 12, 11);
    c.rect(6, 2, 4, 11, '#6b7688');        // rail
    c.frame(6, 2, 4, 11, INK);
    box(c, 5, 6, 6, 3, '#4f8ce0');         // seat
    box(c, 3, 2, 10, 3, '#39424f');        // flywheel end
    c.px(5, 3, '#b06de8'); c.px(10, 3, '#b06de8');
  },
  'cardio.t3': (c) => {                    // weight room: rack plus dumbbells
    drop(c, 1, 2, 14, 11);
    box(c, 1, 2, 14, 4, '#3f4654');        // the rack
    c.rect(0, 2, 3, 4, '#b06de8');
    c.rect(13, 2, 3, 4, '#b06de8');
    disc(c, 4, 10, 2, '#f5744d');
    disc(c, 9, 11, 2, '#f5c542');
    disc(c, 13, 9, 1, '#f5744d');
  },

  'recovery.t1': (c) => {                  // yoga mat, rolled out
    drop(c, 3, 2, 10, 12);
    box(c, 3, 2, 10, 12, '#6fbf8f');
    c.hline(4, 4, 8, '#9fe0b8');
    c.hline(4, 11, 8, '#4f9f70');
  },
  'recovery.t2': (c) => {                  // massage chairs
    drop(c, 2, 3, 12, 10);
    chairTop(c, 2, 3, 6, '#7a4fa8');
    chairTop(c, 9, 6, 6, '#7a4fa8');
    c.px(4, 6, '#f5c542'); c.px(11, 9, '#f5c542');
  },
  'recovery.t3': (c) => {                  // sauna and cold plunge
    drop(c, 1, 2, 14, 11);
    box(c, 1, 2, 6, 11, '#a8763f');
    c.hline(2, 6, 4, shade('#a8763f', -0.3));
    c.px(3, 4, '#ffffff66');
    box(c, 9, 3, 6, 9, '#2f6f8f');
    c.rect(10, 4, 4, 7, '#4fc3e0');
    c.px(12, 7, '#ffffff');
  },

  // ======================= MEETING ROOMS ===================================
  'table.t1': (c) => {                     // folding table
    drop(c, 2, 5, 12, 6);
    box(c, 2, 5, 12, 6, '#c9c2b0');
  },
  'table.t2': (c) => {                     // conference table with chairs round it
    drop(c, 3, 4, 10, 8);
    box(c, 3, 4, 10, 8, '#9c6b4a');
    c.hline(4, 6, 8, shade('#9c6b4a', 0.3));
    for (const x of [4, 9]) { chairTop(c, x, 0, 3, '#e86d8a', 'bottom'); chairTop(c, x, 13, 3, '#e86d8a'); }
    chairTop(c, 0, 6, 3, '#e86d8a');
    chairTop(c, 13, 6, 3, '#e86d8a');
  },
  'table.t3': (c) => {                     // the boardroom slab
    drop(c, 1, 4, 14, 8);
    box(c, 1, 4, 14, 8, '#3b2a33');
    c.hline(2, 6, 12, '#7a5a6a');
    c.rect(6, 7, 4, 2, '#f59bb0');
    for (const x of [2, 6, 10]) { chairTop(c, x, 0, 3, '#e86d8a', 'bottom'); chairTop(c, x, 13, 3, '#e86d8a'); }
    c.px(7, 8, '#f5c542');
  },

  'av.t1': (c) => {                        // wall-mounted TV, seen edge-on
    drop(c, 2, 2, 12, 3);
    box(c, 2, 2, 12, 3, '#2b2233', { highlight: false });
    c.rect(3, 3, 10, 1, '#4f6f8f');
  },
  'av.t2': (c) => {                        // projector and screen at each end
    drop(c, 1, 2, 14, 11);
    box(c, 1, 11, 6, 3, '#39424f');        // projector
    c.px(7, 12, '#f5f0c0');
    for (let i = 0; i < 7; i++) c.rect(7 + i, 11 - i, 2, 2, '#f5f0c022');
    box(c, 2, 1, 12, 2, '#e8eef7');        // screen
  },
  'av.t3': (c) => {                        // holo emitter, rings of light
    drop(c, 3, 3, 10, 10);
    disc(c, 8, 8, 5, '#39424f');
    disc(c, 8, 8, 4, '#4fd6e866', '#4fd6e8');
    disc(c, 8, 8, 2, '#bff6ff88', '#8ceef5');
    c.px(8, 8, '#ffffff');
  },

  // ======================= ROOFTOP LOUNGE ==================================
  'seating.t1': (c) => {                   // beanbags
    drop(c, 1, 3, 13, 10);
    disc(c, 5, 6, 3, '#e8884d');
    disc(c, 11, 10, 3, '#4fc3e0');
    c.px(4, 5, '#f5b07f'); c.px(10, 9, '#8fe0f5');
  },
  'seating.t2': (c) => {                   // modular L-shaped couch
    drop(c, 1, 2, 14, 11);
    box(c, 1, 2, 14, 5, '#3dd6e8');
    box(c, 1, 7, 6, 6, '#3dd6e8');
    c.rect(2, 2, 12, 2, shade('#3dd6e8', -0.3));
    c.rect(1, 7, 2, 6, shade('#3dd6e8', -0.3));
    c.px(9, 5, '#f5c542'); c.px(4, 10, '#f5744d');
  },
  'seating.t3': (c) => {                   // nap pods, lids from above
    drop(c, 1, 2, 14, 11);
    for (const x of [1, 9]) {
      box(c, x, 2, 6, 11, '#d7dce4', { highlight: false });
      c.rect(x + 1, 3, 4, 5, '#8ceef5');
      c.rect(x + 1, 9, 4, 3, '#4a5768');
    }
  },

  'games.t1': (c) => {                     // ping pong table with the net across
    drop(c, 1, 3, 14, 10);
    box(c, 1, 3, 14, 10, '#2f6f4f');
    c.hline(2, 8, 12, '#e8eef7');          // net
    c.hline(2, 4, 12, '#4f9f70');
    c.px(5, 6, '#f5c542');                 // the ball
  },
  'games.t2': (c) => {                     // arcade cabinet footprint
    drop(c, 4, 3, 8, 10);
    box(c, 4, 3, 8, 10, '#3a3f8a');
    c.rect(5, 4, 6, 2, '#f5744d');
    c.rect(5, 7, 6, 3, '#6fa8ff');
    c.px(6, 11, '#f5744d'); c.px(8, 11, '#f5c542'); c.px(10, 11, '#4fe8a8');
  },
  'games.t3': (c) => {                     // VR play area, marked out on the floor
    drop(c, 2, 2, 12, 12);
    c.frame(2, 2, 12, 12, '#b06de8');
    c.frame(3, 3, 10, 10, '#8ceef5');
    disc(c, 8, 8, 3, '#2b3140');
    c.rect(6, 7, 2, 2, '#8ceef5');
    c.rect(9, 7, 2, 2, '#8ceef5');
  },

  // ======================= EXECUTIVE SUITE =================================
  'execdesk.t1': (c) => {                  // sensible oak desk
    drop(c, 1, 3, 14, 9);
    box(c, 1, 3, 14, 9, '#a8763f');
    c.rect(2, 9, 4, 2, shade('#a8763f', -0.3));
    chairTop(c, 6, 12, 4, '#6b4a2a');
  },
  'execdesk.t2': (c) => {                  // mahogany, with a desk lamp
    drop(c, 1, 2, 14, 9);
    box(c, 1, 2, 14, 9, '#7a3b2e');
    c.hline(2, 4, 12, shade('#7a3b2e', 0.3));
    disc(c, 12, 5, 2, '#f5c542');
    c.px(12, 5, '#fff3b0');
    chairTop(c, 6, 12, 4, '#5a2b20');
  },
  'execdesk.t3': (c) => {                  // floating glass desk
    drop(c, 0, 2, 16, 9);
    c.rect(0, 2, 16, 9, '#bfe6ff88');
    c.frame(0, 2, 16, 9, '#7fb7c8');
    c.hline(1, 3, 14, '#ffffff');
    c.rect(5, 5, 6, 3, '#2b3140');         // a very thin laptop
    c.rect(6, 6, 4, 1, '#6fa8ff');
    chairTop(c, 6, 12, 4, '#9fd8e8');
  },

  'art.t1': (c) => {                       // poster against the wall
    drop(c, 3, 2, 10, 3);
    box(c, 3, 2, 10, 3, '#e8eef7');
    c.rect(4, 3, 8, 1, '#7fb7e8');
  },
  'art.t2': (c) => {                       // framed painting on an easel
    drop(c, 2, 2, 12, 4);
    box(c, 2, 2, 12, 4, '#f5c542', { highlight: false });
    c.rect(3, 3, 10, 2, '#2b2233');
    c.rect(4, 3, 3, 2, '#f5744d');
    c.rect(9, 3, 3, 2, '#4fc3e0');
  },
  'art.t3': (c) => {                       // sculpture on a round plinth
    drop(c, 4, 4, 8, 8);
    disc(c, 8, 8, 4, '#d7dce4');
    disc(c, 8, 8, 2, '#f5c542');
    c.px(8, 7, '#fff3b0');
    c.px(7, 9, '#d99f20');
  },
};

/** Draw one top-down machine sprite and return its 16x16 canvas. */
export function drawItemTop(key) {
  const draw = SPRITES[key];
  if (!draw) return null;
  const canvas = new Canvas(16, 16);
  draw(canvas);
  return canvas;
}

export const ITEM_TOP_KEYS = Object.keys(SPRITES);
export default SPRITES;
