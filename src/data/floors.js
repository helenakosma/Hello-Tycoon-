/**
 * ============================================================================
 * FLOORS  —  the tower's expansion ladder
 * ============================================================================
 *
 * Floor 1 is free and exists from the first second of the game. Every other
 * floor must be UNLOCKED, and unlocking needs BOTH:
 *   - enough Bytes (so idling alone isn't enough), and
 *   - enough solved problems (so buying alone isn't enough either).
 *
 * That "both" rule is the point: a student can't idle their way to the top,
 * and can't skip the building game by hoarding either.
 *
 * FIELDS
 *   level             which storey it is (1 = ground floor)
 *   roomType          an id from rooms.js
 *   name              optional override of the room type's name
 *   cost              Bytes required to build
 *   requiresProblems  solved-problem count required to build
 *
 * TEACHERS: add more floors by appending entries. Keep `level` sequential —
 * a floor can only be built once the one below it exists.
 */

const FLOORS = [
  {
    level: 1,
    roomType: 'bullpen',
    name: 'Coding Bullpen',
    cost: 0,
    requiresProblems: 0,
  },
  {
    level: 2,
    roomType: 'server',
    cost: 150,
    requiresProblems: 2,
  },
  {
    level: 3,
    roomType: 'breakroom',
    cost: 400,
    requiresProblems: 5,
  },
  {
    level: 4,
    roomType: 'gym',
    cost: 1100,
    requiresProblems: 8,
  },
  {
    level: 5,
    roomType: 'meeting',
    cost: 2800,
    requiresProblems: 12,
  },
  {
    level: 6,
    roomType: 'lounge',
    cost: 7000,
    requiresProblems: 16,
  },
  {
    level: 7,
    roomType: 'exec',
    cost: 17000,
    requiresProblems: 21,
  },
  {
    level: 8,
    roomType: 'bullpen',
    name: 'Bullpen North',
    cost: 42000,
    requiresProblems: 26,
  },
  {
    level: 9,
    roomType: 'server',
    name: 'Data Annex',
    cost: 105000,
    requiresProblems: 31,
  },
  {
    level: 10,
    roomType: 'exec',
    name: 'The Penthouse',
    cost: 260000,
    requiresProblems: 36,
  },
];

export default FLOORS;
