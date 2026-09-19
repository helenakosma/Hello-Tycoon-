/**
 * ============================================================================
 * PROBLEM TIERS  —  the topic ladder students climb
 * ============================================================================
 *
 * Every problem in src/data/problems/*.js belongs to exactly one tier via its
 * `tier` field. A tier stays locked until the student has solved enough
 * problems AND reached a high enough level, so content unlocks at a pace that
 * roughly tracks real understanding rather than time spent idling.
 *
 * FIELDS
 *   id                matches the `tier` field on problems
 *   name / blurb      shown in the problem picker
 *   rewardBase        Bytes = rewardBase × problem.difficulty × your multipliers
 *   requiresProblems  total solved problems needed to unlock this tier
 *   requiresLevel     player level needed to unlock this tier
 *   colour            accent used in the UI
 *
 * TEACHERS: reorder or re-gate freely. If you add a tier, give it an id and
 * then tag problems with that id.
 */

const TIERS = [
  {
    id: 'output',
    name: 'Output & Variables',
    blurb: 'Printing text, storing values, doing arithmetic.',
    rewardBase: 10,
    requiresProblems: 0,
    requiresLevel: 1,
    colour: '#5b8def',
  },
  {
    id: 'conditionals',
    name: 'Conditionals',
    blurb: 'if / else if / else, comparisons, boolean logic.',
    rewardBase: 18,
    requiresProblems: 3,
    requiresLevel: 1,
    colour: '#2ee6a8',
  },
  {
    id: 'loops',
    name: 'Loops',
    blurb: 'for and while loops, counters, accumulators.',
    rewardBase: 30,
    requiresProblems: 6,
    requiresLevel: 2,
    colour: '#e8a33d',
  },
  {
    id: 'functions',
    name: 'Functions & Methods',
    blurb: 'Parameters, return values, reusing your own code.',
    rewardBase: 50,
    requiresProblems: 10,
    requiresLevel: 3,
    colour: '#b06de8',
  },
  {
    id: 'arrays',
    name: 'Arrays & Lists',
    blurb: 'Collections of values, indexing, looping over data.',
    rewardBase: 85,
    requiresProblems: 14,
    requiresLevel: 4,
    colour: '#e86d8a',
  },
  {
    id: 'strings',
    name: 'Strings',
    blurb: 'Characters, slicing, searching and building text.',
    rewardBase: 140,
    requiresProblems: 18,
    requiresLevel: 5,
    colour: '#3dd6e8',
  },
  {
    id: 'oop',
    name: 'Classes & Objects',
    blurb: 'Your own types: fields, constructors, methods, inheritance.',
    rewardBase: 230,
    requiresProblems: 24,
    requiresLevel: 6,
    colour: '#e8d44d',
  },
  {
    id: 'recursion',
    name: 'Recursion',
    blurb: 'Functions that call themselves. Base cases matter.',
    rewardBase: 380,
    requiresProblems: 30,
    requiresLevel: 7,
    colour: '#f5744d',
  },
];

export default TIERS;

export const tiersById = Object.fromEntries(TIERS.map((t) => [t.id, t]));
