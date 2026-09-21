/**
 * Derived game values.
 *
 * Nothing in here changes state — these are pure functions that answer
 * questions about it ("how much income per second?", "can I build floor 4?").
 * Keeping the maths here means the reducer stays short and the UI stays dumb.
 */

import { ECONOMY, PROGRESSION, PRESTIGE } from '../data/config.js';
import TIERS, { tiersById } from '../data/tiers.js';
import FLOORS from '../data/floors.js';
import ITEMS, { itemLinesById } from '../data/items.js';
import { roomsById } from '../data/rooms.js';

// ---------------------------------------------------------------------------
// Levels & XP
// ---------------------------------------------------------------------------

/** Total XP needed to REACH this level. Level 1 needs 0. */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.round(PROGRESSION.xpBase * (level - 1) ** PROGRESSION.xpCurve);
}

/** Current level for an XP total. */
export function levelFromXp(xp) {
  let level = 1;
  while (level < PROGRESSION.maxLevel && xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** Progress within the current level, for the XP bar. */
export function levelProgress(xp) {
  const level = levelFromXp(xp);
  const floorXp = xpForLevel(level);
  const nextXp = xpForLevel(level + 1);
  if (level >= PROGRESSION.maxLevel) return { level, into: 1, need: 1, fraction: 1, maxed: true };
  return {
    level,
    into: xp - floorXp,
    need: nextXp - floorXp,
    fraction: Math.max(0, Math.min(1, (xp - floorXp) / (nextXp - floorXp))),
    maxed: false,
  };
}

// ---------------------------------------------------------------------------
// Bonuses from owned items
// ---------------------------------------------------------------------------

/**
 * Add up every bonus from every item the player currently owns.
 * A floor's `items` map holds the OWNED TIER for each line, e.g. { chairs: 2 }.
 * Tier 1 is free with the room, so every line on a built floor counts at least once.
 */
export function totalBonuses(state) {
  const totals = { bytesPerSec: 0, passiveMult: 0, rewardMult: 0, xpMult: 0, streakBonus: 0 };

  for (const floor of state.floors) {
    const lines = ITEMS[floor.roomType] || [];
    for (const line of lines) {
      const owned = floor.items?.[line.id] ?? 1;
      // Bonuses do NOT stack across tiers — the current tier replaces the last.
      const tier = line.tiers[Math.min(owned, line.tiers.length) - 1];
      if (!tier) continue;
      const { type, value } = tier.bonus;
      if (totals[type] !== undefined) totals[type] += value;
    }
  }

  return totals;
}

/** Multiplier earned from past Series B rounds. */
export function reputationMultiplier(state) {
  return 1 + (state.reputation || 0) * PRESTIGE.multiplierPerPoint;
}

/** Bytes generated per second by the tower, with all multipliers applied. */
export function incomePerSecond(state) {
  const b = totalBonuses(state);
  return b.bytesPerSec * (1 + b.passiveMult) * reputationMultiplier(state);
}

/** The multiplier a streak of `n` is currently worth. */
export function streakMultiplier(state) {
  const b = totalBonuses(state);
  const steps = Math.min(state.streak || 0, ECONOMY.streakMaxSteps);
  return 1 + steps * ECONOMY.streakStepBonus * (1 + b.streakBonus);
}

/**
 * Bytes a problem would pay right now, broken down so the UI can show why.
 */
export function rewardFor(state, problem) {
  const tier = tiersById[problem.tier];
  const b = totalBonuses(state);
  const base = (tier?.rewardBase ?? 10) * problem.difficulty * ECONOMY.globalRewardMultiplier;
  const itemMult = 1 + b.rewardMult;
  const repMult = reputationMultiplier(state);
  const streak = streakMultiplier(state);
  return {
    base: Math.round(base),
    itemMult,
    repMult,
    streak,
    total: Math.max(1, Math.floor(base * itemMult * repMult * streak)),
  };
}

/** XP a problem would pay right now. */
export function xpFor(state, problem) {
  const b = totalBonuses(state);
  return Math.max(1, Math.round(PROGRESSION.xpPerDifficulty * problem.difficulty * (1 + b.xpMult)));
}

// ---------------------------------------------------------------------------
// Unlocks
// ---------------------------------------------------------------------------

/** Number of problems solved. Survives prestige on purpose. */
export const solvedCount = (state) => state.solvedProblemIds.length;

/**
 * Tier unlock status, with the reason when locked so the UI can explain it.
 * @returns {Array<{tier, unlocked, reason}>}
 */
export function tierStatus(state) {
  const solved = solvedCount(state);
  const level = levelFromXp(state.xp);
  return TIERS.map((tier) => {
    const needProblems = tier.requiresProblems - solved;
    const needLevel = tier.requiresLevel - level;
    const unlocked = needProblems <= 0 && needLevel <= 0;
    let reason = null;
    if (!unlocked) {
      const parts = [];
      if (needProblems > 0) parts.push(`${needProblems} more problem${needProblems === 1 ? '' : 's'} solved`);
      if (needLevel > 0) parts.push(`level ${tier.requiresLevel}`);
      reason = `Needs ${parts.join(' and ')}`;
    }
    return { tier, unlocked, reason };
  });
}

/** The next floor that could be built, or null if the tower is complete. */
export function nextFloorDef(state) {
  return FLOORS.find((f) => f.level > state.floors.length) || null;
}

/**
 * Can the next floor be built? Requires BOTH enough Bytes and enough solved
 * problems — the rule that stops a student idling their way to the penthouse.
 */
export function floorBuildStatus(state) {
  const def = nextFloorDef(state);
  if (!def) return { def: null, canBuild: false, reason: 'Your tower is complete. Take the funding and build higher.' };

  const solved = solvedCount(state);
  const missingProblems = def.requiresProblems - solved;
  const missingBytes = def.cost - Math.floor(state.bytes);

  if (missingProblems > 0 && missingBytes > 0) {
    return { def, canBuild: false, reason: `Needs ${formatNumber(missingBytes)} more Bytes and ${missingProblems} more solved problem${missingProblems === 1 ? '' : 's'}` };
  }
  if (missingProblems > 0) {
    return { def, canBuild: false, reason: `Solve ${missingProblems} more problem${missingProblems === 1 ? '' : 's'} to unlock this floor` };
  }
  if (missingBytes > 0) {
    return { def, canBuild: false, reason: `Needs ${formatNumber(missingBytes)} more Bytes` };
  }
  return { def, canBuild: true, reason: null };
}

/**
 * Every upgrade line on a floor, with what the player owns and what is next.
 * This is what the room panel renders.
 */
export function roomUpgrades(state, floorIndex) {
  const floor = state.floors[floorIndex];
  if (!floor) return [];
  const lines = ITEMS[floor.roomType] || [];

  return lines.map((line) => {
    const owned = floor.items?.[line.id] ?? 1;
    const currentTier = line.tiers[owned - 1];
    const nextTier = line.tiers[owned] || null;
    return {
      line,
      owned,
      maxed: !nextTier,
      currentTier,
      nextTier,
      affordable: nextTier ? state.bytes >= nextTier.cost : false,
    };
  });
}

/** Prestige availability, with the reward and the reason when blocked. */
export function prestigeStatus(state) {
  const level = levelFromXp(state.xp);
  const solved = solvedCount(state);
  const gain = reputationGain(state);

  const missing = [];
  if (level < PRESTIGE.requiredLevel) missing.push(`level ${PRESTIGE.requiredLevel}`);
  if (solved < PRESTIGE.requiredProblemsSolved) {
    missing.push(`${PRESTIGE.requiredProblemsSolved - solved} more solved problems`);
  }

  return {
    available: missing.length === 0 && gain > 0,
    gain,
    reason: missing.length ? `Needs ${missing.join(' and ')}` : (gain <= 0 ? 'Earn more Bytes first — a Series B needs traction.' : null),
    newMultiplier: 1 + (state.reputation + gain) * PRESTIGE.multiplierPerPoint,
  };
}

/** Reputation points a reset would award right now. */
export function reputationGain(state) {
  return Math.floor(Math.sqrt(Math.max(0, state.runEarnings) / PRESTIGE.reputationDivisor));
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

/** 1234 -> "1.2K". Tycoon games live and die by readable big numbers. */
export function formatNumber(n) {
  const value = Math.floor(n);
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) < 1000) return String(value);
  let scaled = Math.abs(value);
  let unit = 0;
  while (scaled >= 1000 && unit < UNITS.length - 1) { scaled /= 1000; unit++; }
  const text = scaled < 10 ? scaled.toFixed(2) : scaled < 100 ? scaled.toFixed(1) : Math.floor(scaled);
  return (value < 0 ? '-' : '') + text + UNITS[unit];
}

/** Same, but keeps one decimal for small per-second rates. */
export function formatRate(n) {
  if (n > 0 && n < 10) return n.toFixed(1);
  return formatNumber(n);
}

/** Helper for the UI: the room definition behind a built floor. */
export function roomForFloor(floor) {
  return roomsById[floor.roomType];
}

export { itemLinesById };
