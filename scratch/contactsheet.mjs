import { writeFileSync } from 'node:fs';
import { Canvas } from '../scripts/pixel-art/canvas.mjs';
import { drawRoom, ROOM_KEYS } from '../scripts/pixel-art/rooms.mjs';
import { drawItem, ITEM_KEYS } from '../scripts/pixel-art/items.mjs';

// --- rooms sheet: each room at 2x, stacked -------------------------------
const roomSheet = new Canvas(320, ROOM_KEYS.length * 100);
roomSheet.rect(0, 0, roomSheet.width, roomSheet.height, '#101418');
ROOM_KEYS.forEach((id, i) => {
  const r = drawRoom(id).scale(2);
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      const k = (y * r.width + x) * 4;
      if (r.data[k + 3]) roomSheet.px(x, i * 100 + y, [r.data[k], r.data[k + 1], r.data[k + 2], r.data[k + 3]]);
    }
  }
});
writeFileSync('scratch/sheet-rooms.png', roomSheet.toPng());

// --- items sheet: 8 per row at 4x, on a checkerboard ----------------------
const CELL = 72;
const COLS = 8;
const rows = Math.ceil(ITEM_KEYS.length / COLS);
const itemSheet = new Canvas(COLS * CELL, rows * CELL);
for (let y = 0; y < itemSheet.height; y++) {
  for (let x = 0; x < itemSheet.width; x++) {
    itemSheet.px(x, y, (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? '#2a3038' : '#343b45');
  }
}
ITEM_KEYS.forEach((key, i) => {
  const s = drawItem(key).scale(4);
  const ox = (i % COLS) * CELL + 4;
  const oy = Math.floor(i / COLS) * CELL + 4;
  for (let y = 0; y < s.height; y++) {
    for (let x = 0; x < s.width; x++) {
      const k = (y * s.width + x) * 4;
      if (s.data[k + 3]) itemSheet.px(ox + x, oy + y, [s.data[k], s.data[k + 1], s.data[k + 2], s.data[k + 3]]);
    }
  }
});
writeFileSync('scratch/sheet-items.png', itemSheet.toPng());

console.log('rooms:', ROOM_KEYS.join(' '));
console.log('items order:', ITEM_KEYS.join(' '));
