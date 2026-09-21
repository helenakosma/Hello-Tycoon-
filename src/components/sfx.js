/**
 * Sound effects, synthesised with the Web Audio API.
 *
 * No audio files means nothing to download, nothing to 404, and no licensing
 * to worry about in a school. Everything here is a couple of oscillators.
 *
 * TEACHERS: turn sound off by default in src/data/config.js (FEATURES.soundEnabled),
 * or students can use the speaker button in the stats bar.
 */

let audioContext = null;

/** Browsers only allow audio after a user gesture, so create it lazily. */
function context() {
  if (audioContext) return audioContext;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext = new Ctor();
    return audioContext;
  } catch {
    return null;
  }
}

/** One short note. */
function note(frequency, startAt, duration, volume = 0.13, type = 'triangle') {
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.02);
}

/** The "cha-ching" for a correct answer: a bright rising two-note chime. */
export function playCorrect(enabled) {
  if (!enabled) return;
  note(880, 0, 0.16);       // A5
  note(1318.5, 0.075, 0.28); // E6
}

/**
 * The "not yet" sound. Deliberately soft and low rather than a buzzer —
 * getting it wrong should feel like information, not a punishment.
 */
export function playIncorrect(enabled) {
  if (!enabled) return;
  note(311, 0, 0.2, 0.07, 'sine');
  note(247, 0.09, 0.25, 0.06, 'sine');
}

/** A satisfying click for buying an upgrade. */
export function playPurchase(enabled) {
  if (!enabled) return;
  note(523.25, 0, 0.09, 0.1);
  note(784, 0.05, 0.14, 0.09);
  note(1046.5, 0.1, 0.2, 0.08);
}

/** A bigger fanfare for a new floor. */
export function playBuild(enabled) {
  if (!enabled) return;
  note(392, 0, 0.14, 0.11);
  note(523.25, 0.09, 0.14, 0.11);
  note(659.25, 0.18, 0.14, 0.11);
  note(784, 0.27, 0.32, 0.12);
}
