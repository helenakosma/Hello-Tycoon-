/**
 * The game's single source of truth: one reducer, one React context.
 *
 * Every change to the save file goes through `dispatch`, which makes the rules
 * easy to find and easy to change. If you want to know what happens when a
 * student solves a problem, read the 'SOLVE' case below — that is all of it.
 */

import React, {
  createContext, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';

import FLOORS from '../data/floors.js';
import ITEMS from '../data/items.js';
import { roomsById } from '../data/rooms.js';
import { ECONOMY, FEATURES, PRESTIGE } from '../data/config.js';
import {
  incomePerSecond, rewardFor, xpFor, reputationGain, levelFromXp,
} from './selectors.js';
import {
  loadSave, saveGame, saveGameNow, clearSave, SAVE_VERSION,
} from './persistence.js';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

/** Build a floor object from a floors.js definition, furnished at tier 1. */
function makeFloor(def) {
  const items = {};
  for (const line of ITEMS[def.roomType] || []) items[line.id] = 1;
  return {
    level: def.level,
    roomType: def.roomType,
    name: def.name || null,
    items,
  };
}

export function createInitialState() {
  return {
    version: SAVE_VERSION,

    // --- identity -------------------------------------------------------
    language: null,             // 'python' | 'java' | null until chosen
    unlockedLanguages: [],

    // --- economy --------------------------------------------------------
    bytes: 0,
    runEarnings: 0,             // earned since the last Series B; drives reputation
    lifetimeBytes: 0,

    // --- progression ----------------------------------------------------
    xp: 0,
    solvedProblemIds: [],       // survives prestige on purpose
    attempts: {},               // problemId -> number of submissions
    streak: 0,
    bestStreak: 0,

    // --- prestige -------------------------------------------------------
    reputation: 0,
    prestigeCount: 0,

    // --- the tower ------------------------------------------------------
    floors: [makeFloor(FLOORS[0])],

    // --- session --------------------------------------------------------
    currentProblemId: null,
    drafts: {},                 // problemId -> the student's code
    selectedFloor: 0,
    settings: { sound: FEATURES.soundEnabled },
    lastSeenAt: Date.now(),

    // --- transient (never saved) ----------------------------------------
    toasts: [],
    lastSolve: null,            // drives the coin-pop animation
  };
}

/** Fields that are NOT written to the save file. */
const TRANSIENT = ['toasts', 'lastSolve'];

export function serialize(state) {
  const copy = { ...state, lastSeenAt: Date.now() };
  for (const key of TRANSIENT) delete copy[key];
  return copy;
}

let toastId = 0;

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function reducer(state, action) {
  switch (action.type) {
    // -----------------------------------------------------------------
    case 'CHOOSE_LANGUAGE': {
      return {
        ...state,
        language: action.language,
        unlockedLanguages: [action.language],
      };
    }

    // -----------------------------------------------------------------
    case 'SELECT_PROBLEM':
      return { ...state, currentProblemId: action.problemId };

    case 'SAVE_DRAFT':
      return { ...state, drafts: { ...state.drafts, [action.problemId]: action.source } };

    case 'RESET_DRAFT': {
      const drafts = { ...state.drafts };
      delete drafts[action.problemId];
      return { ...state, drafts };
    }

    // -----------------------------------------------------------------
    /**
     * A correct submission. First time through a problem pays full price;
     * repeats pay a small practice reward with no XP and no streak, so a
     * student can't farm the same easy problem forever.
     */
    case 'SOLVE': {
      const { problem } = action;
      const alreadySolved = state.solvedProblemIds.includes(problem.id);

      if (alreadySolved) {
        const practice = Math.max(1, Math.floor(rewardFor(state, problem).total * 0.25));
        return {
          ...state,
          bytes: state.bytes + practice,
          runEarnings: state.runEarnings + practice,
          lifetimeBytes: state.lifetimeBytes + practice,
          attempts: { ...state.attempts, [problem.id]: (state.attempts[problem.id] || 0) + 1 },
          lastSolve: { amount: practice, xp: 0, repeat: true, at: Date.now() },
          toasts: [...state.toasts, {
            id: ++toastId,
            tone: 'info',
            text: `Practice run: +${practice} Bytes (you already solved this one)`,
          }],
        };
      }

      const reward = rewardFor(state, problem);
      const xpGain = xpFor(state, problem);
      const beforeLevel = levelFromXp(state.xp);
      const afterLevel = levelFromXp(state.xp + xpGain);
      const streak = state.streak + 1;

      const toasts = [...state.toasts, {
        id: ++toastId,
        tone: 'success',
        text: `+${reward.total} Bytes  ·  +${xpGain} XP`,
      }];
      if (afterLevel > beforeLevel) {
        toasts.push({ id: ++toastId, tone: 'level', text: `Level ${afterLevel}! New problems may have unlocked.` });
      }
      if (streak >= 3) {
        toasts.push({ id: ++toastId, tone: 'info', text: `${streak} in a row — streak bonus growing.` });
      }

      return {
        ...state,
        bytes: state.bytes + reward.total,
        runEarnings: state.runEarnings + reward.total,
        lifetimeBytes: state.lifetimeBytes + reward.total,
        xp: state.xp + xpGain,
        solvedProblemIds: [...state.solvedProblemIds, problem.id],
        attempts: { ...state.attempts, [problem.id]: (state.attempts[problem.id] || 0) + 1 },
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        lastSolve: { amount: reward.total, xp: xpGain, repeat: false, at: Date.now() },
        toasts,
      };
    }

    // -----------------------------------------------------------------
    /** A wrong submission. Costs nothing but the streak. */
    case 'FAIL_ATTEMPT':
      return {
        ...state,
        streak: 0,
        attempts: { ...state.attempts, [action.problemId]: (state.attempts[action.problemId] || 0) + 1 },
      };

    // -----------------------------------------------------------------
    case 'BUY_ITEM': {
      const { floorIndex, lineId } = action;
      const floor = state.floors[floorIndex];
      if (!floor) return state;

      const line = (ITEMS[floor.roomType] || []).find((l) => l.id === lineId);
      if (!line) return state;

      const owned = floor.items?.[lineId] ?? 1;
      const nextTier = line.tiers[owned];
      if (!nextTier || state.bytes < nextTier.cost) return state;

      const floors = state.floors.map((f, i) => (
        i === floorIndex ? { ...f, items: { ...f.items, [lineId]: owned + 1 } } : f
      ));

      return {
        ...state,
        bytes: state.bytes - nextTier.cost,
        floors,
        toasts: [...state.toasts, {
          id: ++toastId,
          tone: 'success',
          text: `${line.name} upgraded to ${nextTier.name}`,
        }],
      };
    }

    // -----------------------------------------------------------------
    case 'BUILD_FLOOR': {
      const def = FLOORS.find((f) => f.level === state.floors.length + 1);
      if (!def) return state;
      if (state.bytes < def.cost) return state;
      if (state.solvedProblemIds.length < def.requiresProblems) return state;

      const floor = makeFloor(def);
      return {
        ...state,
        bytes: state.bytes - def.cost,
        floors: [...state.floors, floor],
        selectedFloor: state.floors.length,
        toasts: [...state.toasts, {
          id: ++toastId,
          tone: 'build',
          text: `Floor ${def.level} built: ${def.name || roomsById[def.roomType].name}`,
        }],
      };
    }

    // -----------------------------------------------------------------
    case 'SELECT_FLOOR':
      return { ...state, selectedFloor: action.index };

    // -----------------------------------------------------------------
    /** Passive income. `seconds` may be large when returning after a break. */
    case 'TICK': {
      const earned = incomePerSecond(state) * action.seconds;
      if (earned <= 0) return state;
      return {
        ...state,
        bytes: state.bytes + earned,
        runEarnings: state.runEarnings + earned,
        lifetimeBytes: state.lifetimeBytes + earned,
      };
    }

    // -----------------------------------------------------------------
    /**
     * Series B. The tower resets to a single floor and Bytes go to zero, but
     * solved problems, XP and level all stay — a student never has to redo
     * work — and Reputation permanently multiplies future earnings.
     */
    case 'PRESTIGE': {
      const gain = reputationGain(state);
      if (gain <= 0) return state;
      return {
        ...state,
        bytes: 0,
        runEarnings: 0,
        floors: [makeFloor(FLOORS[0])],
        selectedFloor: 0,
        streak: 0,
        reputation: state.reputation + gain,
        prestigeCount: state.prestigeCount + 1,
        toasts: [...state.toasts, {
          id: ++toastId,
          tone: 'level',
          text: `${PRESTIGE.name} closed! +${gain} Reputation. Every Byte is now worth more.`,
        }],
      };
    }

    // -----------------------------------------------------------------
    /** Stretch goal: buy the other language and keep everything else. */
    case 'SWITCH_LANGUAGE': {
      const cost = state.unlockedLanguages.includes(action.language) ? 0 : FEATURES.languageSwitchCost;
      if (state.bytes < cost) return state;
      return {
        ...state,
        bytes: state.bytes - cost,
        language: action.language,
        currentProblemId: null,
        unlockedLanguages: [...new Set([...state.unlockedLanguages, action.language])],
        toasts: [...state.toasts, {
          id: ++toastId,
          tone: 'success',
          text: `Switched to ${action.language === 'python' ? 'Python' : 'Java'}.`,
        }],
      };
    }

    // -----------------------------------------------------------------
    case 'SET_SOUND':
      return { ...state, settings: { ...state.settings, sound: action.value } };

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case 'CLEAR_SOLVE_FLASH':
      return { ...state, lastSolve: null };

    case 'HARD_RESET':
      clearSave();
      return createInitialState();

    /** Used once on startup to merge a save file into the default shape. */
    case 'HYDRATE':
      return { ...createInitialState(), ...action.state, toasts: [], lastSolve: null };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadSave();
    if (!saved) return createInitialState();
    return { ...createInitialState(), ...saved, toasts: [], lastSolve: null };
  });

  // --- offline income, once, on first mount ------------------------------
  const offlineApplied = useRef(false);
  useEffect(() => {
    if (offlineApplied.current) return;
    offlineApplied.current = true;
    if (!state.lastSeenAt) return;

    const awaySeconds = (Date.now() - state.lastSeenAt) / 1000;
    const capped = Math.min(awaySeconds, ECONOMY.maxOfflineHours * 3600);
    const earned = incomePerSecond(state) * capped * ECONOMY.offlineEfficiency;

    if (earned >= 1 && awaySeconds > 60) {
      dispatch({ type: 'TICK', seconds: capped * ECONOMY.offlineEfficiency });
    }
    // Deliberately runs once: `state` here is the hydrated startup state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- the income heartbeat ----------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', seconds: ECONOMY.tickMs / 1000 });
    }, ECONOMY.tickMs);
    return () => clearInterval(interval);
  }, []);

  // --- autosave ----------------------------------------------------------
  useEffect(() => {
    saveGame(serialize(state));
  }, [state]);

  // --- save on the way out -----------------------------------------------
  useEffect(() => {
    const onLeave = () => saveGameNow(serialize(state));
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** Read the game state and the dispatcher from anywhere in the tree. */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
