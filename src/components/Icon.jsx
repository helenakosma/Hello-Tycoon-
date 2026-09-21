/**
 * A pixel UI icon (coin, star, lock, ...).
 *
 * Thin wrapper over <Sprite> so the HUD uses the same art pipeline as the
 * tower: the PNGs live in public/assets/ui/ and can be repainted freely.
 * If an icon file is missing, the fallback character keeps the UI readable.
 */

import React from 'react';
import Sprite from './Sprite.jsx';

/** Characters used when the PNG isn't there. */
const FALLBACK = {
  coin: '●',
  star: '★',
  star_empty: '☆',
  lock: '🔒',
  check: '✓',
  bolt: '⚡',
  trophy: '🏆',
  floors: '▤',
  spark: '✦',
};

export default function Icon({ name, size = 18, label = '', className = '' }) {
  return (
    <Sprite
      spriteKey={`ui.${name}`}
      placeholder={{ color: 'transparent', glyph: FALLBACK[name] || '' }}
      label={label}
      className={`ui-icon ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
