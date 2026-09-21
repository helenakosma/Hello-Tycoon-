/**
 * Saving and loading, using the browser's localStorage.
 *
 * Everything stays on the student's own machine — there is no server and no
 * account. That also means: clearing browser data clears the save, and a
 * different browser (or a private window) is a different save file.
 *
 * TEACHERS: bump SAVE_VERSION if you change the shape of the state in a way
 * old saves can't survive. Old saves are then discarded rather than crashing
 * the game, and the student starts fresh.
 */

export const SAVE_KEY = 'hello-tycoon-save';
export const SAVE_VERSION = 1;

/** localStorage throws in some privacy modes; treat it as simply unavailable. */
function storage() {
  try {
    const probe = '__ht_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Read the save file.
 * @returns {object|null} the saved state, or null if there isn't a usable one
 */
export function loadSave() {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== SAVE_VERSION) return null;
    return parsed;
  } catch {
    return null; // corrupted save: start clean rather than crash
  }
}

let pending = null;

/**
 * Write the save file. Calls are coalesced so that rapid state changes (the
 * once-a-second income tick, typing in the editor) don't hammer localStorage.
 */
export function saveGame(state) {
  const store = storage();
  if (!store) return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    try {
      store.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or storage disabled — the game keeps working in memory.
    }
  }, 400);
}

/** Write immediately, for page-unload. */
export function saveGameNow(state) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SAVE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/** Delete the save file (used by "Start over"). */
export function clearSave() {
  const store = storage();
  if (!store) return;
  try { store.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

/** True when saving works at all — the UI warns the student if it doesn't. */
export function isStorageAvailable() {
  return storage() !== null;
}
