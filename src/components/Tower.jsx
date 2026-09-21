/**
 * The tower: a cutaway view of the office, floor by floor.
 *
 * STRUCTURE:
 *   .tower-scroll
 *     └ .floor          one storey, painted with the room's pixel art
 *         └ .room       the strip of floor the furniture stands on
 *             └ .item-slot × n   one per upgrade line
 *                 └ <Sprite>     the furniture sprite
 *
 * Nothing here knows whether a sprite is a picture or a fallback colour box —
 * that decision lives entirely in Sprite.jsx / assets.js.
 */

import React, { useEffect, useRef } from 'react';
import Sprite from './Sprite.jsx';
import Icon from './Icon.jsx';
import ITEMS from '../data/items.js';
import { roomsById } from '../data/rooms.js';
import {
  formatNumber, floorBuildStatus, reputationMultiplier, totalBonuses,
} from '../state/selectors.js';

/** Flat Bytes/sec this one floor contributes, for the little green label. */
function floorIncome(floor, state) {
  const lines = ITEMS[floor.roomType] || [];
  let flat = 0;
  for (const line of lines) {
    const owned = floor.items?.[line.id] ?? 1;
    const tier = line.tiers[Math.min(owned, line.tiers.length) - 1];
    if (tier?.bonus.type === 'bytesPerSec') flat += tier.bonus.value;
  }
  if (flat === 0) return 0;
  const bonuses = totalBonuses(state);
  return flat * (1 + bonuses.passiveMult) * reputationMultiplier(state);
}

/**
 * One piece of furniture standing in a room.
 *
 * In the tower it is just the sprite — no text — so the floor reads as a
 * little scene rather than a list. The names and tiers live in the shop panel
 * underneath, where you actually need them. Hovering still names it.
 */
function ItemSlot({ line, tier, ownedTier }) {
  const slotRef = useRef(null);
  const previousTier = useRef(ownedTier);

  useEffect(() => {
    if (previousTier.current !== ownedTier && slotRef.current) {
      const node = slotRef.current;
      node.classList.remove('just-upgraded');
      // Force a reflow so the animation restarts even on a rapid re-purchase.
      void node.offsetWidth;
      node.classList.add('just-upgraded');
    }
    previousTier.current = ownedTier;
  }, [ownedTier]);

  const maxed = ownedTier >= line.tiers.length;

  return (
    <span
      className={`item-slot${maxed ? ' is-max' : ''}`}
      ref={slotRef}
      title={`${line.name}: ${tier.name}${maxed ? ' (fully upgraded)' : ''}`}
    >
      <Sprite
        spriteKey={`${line.sprite}.t${ownedTier}`}
        placeholder={tier.placeholder}
        label={tier.name}
        className="item-sprite"
      />
    </span>
  );
}

/** One storey: a room backdrop with furniture standing on its floor. */
function Floor({ floor, index, isSelected, onSelect, state }) {
  const room = roomsById[floor.roomType];
  const lines = ITEMS[floor.roomType] || [];
  const income = floorIncome(floor, state);

  return (
    <div
      className={`floor${isSelected ? ' is-selected' : ''}`}
      style={{ borderColor: room.placeholder.accent, background: room.placeholder.bg }}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(index); } }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Floor ${floor.level}, ${floor.name || room.name}`}
    >
      {/* The room interior. Falls back to a flat colour if the art is missing. */}
      <Sprite
        spriteKey={room.sprite}
        placeholder={{ color: room.placeholder.bg, glyph: room.placeholder.glyph }}
        label={room.name}
        className="floor-bg"
      />

      <div className="floor-head">
        <span className="floor-number">{String(floor.level).padStart(2, '0')}</span>
        <span className="floor-name">{floor.name || room.name}</span>
        {income > 0 && (
          <span className="floor-income">+{formatNumber(income)}/s</span>
        )}
      </div>

      {/* Furniture stands on the floor line drawn in the room art. */}
      <div className="room">
        {lines.map((line) => {
          const owned = floor.items?.[line.id] ?? 1;
          const tier = line.tiers[Math.min(owned, line.tiers.length) - 1];
          return <ItemSlot key={line.id} line={line} tier={tier} ownedTier={owned} />;
        })}
      </div>
    </div>
  );
}

export default function Tower({ state, dispatch, onBuild }) {
  const build = floorBuildStatus(state);
  const scrollRef = useRef(null);
  const floorCount = state.floors.length;

  // When a new floor appears, scroll up to show it off.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [floorCount]);

  return (
    <div className="card tower-card">
      <div className="card-head">
        <span className="card-title">Your Tower</span>
        <span className="dim" style={{ fontSize: 12.5 }}>
          {floorCount} floor{floorCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="tower-scroll" ref={scrollRef}>
        {/* The roof cap and sign, so the tower has a top rather than just stopping. */}
        <div className="roof" aria-hidden="true">
          <div className="roof-sign">BITWISE INC</div>
          <div className="roof-slab" />
        </div>

        {/* The next floor, shown as a dashed outline so the goal is visible. */}
        {build.def && (
          <div className="floor-ghost">
            <strong>Next: {build.def.name || roomsById[build.def.roomType].name}</strong>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
              <Icon name="coin" size={13} /> {formatNumber(build.def.cost)}
            </span>
            <span className="dim"> · <Icon name="check" size={12} /> {build.def.requiresProblems}</span>
            <div className="why">
              {build.canBuild
                ? <button className="btn btn-primary" onClick={onBuild}>Build it</button>
                : build.reason}
            </div>
          </div>
        )}

        {/* Highest floor first in the DOM; the column is bottom-anchored. */}
        {[...state.floors].reverse().map((floor) => {
          const index = state.floors.indexOf(floor);
          return (
            <Floor
              key={floor.level}
              floor={floor}
              index={index}
              isSelected={state.selectedFloor === index}
              onSelect={(i) => dispatch({ type: 'SELECT_FLOOR', index: i })}
              state={state}
            />
          );
        })}

        {/* The pavement the tower stands on. */}
        <div className="tower-ground" aria-hidden="true" />
      </div>
    </div>
  );
}
