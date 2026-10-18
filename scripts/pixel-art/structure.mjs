/**
 * The parts of the building that aren't rooms: the roof, the ground-floor
 * lobby, and the city skyline behind the tower.
 *
 * These are what turn a stack of room pictures into something that reads as a
 * building standing in a place. Each has its own size (unlike the 12x12 UI
 * icons), and all are exported at 3x into public/assets/ui/.
 */

import { Canvas, shade } from './canvas.mjs';

const INK = '#141a26';

/** Concrete, used for the roof slab and the lobby frontage. */
const CONCRETE = '#4a5568';
const CONCRETE_DARK = '#2f3846';
const CONCRETE_LIGHT = '#67748a';

/** A lit window, picked from a small palette so the tower looks occupied. */
const WINDOW_LIT = ['#f5c542', '#ffe9a8', '#8fb7f5'];

const SPRITES = {
  /**
   * The rooftop: parapet, water tower, aerial, air-conditioning units.
   * 160x30, sits on top of the highest floor and stretches to the building's
   * width, so keep the detail spread out rather than clustered in the middle.
   */
  rooftop: {
    width: 160,
    height: 30,
    draw: (c) => {
      // Night sky shows through above the parapet.
      c.rect(0, 0, 160, 22, '#0d1526');

      // --- water tower, left of centre --------------------------------
      c.rect(26, 2, 14, 9, '#7a5f42');
      c.frame(26, 2, 14, 9, INK);
      c.hline(27, 4, 12, '#9c7b57');
      c.rect(24, 1, 18, 2, '#6b5133');          // lid
      c.frame(24, 1, 18, 2, INK);
      for (const x of [28, 32, 37]) c.vline(x, 11, 8, '#4a3a2a');   // legs
      c.hline(27, 15, 12, '#4a3a2a');           // cross-brace

      // --- aerial mast, right of centre -------------------------------
      c.vline(112, 0, 19, '#8b97a8');
      c.vline(113, 0, 19, '#6b7688');
      for (const y of [4, 9, 14]) { c.hline(109, y, 8, '#6b7688'); }
      c.px(112, 0, '#f5744d');                  // warning light
      c.px(113, 0, '#f5744d');
      c.rect(111, 1, 4, 1, '#f5744d55');

      // --- air-conditioning units -------------------------------------
      for (const x of [58, 76, 134]) {
        c.rect(x, 13, 12, 6, CONCRETE);
        c.frame(x, 13, 12, 6, INK);
        c.hline(x + 1, 14, 10, CONCRETE_LIGHT);
        for (let i = x + 2; i < x + 10; i += 3) c.vline(i, 16, 2, CONCRETE_DARK);
      }

      // --- a stair hut ------------------------------------------------
      c.rect(90, 9, 14, 10, CONCRETE_DARK);
      c.frame(90, 9, 14, 10, INK);
      c.rect(94, 13, 5, 6, '#1b2230');          // doorway
      c.px(98, 16, '#f5c542');

      // --- the parapet the whole roof sits behind ----------------------
      c.rect(0, 19, 160, 4, CONCRETE);
      c.hline(0, 19, 160, CONCRETE_LIGHT);
      c.hline(0, 22, 160, CONCRETE_DARK);
      // Coping stones, so the edge isn't a flat bar.
      for (let x = 0; x < 160; x += 8) c.vline(x, 20, 2, shade(CONCRETE, -0.12));

      // --- the slab the top floor hangs from ---------------------------
      c.rect(0, 23, 160, 7, CONCRETE_DARK);
      c.hline(0, 23, 160, CONCRETE);
      c.hline(0, 29, 160, INK);
    },
  },

  /**
   * The ground floor: pavement, the entrance, and the company plaque.
   * 160x34, sits under the lowest floor.
   */
  lobby: {
    width: 160,
    height: 34,
    draw: (c) => {
      // Lobby frontage: tall glass, warmly lit from inside.
      c.rect(0, 0, 160, 22, '#2b3445');
      c.hline(0, 0, 160, CONCRETE);
      for (let x = 4; x < 156; x += 16) {
        c.rect(x, 3, 12, 17, '#f0d9a0');        // glass, lit
        c.frame(x, 3, 12, 17, '#1f2736');
        c.rect(x + 1, 4, 10, 6, '#fff0c8');     // brighter near the ceiling
      }

      // The entrance, dead centre: double doors under an awning.
      c.rect(64, 0, 32, 4, '#3a4657');
      c.frame(64, 0, 32, 4, INK);
      c.rect(66, 4, 28, 18, '#1b2230');
      c.frame(66, 4, 28, 18, CONCRETE);
      c.rect(68, 6, 11, 16, '#cfe4f5');         // left door
      c.rect(81, 6, 11, 16, '#cfe4f5');         // right door
      c.vline(79, 6, 16, '#3a4657');
      c.vline(80, 6, 16, '#3a4657');
      c.px(77, 14, '#6b7688'); c.px(82, 14, '#6b7688');   // handles
      // Light spilling onto the pavement from the doorway.
      c.rect(62, 22, 36, 2, '#f5e3b033');
      c.rect(58, 24, 44, 2, '#f5e3b01f');

      // Plinth and pavement.
      c.rect(0, 22, 160, 4, CONCRETE_DARK);
      c.hline(0, 22, 160, CONCRETE);
      c.rect(0, 26, 160, 8, '#39414f');
      c.hline(0, 26, 160, '#4d5765');
      for (let x = 0; x < 160; x += 12) c.vline(x, 27, 7, '#2f3744');   // paving slabs

      // A couple of planters either side of the door.
      for (const x of [48, 104]) {
        c.rect(x, 17, 8, 5, '#6b5133');
        c.frame(x, 17, 8, 5, INK);
        c.rect(x + 1, 13, 6, 4, '#4f9f5f');
        c.px(x + 3, 12, '#6fbf7f');
      }
    },
  },

  /**
   * The distant city, sitting behind the tower.
   * 160x56 and drawn to TILE horizontally — the first and last columns are
   * kept clear of buildings so the repeat has no visible seam.
   */
  skyline: {
    width: 160,
    height: 56,
    draw: (c) => {
      let seed = 2024;
      const random = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      // Two layers: a hazy far one, then a darker near one in front.
      const layer = (color, minH, maxH, step, lightChance) => {
        let x = 1;
        while (x < 159) {
          const w = step + Math.floor(random() * step);
          const h = minH + Math.floor(random() * (maxH - minH));
          const top = 56 - h;
          const width = Math.min(w, 159 - x);
          c.rect(x, top, width, h, color);
          c.hline(x, top, width, shade(color, 0.18));
          for (let ly = top + 2; ly < 54; ly += 4) {
            for (let lx = x + 1; lx < x + width - 1; lx += 3) {
              if (random() > lightChance) {
                c.px(lx, ly, WINDOW_LIT[Math.floor(random() * WINDOW_LIT.length)]);
              }
            }
          }
          x += width + 1 + Math.floor(random() * 2);
        }
      };

      layer('#141f33', 16, 34, 7, 0.72);   // far
      layer('#0d1626', 8, 22, 9, 0.6);     // near
    },
  },
};

/** Draw one building part and return its canvas. */
export function drawStructure(key) {
  const spec = SPRITES[key];
  if (!spec) return null;
  const canvas = new Canvas(spec.width, spec.height);
  spec.draw(canvas);
  return canvas;
}

export const STRUCTURE_KEYS = Object.keys(SPRITES);
export default SPRITES;
