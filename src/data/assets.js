/**
 * ============================================================================
 * SPRITE / ASSET REGISTRY  —  where the pixel art comes from
 * ============================================================================
 *
 * Every room and item in rooms.js / items.js carries a `sprite` key such as
 * "room.bullpen" or "item.chair.t2", and this file is the ONLY place that turns
 * a sprite key into an image path. Nothing in the game logic knows or cares
 * whether a sprite is a picture or a coloured box.
 *
 * ----------------------------------------------------------------------------
 * THE ART LIVES IN  public/assets/rooms/  AND  public/assets/items/
 *
 * To change a sprite: open the PNG in any pixel editor (Aseprite, Piskel,
 * Paint), draw over it, save. Refresh the game. That's the whole workflow —
 * no code, no rebuild.
 *
 * To add a sprite for something new: name the file to match the rule below and
 * drop it in. Anything without a file falls back to a coloured box, so you can
 * add art one piece at a time and the game never breaks.
 *
 * The starter art was drawn by scripts/pixel-art/ and can be regenerated with
 * `npm run art` — but that OVERWRITES everything in public/assets, so don't
 * run it after you've hand-edited the sprites.
 *
 * To see every filename the game looks for, click the "art" button in the
 * game's top bar.
 * ----------------------------------------------------------------------------
 */

/**
 * 'auto'        — use the image if it exists, fall back to a coloured box if
 *                 not. This is the default: it means you can replace the art
 *                 one sprite at a time and the game never breaks.
 * 'placeholder' — ignore the art entirely and draw coloured boxes. Handy if
 *                 you want to sketch out new rooms before drawing them.
 * 'images'      — always use images (a missing file shows a broken sprite).
 */
export const ASSET_MODE = 'auto';

/** Where art lives, relative to index.html so it also works from file://. */
const ASSET_ROOT = './assets';

/**
 * Turn a sprite key into a file path.
 *
 *   "room.bullpen"   ->  ./assets/rooms/bullpen.png
 *   "item.chair.t2"  ->  ./assets/items/chair_t2.png
 *   "ui.coin"        ->  ./assets/ui/coin.png
 *
 * Keeping this rule-based means you never have to register a new file here —
 * just name the PNG to match and it is picked up.
 */
export function spritePath(spriteKey) {
  if (!spriteKey) return null;
  const parts = spriteKey.split('.');
  const kind = parts[0];

  switch (kind) {
    case 'room':
      return `${ASSET_ROOT}/rooms/${parts[1]}.png`;
    case 'item':
      // item.chair.t2 -> items/chair_t2.png ; item.chair -> items/chair.png
      return `${ASSET_ROOT}/items/${parts.slice(1).join('_')}.png`;
    case 'ui':
      return `${ASSET_ROOT}/ui/${parts.slice(1).join('_')}.png`;
    default:
      return `${ASSET_ROOT}/${parts.join('/')}.png`;
  }
}

/**
 * Remembers which sprite keys have a real image behind them, so we probe the
 * network at most once per key per session.
 * Values: true (loaded), false (missing), Promise (in flight).
 */
const probeCache = new Map();

/**
 * Ask whether a sprite has real art available.
 * Returns true/false synchronously when known, otherwise a Promise.
 * The <Sprite> component handles both.
 */
export function probeSprite(spriteKey) {
  if (ASSET_MODE === 'placeholder') return false;
  if (ASSET_MODE === 'images') return true;

  if (probeCache.has(spriteKey)) return probeCache.get(spriteKey);

  const path = spritePath(spriteKey);
  const promise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { probeCache.set(spriteKey, true); resolve(true); };
    img.onerror = () => { probeCache.set(spriteKey, false); resolve(false); };
    img.src = path;
  });
  probeCache.set(spriteKey, promise);
  return promise;
}

/**
 * Build the full list of image filenames the game would use if every sprite
 * had art. Handy for handing an artist a checklist.
 *
 * @param {Array} rooms  from rooms.js
 * @param {Object} items from items.js
 * @returns {Array<{spriteKey:string, path:string, describes:string}>}
 */
export function expectedAssetFilenames(rooms, itemsByRoom) {
  const out = [];
  for (const room of rooms) {
    out.push({
      spriteKey: room.sprite,
      path: spritePath(room.sprite),
      describes: `Room background — ${room.name}`,
    });
  }
  for (const [roomId, lines] of Object.entries(itemsByRoom)) {
    for (const line of lines) {
      line.tiers.forEach((tier, index) => {
        const key = `${line.sprite}.t${index + 1}`;
        out.push({
          spriteKey: key,
          path: spritePath(key),
          describes: `${roomId} — ${line.name} tier ${index + 1}: ${tier.name}`,
        });
      });
    }
  }
  return out;
}

/**
 * Recommended pixel sizes, so art lines up with the CSS boxes it replaces.
 * The layout scales images with `image-rendering: pixelated`, so small,
 * crisp sprites look correct — don't feel tied to these exact numbers.
 */
export const SPRITE_SIZES = {
  room: { width: 480, height: 108, note: 'Wide cutaway room interior, Tiny Tower style (a 160x36 drawing at 3x).' },
  item: { width: 48, height: 48, note: 'Single object icon, transparent background (a 16x16 drawing at 3x).' },
  ui: { width: 16, height: 16, note: 'Small UI glyph (coin, star).' },
};
