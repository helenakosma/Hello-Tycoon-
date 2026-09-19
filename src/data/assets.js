/**
 * ============================================================================
 * SPRITE / ASSET REGISTRY  —  how to swap placeholders for real pixel art
 * ============================================================================
 *
 * Right now every room and item draws as a coloured box. Nothing in the game
 * logic knows that. Each room and item in rooms.js / items.js carries a
 * `sprite` key such as "room.bullpen" or "item.chair.t2", and this file is the
 * only place that turns a sprite key into an image path.
 *
 * ----------------------------------------------------------------------------
 * TO DROP IN REAL ART LATER (no code changes needed):
 *   1. Put your PNG files in  public/assets/rooms/  and  public/assets/items/
 *      using the exact filenames listed by the manifest (see below).
 *   2. Change ASSET_MODE from 'placeholder' to 'auto'.
 *   3. Refresh. Any sprite with a matching file shows the art; anything still
 *      missing keeps its coloured placeholder, so you can convert art
 *      one room at a time.
 *
 * To see the exact list of filenames the game is looking for, open the game,
 * press the "?" button in the stats bar, and choose "Asset filenames" — or
 * call expectedAssetFilenames() from this module.
 * ----------------------------------------------------------------------------
 */

/**
 * 'placeholder' — always draw coloured boxes (the default while you build).
 * 'auto'        — try to load the image; fall back to the box if it's missing.
 * 'images'      — always use images (a missing file shows a broken sprite).
 */
export const ASSET_MODE = 'placeholder';

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
  room: { width: 320, height: 96, note: 'Wide cutaway room interior, Tiny Tower style.' },
  item: { width: 32, height: 32, note: 'Single object icon, transparent background.' },
  ui: { width: 16, height: 16, note: 'Small UI glyph (coin, star).' },
};
