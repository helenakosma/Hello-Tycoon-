/**
 * Item sprites — one small drawing per upgrade tier, on a 16x16 grid.
 *
 * Each entry is a function that draws onto a 16x16 canvas. generate.mjs
 * upscales the result 2x and saves it as public/assets/items/<name>_t<N>.png.
 *
 * The key must match the item's `sprite` field in src/data/items.js, minus the
 * "item." prefix — so `item.chair` tier 2 is the key 'chair.t2'.
 *
 * ARTISTS: you don't have to work here. These PNGs are the starting point;
 * open them in any pixel editor and paint over them. The game loads whatever
 * is in public/assets/items/, not this file.
 */

import { Canvas, shade } from './canvas.mjs';

// --- shared look -----------------------------------------------------------

const INK = '#2b2233';           // outline on everything, keeps the set coherent
const SHADOW = '#00000030';      // soft contact shadow on the floor
const GLASS = '#bfe6ff';
const GLOW = '#ffffff70';

/** Filled box with a 1px outline and a top highlight — the workhorse shape. */
function box(c, x, y, w, h, fill, { outline = INK, highlight = true } = {}) {
  c.rect(x, y, w, h, fill);
  c.frame(x, y, w, h, outline);
  if (highlight && w > 2 && h > 2) c.hline(x + 1, y + 1, w - 2, shade(fill, 0.25));
  return c;
}

/** The little shadow that makes an object sit on the ground rather than float. */
function ground(c, x, w, y = 14) {
  c.rect(x + 1, y, w - 2, 1, SHADOW);
  c.rect(x, y, w, 1, SHADOW);
  return c;
}

/** A small screen with a lit face. */
function screen(c, x, y, w, h, frameColor, glow) {
  box(c, x, y, w, h, frameColor, { highlight: false });
  c.rect(x + 1, y + 1, w - 2, h - 2, glow);
  c.px(x + 1, y + 1, shade(glow, 0.5));
  return c;
}

// --- the sprites -----------------------------------------------------------

const SPRITES = {
  // =========================================================================
  // BULLPEN
  // =========================================================================

  'chair.t1': (c) => {           // Folding chair — grey, spindly, sad
    const g = '#8e97a6';
    box(c, 5, 2, 6, 6, g);       // backrest
    box(c, 3, 8, 10, 2, shade(g, -0.15)); // seat
    c.vline(4, 10, 3, INK); c.vline(11, 10, 3, INK);
    c.vline(6, 10, 3, INK); c.vline(9, 10, 3, INK);
    ground(c, 3, 10);
  },

  'chair.t2': (c) => {           // Ergonomic — blue, mesh back, armrests
    const b = '#4f8ce0';
    box(c, 5, 1, 6, 7, b);
    c.px(7, 3, shade(b, 0.4)); c.px(9, 5, shade(b, 0.4)); // mesh speckle
    box(c, 3, 8, 10, 2, shade(b, -0.2));
    c.hline(2, 7, 2, INK); c.hline(13, 7, 2, INK);        // armrests
    c.vline(8, 10, 2, INK);
    c.hline(5, 12, 7, INK);
    c.px(5, 13, INK); c.px(11, 13, INK);                   // castors
    ground(c, 4, 9);
  },

  'chair.t3': (c) => {           // Gaming chair — purple, winged, glowing
    const p = '#a45de8';
    box(c, 4, 0, 8, 8, p);
    c.rect(3, 1, 1, 5, shade(p, -0.3));                    // wings
    c.rect(12, 1, 1, 5, shade(p, -0.3));
    c.hline(5, 2, 6, '#f5c542');                           // racing stripe
    c.hline(5, 4, 6, shade(p, 0.35));
    box(c, 3, 8, 10, 2, shade(p, -0.25));
    c.hline(1, 7, 2, INK); c.hline(14, 7, 2, INK);
    c.vline(8, 10, 2, INK);
    c.hline(4, 12, 9, INK);
    c.px(4, 13, '#f5c542'); c.px(12, 13, '#f5c542');
    c.rect(5, 13, 7, 1, GLOW);                             // under-glow
    ground(c, 3, 11);
  },

  'computer.t1': (c) => {        // Beige CRT — deep, chunky, beloved
    const beige = '#c9bfa0';
    box(c, 2, 2, 12, 8, beige);
    c.rect(3, 3, 10, 6, '#6f7f6a');                        // dull green phosphor
    c.rect(4, 4, 8, 4, '#8fae86');
    c.px(4, 4, '#c3dbb8');
    box(c, 6, 10, 4, 2, shade(beige, -0.25));              // stand
    c.hline(4, 12, 8, INK);
    ground(c, 3, 10);
  },

  'computer.t2': (c) => {        // Dual monitors — thin bezels, blue glow
    screen(c, 0, 3, 8, 6, '#3a4657', '#6fa8ff');
    screen(c, 8, 3, 8, 6, '#3a4657', '#6fa8ff');
    c.vline(4, 9, 2, INK); c.vline(12, 9, 2, INK);
    c.hline(2, 11, 5, INK); c.hline(10, 11, 5, INK);
    ground(c, 2, 13);
  },

  'computer.t3': (c) => {        // Ultrawide RGB battlestation
    box(c, 0, 3, 16, 7, '#2f3644', { highlight: false });
    // Curved lit panel with an RGB gradient across it.
    const rgb = ['#ff5f8d', '#ff9f43', '#f5e663', '#4fe8a8', '#4fa8ff', '#b06de8'];
    for (let x = 1; x < 15; x++) {
      c.vline(x, 4, 5, rgb[Math.floor(((x - 1) / 14) * rgb.length)]);
    }
    c.hline(1, 4, 14, '#ffffff55');
    c.px(0, 3, INK); c.px(15, 3, INK);
    c.vline(7, 10, 2, INK); c.vline(8, 10, 2, INK);
    c.hline(4, 12, 8, INK);
    c.rect(2, 13, 12, 1, '#b06de855');                     // rgb spill
    ground(c, 3, 10);
  },

  'desk.t1': (c) => {            // Particleboard — the classic flat pack
    const wood = '#a8855c';
    box(c, 1, 5, 14, 3, wood);
    c.hline(2, 7, 12, shade(wood, -0.3));
    c.vline(3, 8, 6, shade(wood, -0.2));
    c.vline(12, 8, 6, shade(wood, -0.2));
    c.px(3, 13, INK); c.px(12, 13, INK);
    ground(c, 2, 12);
  },

  'desk.t2': (c) => {            // Sit/stand — raised, with a control pad
    const wood = '#b89a72';
    box(c, 1, 3, 14, 3, wood);
    c.rect(11, 6, 3, 1, '#4f8ce0');                        // control panel
    c.vline(7, 6, 7, shade(wood, -0.35));
    c.vline(8, 6, 7, shade(wood, -0.35));
    c.hline(5, 13, 6, INK);
    ground(c, 4, 8);
  },

  'desk.t3': (c) => {            // Motorised corner desk — L-shaped, lit
    const wood = '#9b7bd4';
    box(c, 0, 4, 11, 3, wood);
    box(c, 8, 7, 8, 3, shade(wood, -0.1));                 // the return
    c.rect(1, 7, 1, 6, INK);
    c.rect(14, 10, 1, 3, INK);
    c.rect(8, 7, 1, 6, INK);
    c.rect(2, 13, 13, 1, '#b06de844');
    c.px(2, 5, '#f5c542');                                 // memory-preset LED
    ground(c, 1, 14);
  },

  // =========================================================================
  // SERVER ROOM
  // =========================================================================

  'rack.t1': (c) => {            // A tower PC, shoved under a desk
    const grey = '#7a8391';
    box(c, 4, 2, 8, 12, grey);
    c.rect(6, 4, 4, 1, shade(grey, -0.4));                 // drive bays
    c.rect(6, 6, 4, 1, shade(grey, -0.4));
    c.px(6, 9, '#4fe86a');                                 // power LED
    c.px(9, 11, shade(grey, -0.3));
    ground(c, 4, 10, 15);
  },

  'rack.t2': (c) => {            // A proper 19" rack
    box(c, 3, 1, 10, 13, '#39424f');
    for (let y = 3; y <= 11; y += 2) {
      c.rect(4, y, 8, 1, '#556173');
      c.px(5, y, '#2ee6a8');                               // activity lights
      c.px(7, y, '#2ee6a8');
    }
    c.vline(3, 1, 13, INK); c.vline(12, 1, 13, INK);
    ground(c, 3, 10, 15);
  },

  'rack.t3': (c) => {            // Blade cluster — two racks, lots of light
    box(c, 1, 1, 6, 13, '#2f3a46');
    box(c, 9, 1, 6, 13, '#2f3a46');
    for (let y = 3; y <= 12; y += 2) {
      c.rect(2, y, 4, 1, '#2ee6a8');
      c.rect(10, y, 4, 1, '#2ee6a8');
    }
    c.rect(7, 6, 2, 3, '#4fe8c8');                         // interconnect
    ground(c, 1, 14, 15);
  },

  'rack.t4': (c) => {            // Quantum pod — a glowing cylinder
    box(c, 4, 1, 8, 14, '#1d2b33', { highlight: false });
    c.rect(5, 2, 6, 12, '#0f5f66');
    for (let y = 3; y <= 12; y++) {
      const t = (y - 3) / 9;
      c.rect(6, y, 4, 1, t < 0.5 ? '#4fe8f5' : '#7df5d0');
    }
    c.rect(7, 3, 2, 10, '#ffffff66');                      // core beam
    c.px(5, 2, GLOW); c.px(10, 13, GLOW);
    ground(c, 4, 10, 15);
  },

  'cooling.t1': (c) => {         // Desk fan
    box(c, 4, 2, 8, 8, '#8e97a6', { highlight: false });
    c.rect(5, 3, 6, 6, '#c8d2e0');
    c.px(7, 5, INK); c.px(8, 5, INK); c.px(7, 6, INK); c.px(8, 6, INK);
    c.hline(5, 4, 3, '#8e97a6'); c.hline(9, 7, 3, '#8e97a6');
    c.vline(7, 10, 3, INK); c.vline(8, 10, 3, INK);
    c.hline(5, 13, 6, INK);
    ground(c, 4, 9);
  },

  'cooling.t2': (c) => {         // Wall air-con unit, blowing
    box(c, 1, 2, 14, 6, '#e8eef7');
    c.rect(2, 6, 12, 1, '#9fb0c4');
    c.px(12, 4, '#4fc3e0');
    for (let x = 3; x <= 12; x += 3) {                     // cold air
      c.vline(x, 9, 2, '#8fe0f5');
      c.vline(x + 1, 11, 2, '#bfeeff');
    }
  },

  'cooling.t3': (c) => {         // Liquid cooling loop
    box(c, 2, 2, 12, 11, '#26313d', { highlight: false });
    c.frame(4, 4, 8, 7, '#4fd6e8');                        // tubing loop
    c.frame(5, 5, 6, 5, '#7df0ff');
    c.rect(6, 6, 4, 3, '#2a4a5a');
    c.px(6, 6, '#bff6ff'); c.px(9, 8, '#bff6ff');
    c.px(3, 3, '#5de8d6'); c.px(12, 11, '#5de8d6');        // coolant glints
    ground(c, 2, 12, 14);
  },

  // =========================================================================
  // BREAK ROOM
  // =========================================================================

  'coffee.t1': (c) => {          // Drip coffee pot
    box(c, 3, 2, 10, 4, '#8e97a6');
    c.px(5, 4, '#f5744d');                                 // on light
    box(c, 4, 7, 8, 5, '#3a2b22');                         // carafe
    c.rect(5, 9, 6, 2, '#6b3f26');                         // coffee
    c.vline(12, 8, 3, INK);                                // handle
    c.hline(3, 13, 10, INK);
    ground(c, 3, 10);
  },

  'coffee.t2': (c) => {          // Espresso bar — chrome and a warm cup
    box(c, 1, 1, 14, 7, '#d7dce4');
    c.rect(2, 2, 12, 2, '#f0f3f7');
    c.px(3, 5, '#f5c542'); c.px(5, 5, '#2ee6a8');          // buttons
    c.vline(8, 8, 2, '#9aa4b2');                           // group head
    c.rect(6, 10, 5, 3, '#ffffff');                        // cup
    c.rect(7, 11, 3, 1, '#6b3f26');
    c.frame(6, 10, 5, 3, INK);
    c.hline(1, 13, 14, INK);
    ground(c, 2, 12);
  },

  'coffee.t3': (c) => {          // Barista robot — an arm and a perfect cup
    box(c, 1, 2, 5, 10, '#c9d2de');                        // base
    c.rect(2, 3, 3, 2, '#4f8ce0');                         // face panel
    c.px(3, 4, '#ffffff');
    c.rect(6, 4, 5, 1, '#9aa4b2');                         // arm
    c.rect(10, 4, 1, 4, '#9aa4b2');
    c.px(10, 8, '#6b3f26');                                // pour
    c.px(10, 9, '#6b3f26');
    c.rect(9, 10, 4, 3, '#ffffff');                        // cup
    c.rect(10, 11, 2, 1, '#a8703f');
    c.frame(9, 10, 4, 3, INK);
    c.px(12, 2, '#f5c542');
    ground(c, 1, 13);
  },

  'snacks.t1': (c) => {          // Vending machine
    box(c, 3, 1, 10, 13, '#3f5a8a');
    c.rect(4, 2, 5, 9, '#7fb7e8');                         // glass
    for (let y = 3; y <= 9; y += 2) c.rect(5, y, 3, 1, '#f5c542');
    c.rect(10, 3, 2, 4, '#26313d');                        // keypad
    c.rect(10, 9, 2, 2, '#2b2233');                        // tray
    ground(c, 3, 10, 15);
  },

  'snacks.t2': (c) => {          // The snack wall
    box(c, 0, 1, 16, 12, '#8a6a45');
    for (let y = 2; y <= 10; y += 3) {
      c.hline(1, y + 2, 14, '#6b5133');                    // shelves
      const treats = ['#f5744d', '#f5c542', '#4fe8a8', '#6fa8ff', '#f57fb0'];
      for (let x = 2; x < 14; x += 2) {
        c.rect(x, y, 2, 2, treats[(x + y) % treats.length]);
      }
    }
    ground(c, 0, 16, 13);
  },

  'snacks.t3': (c) => {          // Catered lunch — a laid table
    c.rect(0, 6, 16, 2, '#f0f3f7');                        // tablecloth
    c.hline(0, 8, 16, '#c8d2e0');
    c.rect(2, 3, 4, 3, '#4fe8a8');                         // salad bowl
    c.frame(2, 3, 4, 3, INK);
    c.rect(7, 2, 3, 4, '#f5744d');                         // a hot dish
    c.frame(7, 2, 3, 4, INK);
    c.rect(11, 4, 4, 2, '#f5c542');                        // tray
    c.frame(11, 4, 4, 2, INK);
    c.px(4, 1, '#ffffff88'); c.px(8, 0, '#ffffff88');      // steam
    c.vline(3, 8, 5, INK); c.vline(12, 8, 5, INK);
    ground(c, 2, 12);
  },

  // =========================================================================
  // GYM
  // =========================================================================

  'cardio.t1': (c) => {          // One sad treadmill
    box(c, 1, 9, 14, 3, '#3f4654');                        // belt
    c.hline(2, 10, 12, '#6b7688');
    c.vline(12, 3, 6, '#8e97a6');                          // upright
    c.hline(10, 2, 5, '#8e97a6');                          // handle
    c.rect(10, 3, 4, 2, '#26313d');                        // console
    c.px(11, 4, '#f5744d');
    ground(c, 1, 14, 12);
  },

  'cardio.t2': (c) => {          // Cardio row — a rowing machine
    c.rect(1, 10, 14, 2, '#6b7688');                       // rail
    c.rect(4, 8, 4, 2, '#4f8ce0');                         // seat
    c.frame(4, 8, 4, 2, INK);
    box(c, 11, 5, 4, 6, '#39424f');                        // flywheel housing
    c.px(12, 7, '#b06de8'); c.px(13, 9, '#b06de8');
    c.hline(2, 6, 3, '#8e97a6');                           // handle
    c.rect(4, 6, 7, 1, '#c8d2e0');                         // chain
    ground(c, 1, 14, 12);
  },

  'cardio.t3': (c) => {          // Full weight room — a rack and a barbell
    c.vline(2, 2, 11, '#3f4654'); c.vline(3, 2, 11, '#3f4654');
    c.vline(12, 2, 11, '#3f4654'); c.vline(13, 2, 11, '#3f4654');
    c.hline(2, 1, 12, '#3f4654');
    c.rect(1, 5, 14, 1, '#c8d2e0');                        // bar
    box(c, 0, 3, 3, 5, '#b06de8');                         // plates
    box(c, 13, 3, 3, 5, '#b06de8');
    c.rect(5, 10, 3, 3, '#f5744d');                        // dumbbells
    c.rect(9, 11, 2, 2, '#f5c542');
    ground(c, 1, 14);
  },

  'recovery.t1': (c) => {        // Yoga mat, rolled out
    c.rect(1, 9, 14, 4, '#6fbf8f');
    c.frame(1, 9, 14, 4, INK);
    c.hline(2, 10, 12, '#9fe0b8');
    c.rect(12, 8, 3, 5, '#4f9f70');                        // rolled end
    c.frame(12, 8, 3, 5, INK);
    ground(c, 1, 14, 13);
  },

  'recovery.t2': (c) => {        // Massage chair
    const p = '#7a4fa8';
    box(c, 3, 1, 9, 8, p);                                 // reclined back
    c.hline(4, 3, 7, shade(p, 0.3));
    c.hline(4, 5, 7, shade(p, 0.3));
    box(c, 1, 9, 13, 3, shade(p, -0.2));                   // seat
    c.hline(2, 10, 11, shade(p, 0.15));
    c.px(13, 2, '#f5c542');                                // control
    c.vline(3, 12, 2, INK); c.vline(12, 12, 2, INK);
    ground(c, 2, 12);
  },

  'recovery.t3': (c) => {        // Sauna & cold plunge, side by side
    box(c, 0, 2, 8, 12, '#a8763f');                        // sauna
    c.hline(1, 5, 6, shade('#a8763f', -0.3));
    c.hline(1, 9, 6, shade('#a8763f', -0.3));
    c.px(2, 3, '#ffffff55'); c.px(4, 1, '#ffffff55');      // steam
    box(c, 9, 5, 7, 9, '#2f6f8f');                         // plunge
    c.rect(10, 6, 5, 7, '#4fc3e0');
    c.hline(10, 7, 5, '#bfeeff');
    c.px(12, 9, '#ffffff');
    ground(c, 0, 16);
  },

  // =========================================================================
  // MEETING ROOMS
  // =========================================================================

  'table.t1': (c) => {           // Folding table
    const g = '#c9c2b0';
    box(c, 0, 6, 16, 2, g);
    c.vline(3, 8, 5, '#8e97a6'); c.vline(12, 8, 5, '#8e97a6');
    c.hline(2, 12, 3, '#8e97a6'); c.hline(11, 12, 3, '#8e97a6');
    ground(c, 1, 14);
  },

  'table.t2': (c) => {           // Conference table with chairs
    const w = '#9c6b4a';
    box(c, 1, 6, 14, 3, w);
    c.hline(2, 7, 12, shade(w, 0.25));
    c.vline(7, 9, 4, shade(w, -0.4)); c.vline(8, 9, 4, shade(w, -0.4));
    c.hline(5, 13, 6, INK);
    c.rect(1, 3, 3, 3, '#e86d8a');                         // chair backs
    c.rect(6, 3, 3, 3, '#e86d8a');
    c.rect(11, 3, 3, 3, '#e86d8a');
    ground(c, 3, 10);
  },

  'table.t3': (c) => {           // The boardroom slab — long, dark, polished
    box(c, 0, 5, 16, 4, '#3b2a33');
    c.hline(1, 6, 14, '#7a5a6a');                          // polish highlight
    c.rect(4, 7, 8, 1, '#f59bb0');                         // reflected light
    c.vline(2, 9, 4, INK); c.vline(13, 9, 4, INK);
    c.rect(2, 2, 3, 3, '#e86d8a');
    c.rect(11, 2, 3, 3, '#e86d8a');
    c.px(7, 3, '#f5c542'); c.px(8, 3, '#f5c542');          // a little trophy
    ground(c, 1, 14);
  },

  'av.t1': (c) => {              // Wall-mounted TV
    screen(c, 1, 2, 14, 9, '#2b2233', '#4f6f8f');
    c.rect(3, 4, 5, 3, '#7fa8c8');
    c.vline(7, 11, 2, INK);
    c.hline(5, 13, 6, INK);
    ground(c, 4, 9);
  },

  'av.t2': (c) => {              // Projector throwing a cone of light
    box(c, 0, 4, 6, 5, '#39424f');
    c.rect(5, 5, 1, 3, '#f5f0c0');
    for (let i = 0; i < 9; i++) {                          // the beam
      c.vline(6 + i, 6 - Math.floor(i / 2), 1 + i, '#f5f0c033');
    }
    c.rect(13, 1, 3, 12, '#e8eef7');                       // screen
    c.frame(13, 1, 3, 12, INK);
    c.px(1, 5, '#2ee6a8');
  },

  'av.t3': (c) => {              // Holographic display
    c.rect(4, 13, 8, 2, '#39424f');                        // emitter base
    c.frame(4, 13, 8, 2, INK);
    for (let y = 2; y <= 11; y++) {                        // the hologram
      const spread = Math.round((y - 1) * 0.55);
      c.rect(8 - spread, y, spread * 2 + 1, 1,
        y % 2 === 0 ? '#4fd6e866' : '#8ceef599');
    }
    c.rect(6, 5, 5, 4, '#bff6ff88');                       // the thing it shows
    c.px(8, 1, '#ffffff');
  },

  // =========================================================================
  // ROOFTOP LOUNGE
  // =========================================================================

  'seating.t1': (c) => {         // Beanbags
    const a = '#e8884d';
    const b = '#4fc3e0';
    c.rect(1, 8, 6, 5, a); c.rect(2, 7, 4, 1, a); c.frame(1, 8, 6, 5, INK);
    c.px(2, 8, shade(a, 0.35));
    c.rect(8, 9, 7, 4, b); c.rect(9, 8, 5, 1, b); c.frame(8, 9, 7, 4, INK);
    c.px(9, 9, shade(b, 0.35));
    ground(c, 1, 14, 13);
  },

  'seating.t2': (c) => {         // Modular couches
    const t = '#3dd6e8';
    box(c, 0, 5, 16, 3, shade(t, -0.25));                  // backrest
    box(c, 0, 8, 16, 4, t);
    c.vline(5, 8, 4, shade(t, -0.35));                     // module seams
    c.vline(11, 8, 4, shade(t, -0.35));
    c.rect(2, 3, 2, 2, '#f5c542');                         // cushions
    c.rect(12, 3, 2, 2, '#f5744d');
    ground(c, 0, 16, 12);
  },

  'seating.t3': (c) => {         // Nap pods
    for (const x of [0, 8]) {
      box(c, x, 4, 8, 9, '#d7dce4', { highlight: false });
      c.rect(x + 1, 5, 6, 3, '#8ceef5');                   // canopy
      c.rect(x + 1, 8, 6, 4, '#4a5768');                   // the dark inside
      c.px(x + 5, 9, '#ffffff88');
      c.frame(x, 4, 8, 9, INK);
    }
    ground(c, 0, 16);
  },

  'games.t1': (c) => {           // Ping pong table
    box(c, 0, 6, 16, 3, '#2f6f4f');
    c.hline(0, 7, 16, '#4f9f70');
    c.rect(7, 4, 2, 2, '#e8eef7');                         // net
    c.frame(7, 4, 2, 2, INK);
    c.vline(2, 9, 4, INK); c.vline(13, 9, 4, INK);
    c.px(4, 5, '#f5c542');                                 // the ball
    ground(c, 1, 14);
  },

  'games.t2': (c) => {           // Arcade cabinet
    box(c, 3, 0, 10, 14, '#3a3f8a');
    c.rect(4, 1, 8, 2, '#f5744d');                         // marquee
    screen(c, 4, 4, 8, 5, '#1a1d2b', '#6fa8ff');
    c.px(6, 6, '#f5c542'); c.px(9, 7, '#4fe8a8');          // sprites on screen
    c.rect(4, 10, 8, 2, '#2a2f6a');                        // control deck
    c.px(6, 11, '#f5744d'); c.px(8, 11, '#f5c542'); c.px(10, 11, '#4fe8a8');
    ground(c, 3, 10, 15);
  },

  'games.t3': (c) => {           // VR rig — a headset on a stand
    box(c, 2, 3, 12, 6, '#2b3140');                        // headset body
    c.rect(3, 4, 4, 3, '#8ceef5');                         // lenses
    c.rect(9, 4, 4, 3, '#8ceef5');
    c.px(4, 5, '#ffffff'); c.px(10, 5, '#ffffff');
    c.rect(1, 4, 1, 3, '#4a5768');                         // strap
    c.rect(14, 4, 1, 3, '#4a5768');
    c.vline(7, 9, 4, '#6b7688'); c.vline(8, 9, 4, '#6b7688');
    c.hline(4, 13, 8, INK);
    c.px(2, 2, '#b06de8'); c.px(13, 2, '#3dd6e8');         // tracking dots
    ground(c, 3, 10);
  },

  // =========================================================================
  // EXECUTIVE SUITE
  // =========================================================================

  'execdesk.t1': (c) => {        // Sensible oak desk
    const oak = '#a8763f';
    box(c, 0, 5, 16, 3, oak);
    c.hline(1, 6, 14, shade(oak, 0.25));
    c.rect(1, 8, 4, 5, shade(oak, -0.25));                 // drawer stack
    c.frame(1, 8, 4, 5, INK);
    c.px(4, 10, '#f5c542');
    c.vline(14, 8, 5, shade(oak, -0.3));
    ground(c, 1, 14);
  },

  'execdesk.t2': (c) => {        // Mahogany — richer, with a desk lamp
    const wood = '#7a3b2e';
    box(c, 0, 6, 16, 3, wood);
    c.hline(1, 7, 14, shade(wood, 0.3));
    c.rect(1, 9, 4, 4, shade(wood, -0.25));
    c.frame(1, 9, 4, 4, INK);
    c.vline(13, 9, 4, shade(wood, -0.3));
    c.vline(12, 3, 3, '#f5c542');                          // lamp
    c.rect(10, 1, 5, 2, '#f5c542');
    c.frame(10, 1, 5, 2, INK);
    c.rect(11, 4, 3, 2, '#fff3b055');                      // lamplight
    ground(c, 1, 14);
  },

  'execdesk.t3': (c) => {        // Floating glass desk
    c.rect(0, 6, 16, 2, GLASS);
    c.hline(0, 6, 16, '#ffffff');
    c.hline(0, 8, 16, '#7fb7c8');
    c.rect(3, 9, 1, 4, '#9fd8e855');                       // near-invisible legs
    c.rect(12, 9, 1, 4, '#9fd8e855');
    c.rect(6, 2, 5, 4, '#2b3140');                         // a very thin laptop
    c.rect(7, 3, 3, 2, '#6fa8ff');
    c.rect(2, 13, 12, 1, '#7fb7c833');                     // floaty shadow
  },

  'art.t1': (c) => {             // Motivational poster
    box(c, 2, 1, 12, 12, '#e8eef7');
    c.rect(3, 2, 10, 7, '#7fb7e8');                        // a stock photo sky
    c.rect(4, 6, 8, 3, '#4f8ce0');                         // mountain
    c.px(8, 5, '#ffffff');
    c.hline(4, 11, 8, '#8b97a8');                          // the slogan
  },

  'art.t2': (c) => {             // Abstract painting in a gold frame
    box(c, 1, 1, 14, 12, '#f5c542', { highlight: false });
    c.rect(3, 3, 10, 8, '#2b2233');
    c.rect(4, 4, 4, 4, '#f5744d');
    c.rect(8, 6, 4, 4, '#4fc3e0');
    c.rect(6, 5, 3, 3, '#f5e663');
    c.px(5, 9, '#ffffff'); c.px(11, 4, '#ffffff');
  },

  'art.t3': (c) => {             // Commissioned sculpture on a plinth
    box(c, 4, 10, 8, 4, '#d7dce4');                        // plinth
    c.rect(6, 2, 4, 8, '#f5c542');                         // the piece
    c.rect(5, 4, 6, 2, '#f7e08a');
    c.rect(7, 1, 2, 2, '#fff3b0');
    c.frame(6, 2, 4, 8, INK);
    c.px(5, 3, '#ffffff'); c.px(10, 7, '#ffffff');
    c.rect(3, 14, 10, 1, SHADOW);
  },
};

/** Draw one item sprite and return its 16x16 canvas. */
export function drawItem(key) {
  const draw = SPRITES[key];
  if (!draw) return null;
  const canvas = new Canvas(16, 16);
  draw(canvas);
  return canvas;
}

export const ITEM_KEYS = Object.keys(SPRITES);
export default SPRITES;
