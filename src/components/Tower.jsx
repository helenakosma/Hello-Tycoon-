/**
 * The tower: a cutaway view of the office, floor by floor.
 *
 * STRUCTURE (this is the hierarchy real pixel art will slot into):
 *   .tower-scroll
 *     └ .floor          one storey — a labelled coloured rectangle
 *         └ .room       the interior
 *             └ .item-slot × n   one per upgrade line
 *                 └ <Sprite>     coloured box today, PNG later
 *
 * Nothing here knows whether a sprite is a picture or a box — that decision
 * lives entirely in Sprite.jsx / assets.js.
 */

import React, { useEffect, useRef } from 'react';
import Sprite from './Sprite.jsx';
import ITEMS from '../data/items.js';
import { roomsById } from '../data/rooms.js';
import { CURRENCY } from '../data/config.js';
import {
  formatNumber, floorBuildStatus, solvedCount, reputationMultiplier, totalBonuses,
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

/** One item inside a room. Flashes when its tier goes up. */
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
    <span className={`item-slot${maxed ? ' is-max' : ''}`} ref={slotRef} title={`${line.name}: ${tier.name}`}>
      <Sprite
        spriteKey={`${line.sprite}.t${ownedTier}`}
        placeholder={tier.placeholder}
        label={tier.name}
      />
      <span>{tier.name}</span>
      <span className="tier-badge">{maxed ? 'MAX' : `T${ownedTier}`}</span>
    </span>
  );
}

/** One storey. */
function Floor({ floor, index, isSelected, onSelect, state }) {
  const room = roomsById[floor.roomType];
  const lines = ITEMS[floor.roomType] || [];
  const income = floorIncome(floor, state);

  return (
    <div
      className={`floor${isSelected ? ' is-selected' : ''}`}
      style={{ background: room.placeholder.bg, borderColor: room.placeholder.accent }}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(index); } }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      {/* Temporary decoration; a real room sprite will cover this area. */}
      <span className="floor-glyph" aria-hidden="true">{room.placeholder.glyph}</span>

      <div className="floor-head">
        <span className="floor-number">{String(floor.level).padStart(2, '0')}</span>
        <span className="floor-name" style={{ color: room.placeholder.accent }}>
          {floor.name || room.name}
        </span>
        {income > 0 && (
          <span className="floor-income">+{formatNumber(income)}/s</span>
        )}
      </div>

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
        <span className="dim mono" style={{ fontSize: 12 }}>
          {floorCount} floor{floorCount === 1 ? '' : 's'} · {solvedCount(state)} solved
        </span>
      </div>

      <div className="tower-scroll" ref={scrollRef}>
        <div className="sky">— rooftop —</div>

        {/* The next floor, shown as a dashed outline so the goal is visible. */}
        {build.def && (
          <div className="floor-ghost">
            <strong>Floor {build.def.level}: {build.def.name || roomsById[build.def.roomType].name}</strong>
            <span className="mono" style={{ color: 'var(--gold)' }}>
              {formatNumber(build.def.cost)} {CURRENCY.symbol}
            </span>
            <span className="dim"> · needs {build.def.requiresProblems} solved</span>
            <div className="why">
              {build.canBuild
                ? <button className="btn btn-primary" onClick={onBuild}>Build this floor</button>
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
      </div>
    </div>
  );
}
