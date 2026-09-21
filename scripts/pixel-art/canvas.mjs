/**
 * A tiny pixel-art toolkit: draw on a grid, save a real PNG.
 *
 * Used by scripts/pixel-art/generate.mjs to build every sprite in
 * public/assets/. No image libraries — PNG is a simple enough format to write
 * directly, so the game has zero extra dependencies.
 *
 * TEACHERS / ARTISTS: you do not need this file to change the art. The
 * generated PNGs are ordinary images — open them in Aseprite, Piskel, Paint,
 * anything — and the game picks up your edits on the next refresh. This is only
 * here so the starter art can be regenerated with `npm run art`.
 */

import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// PNG writing
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/**
 * Encode RGBA pixel data as a PNG buffer.
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} rgba  width*height*4 bytes
 */
export function encodePng(width, height, rgba) {
  // Each scanline is prefixed with a filter byte; 0 means "no filter".
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.subarray(y * width * 4, (y + 1) * width * 4)
      .forEach((byte, i) => { raw[y * (width * 4 + 1) + 1 + i] = byte; });
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type 6 = RGBA
  ihdr[10] = 0;  // deflate
  ihdr[11] = 0;  // adaptive filtering
  ihdr[12] = 0;  // no interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

/** "#rrggbb" or "#rrggbbaa" -> [r, g, b, a]. `null` means transparent. */
export function parseColor(value) {
  if (!value) return [0, 0, 0, 0];
  if (Array.isArray(value)) return value;
  const hex = value.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255;
  return [r, g, b, a];
}

/** Lighten (amount > 0) or darken (amount < 0) a colour. */
export function shade(value, amount) {
  const [r, g, b, a] = parseColor(value);
  const mix = (c) => Math.max(0, Math.min(255, Math.round(amount > 0
    ? c + (255 - c) * amount
    : c * (1 + amount))));
  return [mix(r), mix(g), mix(b), a];
}

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  /** Set one pixel, alpha-blending over what's already there. */
  px(x, y, color) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const [r, g, b, a] = parseColor(color);
    if (a === 0) return;
    const i = (y * this.width + x) * 4;

    if (a === 255) {
      this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b; this.data[i + 3] = 255;
      return;
    }
    const src = a / 255;
    const dstA = this.data[i + 3] / 255;
    const outA = src + dstA * (1 - src);
    if (outA === 0) return;
    this.data[i] = Math.round((r * src + this.data[i] * dstA * (1 - src)) / outA);
    this.data[i + 1] = Math.round((g * src + this.data[i + 1] * dstA * (1 - src)) / outA);
    this.data[i + 2] = Math.round((b * src + this.data[i + 2] * dstA * (1 - src)) / outA);
    this.data[i + 3] = Math.round(outA * 255);
  }

  /** Filled rectangle. */
  rect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) this.px(x + dx, y + dy, color);
    return this;
  }

  /** Rectangle outline. */
  frame(x, y, w, h, color) {
    for (let dx = 0; dx < w; dx++) { this.px(x + dx, y, color); this.px(x + dx, y + h - 1, color); }
    for (let dy = 0; dy < h; dy++) { this.px(x, y + dy, color); this.px(x + w - 1, y + dy, color); }
    return this;
  }

  /** Horizontal line. */
  hline(x, y, w, color) { return this.rect(x, y, w, 1, color); }

  /** Vertical line. */
  vline(x, y, h, color) { return this.rect(x, y, 1, h, color); }

  /**
   * Draw an ASCII-art sprite.
   * @param {number} x, y      top-left corner
   * @param {string[]} rows    one string per row; a space means "leave it alone"
   * @param {object} palette   character -> colour
   */
  stamp(x, y, rows, palette) {
    rows.forEach((row, dy) => {
      [...row].forEach((ch, dx) => {
        const color = palette[ch];
        if (color) this.px(x + dx, y + dy, color);
      });
    });
    return this;
  }

  /** Nearest-neighbour upscale by a whole number, keeping edges crisp. */
  scale(factor) {
    const out = new Canvas(this.width * factor, this.height * factor);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = (y * this.width + x) * 4;
        const color = [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
        if (color[3] === 0) continue;
        out.rect(x * factor, y * factor, factor, factor, color);
      }
    }
    return out;
  }

  toPng() { return encodePng(this.width, this.height, this.data); }
}

/** Build a canvas straight from an ASCII-art grid. */
export function spriteFromRows(rows, palette) {
  const width = Math.max(...rows.map((r) => r.length));
  const canvas = new Canvas(width, rows.length);
  canvas.stamp(0, 0, rows.map((r) => r.padEnd(width, ' ')), palette);
  return canvas;
}
