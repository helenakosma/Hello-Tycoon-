/**
 * ============================================================================
 * ROOM TYPES  —  what kinds of floors exist in the tower
 * ============================================================================
 *
 * Each room type is a template. floors.js decides which room types actually
 * get built, in what order, and what they cost.
 *
 * FIELDS
 *   id          unique key; items.js attaches upgrade lines to this
 *   name        shown on the floor in the tower
 *   blurb       one line of flavour text in the room panel
 *   sprite      asset key (see assets.js). Falls back to the colours below.
 *   placeholder colours used until real pixel art is dropped in:
 *                 bg      the floor's background
 *                 accent  border / label colour
 *                 glyph   a character drawn in the corner, purely temporary
 *
 * TEACHERS: to invent a new room type, copy a block, give it a new id, then
 * add upgrade lines for that id in items.js and a floor for it in floors.js.
 */

const ROOMS = [
  {
    id: 'bullpen',
    name: 'Coding Bullpen',
    blurb: 'Open plan, standing desks, one very loud mechanical keyboard.',
    sprite: 'room.bullpen',
    placeholder: { bg: '#243449', accent: '#5b8def', glyph: '{ }' },
  },
  {
    id: 'server',
    name: 'Server Room',
    blurb: 'Cold, loud, and quietly printing money while you sleep.',
    sprite: 'room.server',
    placeholder: { bg: '#16332c', accent: '#2ee6a8', glyph: '///' },
  },
  {
    id: 'breakroom',
    name: 'Break Room',
    blurb: 'Coffee, snacks, and the whiteboard where the good ideas happen.',
    sprite: 'room.breakroom',
    placeholder: { bg: '#3c2b1f', accent: '#e8a33d', glyph: '☕' },
  },
  {
    id: 'gym',
    name: 'Wellness Floor',
    blurb: 'Happy engineers ship more. The treadmill desk was a mistake.',
    sprite: 'room.gym',
    placeholder: { bg: '#332444', accent: '#b06de8', glyph: '▲' },
  },
  {
    id: 'meeting',
    name: 'Meeting Rooms',
    blurb: 'Where the roadmap gets drawn, erased, and drawn again.',
    sprite: 'room.meeting',
    placeholder: { bg: '#3d2b32', accent: '#e86d8a', glyph: '▤' },
  },
  {
    id: 'lounge',
    name: 'Rooftop Lounge',
    blurb: 'Ping pong, a view, and suspiciously good wifi.',
    sprite: 'room.lounge',
    placeholder: { bg: '#10323f', accent: '#3dd6e8', glyph: '◈' },
  },
  {
    id: 'exec',
    name: 'Executive Suite',
    blurb: 'You made it. There is a plant here that someone else waters.',
    sprite: 'room.exec',
    placeholder: { bg: '#3f3615', accent: '#e8d44d', glyph: '★' },
  },
];

export default ROOMS;

/** Quick lookup: roomsById.bullpen -> the object above. */
export const roomsById = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
