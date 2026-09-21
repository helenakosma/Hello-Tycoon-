/**
 * npm run art  —  regenerate every sprite in public/assets/
 *
 * Reads the game's own data files so it always draws exactly the rooms and
 * item tiers that exist. Add a new upgrade tier to src/data/items.js, run this,
 * and you get a placeholder-coloured sprite for it straight away (then replace
 * it with something nicer).
 *
 * The output files are ordinary PNGs. Editing them by hand in a pixel editor is
 * the expected workflow — this script is just how the starting set was made,
 * so DO NOT run it after you have hand-edited the art unless you want your
 * changes overwritten.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import ROOMS from '../../src/data/rooms.js';
import ITEMS from '../../src/data/items.js';
import { Canvas } from './canvas.mjs';
import { drawRoom } from './rooms.mjs';
import { drawItem } from './items.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(here, '..', '..', 'public', 'assets');

const ROOM_SCALE = 2;   // 160x48 -> 320x96
const ITEM_SCALE = 2;   // 16x16  -> 32x32

mkdirSync(join(assetsDir, 'rooms'), { recursive: true });
mkdirSync(join(assetsDir, 'items'), { recursive: true });

let written = 0;
const missing = [];

/**
 * Fallback for a sprite nobody has drawn yet: the item's own placeholder
 * colour as a rounded chip, so a new upgrade tier still looks deliberate.
 */
function placeholderItem(tier) {
  const c = new Canvas(16, 16);
  const color = tier?.placeholder?.color || '#7d8595';
  c.rect(3, 4, 10, 9, color);
  c.frame(3, 4, 10, 9, '#2b2233');
  c.hline(4, 5, 8, '#ffffff44');
  c.rect(3, 14, 10, 1, '#00000030');
  return c;
}

// --- rooms -----------------------------------------------------------------

for (const room of ROOMS) {
  const canvas = drawRoom(room.id);
  if (!canvas) { missing.push(`room "${room.id}" has no drawing in rooms.mjs`); continue; }
  const file = join(assetsDir, 'rooms', `${room.id}.png`);
  writeFileSync(file, canvas.scale(ROOM_SCALE).toPng());
  written++;
}

// --- items -----------------------------------------------------------------

for (const [roomType, lines] of Object.entries(ITEMS)) {
  for (const line of lines) {
    // "item.chair" -> "chair"
    const base = line.sprite.replace(/^item\./, '');
    line.tiers.forEach((tier, index) => {
      const key = `${base}.t${index + 1}`;
      let canvas = drawItem(key);
      if (!canvas) {
        missing.push(`${roomType}/${line.id} tier ${index + 1} (key "${key}") — used a plain placeholder`);
        canvas = placeholderItem(tier);
      }
      const file = join(assetsDir, 'items', `${base}_t${index + 1}.png`);
      writeFileSync(file, canvas.scale(ITEM_SCALE).toPng());
      written++;
    });
  }
}

console.log(`\nWrote ${written} sprites into public/assets/`);
if (missing.length) {
  console.log(`\n${missing.length} sprite(s) still need art:`);
  missing.forEach((m) => console.log('  - ' + m));
}
console.log('\nSet ASSET_MODE to "auto" in src/data/assets.js to use them.\n');
