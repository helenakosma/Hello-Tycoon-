/**
 * UI icons — the little pixel glyphs in the HUD and problem list.
 *
 * Drawn at 12x12 and exported at 2x (24x24), which is exactly the size they
 * display at, so they stay perfectly crisp.
 *
 * Keys here become public/assets/ui/<key>.png, referenced from the game as the
 * sprite key "ui.<key>".
 */

import { Canvas } from './canvas.mjs';

const INK = '#1b1622';

const SPRITES = {
  /** The Bytes coin. Kept simple — it is shown at 24px and must read instantly. */
  coin: (c) => {
    // Octagonal disc: three overlapping bars make a clean round-ish coin.
    c.rect(4, 0, 4, 12, '#f5c542');
    c.rect(2, 1, 8, 10, '#f5c542');
    c.rect(1, 2, 10, 8, '#f5c542');
    c.rect(0, 4, 12, 4, '#f5c542');
    // Shading: darker along the bottom-right, lighter top-left.
    c.rect(2, 8, 8, 2, '#d99f20');
    c.rect(4, 10, 4, 1, '#d99f20');
    c.rect(9, 4, 2, 4, '#d99f20');
    c.rect(3, 2, 4, 2, '#fff3b0');
    c.px(2, 4, '#fff3b0');
    // A single chunky mark in the middle so it reads as currency, not a dot.
    c.rect(5, 4, 3, 1, '#8a6a10');
    c.rect(5, 6, 3, 1, '#8a6a10');
    c.px(7, 5, '#8a6a10');
    c.px(5, 5, '#8a6a10');
  },

  /** A filled difficulty star. */
  star: (c) => {
    c.rect(5, 1, 2, 3, '#f5c542');
    c.rect(1, 4, 10, 2, '#f5c542');
    c.rect(2, 6, 8, 2, '#f5c542');
    c.rect(3, 8, 2, 3, '#f5c542');
    c.rect(7, 8, 2, 3, '#f5c542');
    c.rect(5, 4, 2, 3, '#fff3b0');
    c.px(4, 5, '#fff3b0');
    c.rect(2, 7, 8, 1, '#d99f20');
  },

  /** An empty difficulty star. */
  star_empty: (c) => {
    c.rect(5, 1, 2, 3, '#4d5a72');
    c.rect(1, 4, 10, 2, '#4d5a72');
    c.rect(2, 6, 8, 2, '#4d5a72');
    c.rect(3, 8, 2, 3, '#4d5a72');
    c.rect(7, 8, 2, 3, '#4d5a72');
  },

  /** A padlock for locked topics. */
  lock: (c) => {
    c.frame(4, 1, 4, 5, '#8b97a8');         // shackle
    c.rect(5, 4, 2, 2, null);
    c.rect(2, 5, 8, 6, '#b7c2d0');
    c.frame(2, 5, 8, 6, INK);
    c.rect(3, 6, 6, 1, '#dde5ef');
    c.rect(5, 7, 2, 3, '#5f6b7d');
  },

  /** A tick for solved problems. */
  check: (c) => {
    c.rect(2, 6, 2, 2, '#2ee6a8');
    c.rect(3, 7, 2, 2, '#2ee6a8');
    c.rect(4, 8, 2, 2, '#2ee6a8');
    c.rect(6, 6, 2, 2, '#2ee6a8');
    c.rect(7, 4, 2, 2, '#4ff5bb');
    c.rect(8, 2, 2, 2, '#4ff5bb');
  },

  /** A lightning bolt for passive income per second. */
  bolt: (c) => {
    c.rect(6, 1, 3, 2, '#2ee6a8');
    c.rect(5, 3, 3, 2, '#2ee6a8');
    c.rect(4, 5, 5, 2, '#4ff5bb');
    c.rect(4, 7, 3, 2, '#2ee6a8');
    c.rect(3, 9, 3, 2, '#2ee6a8');
  },

  /** A trophy for Reputation. */
  trophy: (c) => {
    c.rect(3, 1, 6, 5, '#f5c542');
    c.rect(4, 6, 4, 2, '#d99f20');
    c.rect(2, 2, 1, 3, '#d99f20');          // handles
    c.rect(9, 2, 1, 3, '#d99f20');
    c.rect(5, 8, 2, 2, '#8a6a10');
    c.rect(3, 10, 6, 2, '#8a6a10');
    c.rect(4, 2, 2, 2, '#fff3b0');
    c.frame(3, 1, 6, 5, INK);
  },

  /** A little tower for the floor count. */
  floors: (c) => {
    c.rect(2, 2, 8, 9, '#5b8def');
    c.frame(2, 2, 8, 9, INK);
    c.rect(4, 1, 4, 1, '#8fb7f5');
    for (let y = 4; y <= 8; y += 2) {
      c.rect(4, y, 2, 1, '#fff3b0');
      c.rect(7, y, 2, 1, '#fff3b0');
    }
  },

  /** A spark for level-ups and rewards. */
  spark: (c) => {
    c.rect(5, 0, 2, 12, '#b06de8');
    c.rect(0, 5, 12, 2, '#b06de8');
    c.rect(4, 4, 4, 4, '#d9a8f5');
    c.rect(5, 5, 2, 2, '#ffffff');
  },
};

/** Draw one UI icon and return its 12x12 canvas. */
export function drawUi(key) {
  const draw = SPRITES[key];
  if (!draw) return null;
  const canvas = new Canvas(12, 12);
  draw(canvas);
  return canvas;
}

export const UI_KEYS = Object.keys(SPRITES);
export default SPRITES;
