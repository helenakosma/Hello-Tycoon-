/**
 * ============================================================================
 * ITEM UPGRADE LINES  —  the furniture and equipment inside each room
 * ============================================================================
 *
 * Keyed by room type id (from rooms.js). Each room type has a list of upgrade
 * LINES, and each line has TIERS you climb one at a time.
 *
 * Tier 1 comes free with the room, so a newly built floor already looks
 * furnished. Tier 2 and up cost Bytes.
 *
 * FIELDS on a line
 *   id      unique within the whole game (used in the save file)
 *   name    the line's name, e.g. "Desk Chairs"
 *   sprite  asset key prefix; tier N looks for `<sprite>.t<N>` (assets.js)
 *   tiers   ordered list, cheapest first
 *
 * FIELDS on a tier
 *   name    what this tier is called, e.g. "Gaming Chair"
 *   cost    Bytes to buy it (tier 1 is always 0 — it comes with the room)
 *   bonus   { type, value } — type must be a key of BONUS_TYPES in config.js
 *   placeholder { color, glyph } — the coloured box shown until art exists
 *
 * BONUS TYPES (see config.js)
 *   bytesPerSec   flat passive income
 *   passiveMult   % boost to ALL passive income
 *   rewardMult    % boost to Bytes earned per solved problem
 *   xpMult        % boost to XP earned
 *   streakBonus   % boost to how much each streak step is worth
 *
 * TEACHERS: the bonuses are deliberately thematic — the server room generates
 * passive Bytes, the gym multiplies it (happy staff), the break room powers
 * streaks, meeting rooms grow XP. Keep that link when you add your own.
 */

const ITEMS = {
  // -------------------------------------------------------------------------
  bullpen: [
    {
      id: 'chairs',
      name: 'Desk Chairs',
      sprite: 'item.chair',
      tiers: [
        { name: 'Folding Chair', cost: 0, bonus: { type: 'rewardMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '▯' } },
        { name: 'Ergonomic Chair', cost: 120, bonus: { type: 'rewardMult', value: 0.15 }, placeholder: { color: '#4f8ce0', glyph: '▮' } },
        { name: 'Gaming Chair', cost: 600, bonus: { type: 'rewardMult', value: 0.35 }, placeholder: { color: '#a45de8', glyph: '♛' } },
      ],
    },
    {
      id: 'computers',
      name: 'Computers',
      sprite: 'item.computer',
      tiers: [
        { name: 'Beige CRT Monitor', cost: 0, bonus: { type: 'rewardMult', value: 0.05 }, placeholder: { color: '#8a8570', glyph: '▢' } },
        { name: 'Dual Monitors', cost: 250, bonus: { type: 'rewardMult', value: 0.20 }, placeholder: { color: '#4f8ce0', glyph: '▢▢' } },
        { name: 'Ultrawide RGB Battlestation', cost: 1400, bonus: { type: 'rewardMult', value: 0.50 }, placeholder: { color: '#e84fa8', glyph: '▬' } },
      ],
    },
    {
      id: 'desks',
      name: 'Desks',
      sprite: 'item.desk',
      tiers: [
        { name: 'Particleboard Desk', cost: 0, bonus: { type: 'xpMult', value: 0.05 }, placeholder: { color: '#8a7355', glyph: '▭' } },
        { name: 'Sit/Stand Desk', cost: 400, bonus: { type: 'xpMult', value: 0.15 }, placeholder: { color: '#4f8ce0', glyph: '⌷' } },
        { name: 'Motorised Corner Desk', cost: 2000, bonus: { type: 'xpMult', value: 0.30 }, placeholder: { color: '#a45de8', glyph: '⌸' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  server: [
    {
      id: 'racks',
      name: 'Server Hardware',
      sprite: 'item.rack',
      tiers: [
        { name: 'Tower PC Under a Desk', cost: 0, bonus: { type: 'bytesPerSec', value: 1 }, placeholder: { color: '#7d8595', glyph: '▤' } },
        { name: 'Proper Server Rack', cost: 500, bonus: { type: 'bytesPerSec', value: 6 }, placeholder: { color: '#2ec98f', glyph: '▥' } },
        { name: 'Blade Cluster', cost: 3000, bonus: { type: 'bytesPerSec', value: 30 }, placeholder: { color: '#2ee6a8', glyph: '▦' } },
        { name: 'Quantum Pod', cost: 18000, bonus: { type: 'bytesPerSec', value: 160 }, placeholder: { color: '#7df5d0', glyph: '❖' } },
      ],
    },
    {
      id: 'cooling',
      name: 'Cooling',
      sprite: 'item.cooling',
      tiers: [
        { name: 'Desk Fan', cost: 0, bonus: { type: 'passiveMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '✜' } },
        { name: 'Air Conditioning', cost: 800, bonus: { type: 'passiveMult', value: 0.20 }, placeholder: { color: '#4fc3e0', glyph: '❄' } },
        { name: 'Liquid Cooling Loop', cost: 4500, bonus: { type: 'passiveMult', value: 0.50 }, placeholder: { color: '#5de8d6', glyph: '≋' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  breakroom: [
    {
      id: 'coffee',
      name: 'Coffee Setup',
      sprite: 'item.coffee',
      tiers: [
        { name: 'Drip Coffee Pot', cost: 0, bonus: { type: 'streakBonus', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '◡' } },
        { name: 'Espresso Bar', cost: 900, bonus: { type: 'streakBonus', value: 0.20 }, placeholder: { color: '#e8a33d', glyph: '☕' } },
        { name: 'Barista Robot', cost: 5000, bonus: { type: 'streakBonus', value: 0.45 }, placeholder: { color: '#f5c96b', glyph: '✹' } },
      ],
    },
    {
      id: 'snacks',
      name: 'Snacks',
      sprite: 'item.snacks',
      tiers: [
        { name: 'Vending Machine', cost: 0, bonus: { type: 'rewardMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '▤' } },
        { name: 'The Snack Wall', cost: 1200, bonus: { type: 'rewardMult', value: 0.20 }, placeholder: { color: '#e8a33d', glyph: '▦' } },
        { name: 'Catered Lunch, Daily', cost: 6000, bonus: { type: 'rewardMult', value: 0.45 }, placeholder: { color: '#f5c96b', glyph: '✦' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  gym: [
    {
      id: 'cardio',
      name: 'Cardio Equipment',
      sprite: 'item.cardio',
      tiers: [
        { name: 'One Sad Treadmill', cost: 0, bonus: { type: 'passiveMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '▬' } },
        { name: 'Cardio Row', cost: 2000, bonus: { type: 'passiveMult', value: 0.20 }, placeholder: { color: '#b06de8', glyph: '▰' } },
        { name: 'Full Weight Room', cost: 11000, bonus: { type: 'passiveMult', value: 0.50 }, placeholder: { color: '#d19bf5', glyph: '⛭' } },
      ],
    },
    {
      id: 'recovery',
      name: 'Recovery',
      sprite: 'item.recovery',
      tiers: [
        { name: 'Yoga Mat', cost: 0, bonus: { type: 'xpMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '▭' } },
        { name: 'Massage Chairs', cost: 2500, bonus: { type: 'xpMult', value: 0.15 }, placeholder: { color: '#b06de8', glyph: '◗' } },
        { name: 'Sauna & Cold Plunge', cost: 13000, bonus: { type: 'xpMult', value: 0.35 }, placeholder: { color: '#d19bf5', glyph: '◉' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  meeting: [
    {
      id: 'table',
      name: 'Meeting Table',
      sprite: 'item.table',
      tiers: [
        { name: 'Folding Table', cost: 0, bonus: { type: 'xpMult', value: 0.05 }, placeholder: { color: '#7d8595', glyph: '▭' } },
        { name: 'Conference Table', cost: 5000, bonus: { type: 'xpMult', value: 0.20 }, placeholder: { color: '#e86d8a', glyph: '▬' } },
        { name: 'The Boardroom Slab', cost: 26000, bonus: { type: 'xpMult', value: 0.45 }, placeholder: { color: '#f59bb0', glyph: '▮' } },
      ],
    },
    {
      id: 'av',
      name: 'A/V Kit',
      sprite: 'item.av',
      tiers: [
        { name: 'Wall-Mounted TV', cost: 0, bonus: { type: 'rewardMult', value: 0.08 }, placeholder: { color: '#7d8595', glyph: '▢' } },
        { name: 'Projector & Ceiling Mics', cost: 6000, bonus: { type: 'rewardMult', value: 0.25 }, placeholder: { color: '#e86d8a', glyph: '◳' } },
        { name: 'Holographic Display', cost: 30000, bonus: { type: 'rewardMult', value: 0.60 }, placeholder: { color: '#f59bb0', glyph: '◈' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  lounge: [
    {
      id: 'seating',
      name: 'Seating',
      sprite: 'item.seating',
      tiers: [
        { name: 'Beanbags', cost: 0, bonus: { type: 'passiveMult', value: 0.08 }, placeholder: { color: '#7d8595', glyph: '◓' } },
        { name: 'Modular Couches', cost: 14000, bonus: { type: 'passiveMult', value: 0.25 }, placeholder: { color: '#3dd6e8', glyph: '▰' } },
        { name: 'Nap Pods', cost: 70000, bonus: { type: 'passiveMult', value: 0.60 }, placeholder: { color: '#8ceef5', glyph: '◖' } },
      ],
    },
    {
      id: 'games',
      name: 'Game Corner',
      sprite: 'item.games',
      tiers: [
        { name: 'Ping Pong Table', cost: 0, bonus: { type: 'streakBonus', value: 0.08 }, placeholder: { color: '#7d8595', glyph: '◇' } },
        { name: 'Arcade Cabinet', cost: 16000, bonus: { type: 'streakBonus', value: 0.25 }, placeholder: { color: '#3dd6e8', glyph: '▣' } },
        { name: 'VR Rig', cost: 80000, bonus: { type: 'streakBonus', value: 0.60 }, placeholder: { color: '#8ceef5', glyph: '◐' } },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  exec: [
    {
      id: 'execdesk',
      name: 'Executive Desk',
      sprite: 'item.execdesk',
      tiers: [
        { name: 'Sensible Oak Desk', cost: 0, bonus: { type: 'bytesPerSec', value: 25 }, placeholder: { color: '#8a7355', glyph: '▭' } },
        { name: 'Mahogany Desk', cost: 35000, bonus: { type: 'bytesPerSec', value: 140 }, placeholder: { color: '#e8d44d', glyph: '▬' } },
        { name: 'Floating Glass Desk', cost: 180000, bonus: { type: 'bytesPerSec', value: 700 }, placeholder: { color: '#f7ec9b', glyph: '◫' } },
      ],
    },
    {
      id: 'art',
      name: 'Office Art',
      sprite: 'item.art',
      tiers: [
        { name: 'Motivational Poster', cost: 0, bonus: { type: 'rewardMult', value: 0.10 }, placeholder: { color: '#7d8595', glyph: '▢' } },
        { name: 'Abstract Painting', cost: 40000, bonus: { type: 'rewardMult', value: 0.30 }, placeholder: { color: '#e8d44d', glyph: '◧' } },
        { name: 'Commissioned Sculpture', cost: 200000, bonus: { type: 'rewardMult', value: 0.80 }, placeholder: { color: '#f7ec9b', glyph: '✧' } },
      ],
    },
  ],
};

export default ITEMS;

/**
 * Flat lookup of every upgrade line by its id, e.g. itemLinesById.chairs.
 * Used by the save/load code, which stores tiers as { chairs: 2, racks: 3 }.
 */
export const itemLinesById = Object.fromEntries(
  Object.entries(ITEMS).flatMap(([roomType, lines]) =>
    lines.map((line) => [line.id, { ...line, roomType }])),
);
