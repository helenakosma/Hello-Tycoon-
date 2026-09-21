/**
 * Sprite — the single place the game decides "image or coloured box?".
 *
 * Every room and item renders through this component. Today it draws a
 * coloured box with a glyph. The day real pixel art lands in public/assets,
 * flipping ASSET_MODE in src/data/assets.js makes this component draw the
 * image instead, at exactly the same size and position. No other file changes.
 */

import React, { useEffect, useState } from 'react';
import { probeSprite, spritePath } from '../data/assets.js';

/**
 * @param {string} spriteKey    e.g. "item.chair.t2" (see assets.js)
 * @param {object} placeholder  { color, glyph } from the item/room data
 * @param {string} label        accessible name / tooltip
 * @param {string} className    extra classes, e.g. "room-sprite"
 * @param {object} style        inline overrides, mainly for icon sizing
 */
export default function Sprite({ spriteKey, placeholder = {}, label = '', className = '', style }) {
  // probeSprite returns a boolean when it already knows, or a Promise.
  const [hasImage, setHasImage] = useState(() => {
    const answer = probeSprite(spriteKey);
    return answer === true;
  });

  useEffect(() => {
    let alive = true;
    const answer = probeSprite(spriteKey);
    if (typeof answer === 'boolean') {
      setHasImage(answer);
    } else {
      answer.then((found) => { if (alive) setHasImage(found); });
    }
    return () => { alive = false; };
  }, [spriteKey]);

  if (hasImage) {
    return (
      <span className={`sprite ${className}`} title={label} style={style}>
        <img src={spritePath(spriteKey)} alt={label} />
      </span>
    );
  }

  return (
    <span
      className={`sprite ${className}`}
      title={label}
      style={{ background: placeholder.color || '#4a5566', ...style }}
      aria-label={label}
      role="img"
    >
      {placeholder.glyph || ''}
    </span>
  );
}
