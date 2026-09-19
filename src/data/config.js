/**
 * ============================================================================
 * GAME BALANCE & ECONOMY  —  the main dial-turning file for teachers
 * ============================================================================
 *
 * Everything here is a plain number you can change. Save the file and the game
 * reloads with your new values (or just refresh the page).
 *
 * A note on file format: the content files in src/data are `.js` rather than
 * `.json` so they can carry comments and tolerate trailing commas. They are
 * still just data — a list of objects — and you edit them the same way.
 */

export const CURRENCY = {
  /** What the money is called in the UI. */
  name: 'Bytes',
  short: 'B',
  /** Shown next to numbers, e.g. "1.2K ⬢". */
  symbol: '⬢',
};

export const ECONOMY = {
  /**
   * Bytes awarded for a correct solution:
   *   tier.rewardBase  ×  problem.difficulty  ×  all your multipliers
   * Bump this to make the whole game more generous.
   */
  globalRewardMultiplier: 1,

  /**
   * Solving problems back-to-back builds a streak. Each step adds this much
   * to your reward multiplier (so a streak of 5 = +50% by default).
   * Break-room upgrades increase the per-step value.
   * The streak resets when you get a problem wrong — never on a timer, so
   * nobody is punished for taking time to think.
   */
  streakStepBonus: 0.1,
  streakMaxSteps: 10,

  /** Passive income ticks this often (milliseconds). */
  tickMs: 1000,

  /**
   * While the tab is closed, passive income still accrues — but capped, so
   * leaving the game open overnight isn't a winning strategy.
   */
  maxOfflineHours: 8,
  offlineEfficiency: 0.5,
};

export const PROGRESSION = {
  /**
   * XP for a correct solution = xpPerDifficulty × problem.difficulty.
   * XP is tracked separately from Bytes so that a student who hoards currency
   * still faces harder problems.
   */
  xpPerDifficulty: 12,

  /**
   * XP needed to reach level N is: xpBase × (N - 1) ^ xpCurve
   * Level 2 at 60 XP, level 5 at ~420, level 10 at ~1200 with these defaults.
   */
  xpBase: 60,
  xpCurve: 1.45,

  /** Hard ceiling, mostly so the level-up animation can't run forever. */
  maxLevel: 50,
};

export const PRESTIGE = {
  /** In-fiction name for the reset. */
  name: 'Series B Funding',
  flavour:
    'Take the funding. Your tower resets to a single floor, but investors '
    + 'remember you — every future Byte is worth more.',

  /** You must meet BOTH of these before the button unlocks. */
  requiredLevel: 8,
  requiredProblemsSolved: 20,

  /**
   * Reputation earned = floor( sqrt(lifetimeBytes / reputationDivisor) ).
   * Each point of Reputation adds `multiplierPerPoint` to every Byte you earn.
   */
  reputationDivisor: 2000,
  multiplierPerPoint: 0.25,

  /**
   * What survives a reset. Solved problems are deliberately KEPT: a student
   * should never have to re-solve work they already did to get back to where
   * they were. Only the tower and the Bytes reset.
   */
  keeps: ['solvedProblemIds', 'xp', 'level', 'reputation', 'totalProblemsSolved'],
};

/**
 * The kinds of bonus an item upgrade can give. Used by src/state/selectors.js
 * to add everything up, and by the UI to describe an upgrade in English.
 *
 * TEACHERS: if you add a new bonus type here you must also handle it in
 * selectors.js — these five cover every item in items.js.
 */
export const BONUS_TYPES = {
  bytesPerSec: {
    label: 'passive income',
    describe: (v) => '+' + v + ' ' + CURRENCY.name + '/sec',
  },
  passiveMult: {
    label: 'passive multiplier',
    describe: (v) => '+' + Math.round(v * 100) + '% passive income',
  },
  rewardMult: {
    label: 'solve reward',
    describe: (v) => '+' + Math.round(v * 100) + '% per solved problem',
  },
  xpMult: {
    label: 'XP gain',
    describe: (v) => '+' + Math.round(v * 100) + '% XP',
  },
  streakBonus: {
    label: 'streak power',
    describe: (v) => '+' + Math.round(v * 100) + '% stronger streaks',
  },
};

/** Feature switches, handy for classroom demos. */
export const FEATURES = {
  /** Play a short "cha-ching" on a correct answer (uses the Web Audio API). */
  soundEnabled: true,
  /** Show the run/test panel's raw program output. Useful for debugging. */
  showRawOutput: true,
  /**
   * Stretch goal from the brief: buying this lets a student switch language
   * mid-game. Set to null to remove the option entirely.
   */
  languageSwitchCost: 5000,
};
