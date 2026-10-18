/**
 * The room view: the selected floor seen from above, with a plot for each
 * machine you can own.
 *
 * This is the tycoon half of the game. A floor arrives empty, so every plot
 * starts as a dashed outline with a price on it; buying fills the plot with a
 * machine, and buying again upgrades it through its tiers. You watch the room
 * fill up one machine at a time, and the tower above shows the same floor from
 * the side so you can see the whole building grow.
 *
 * Nothing here knows whether a sprite is real art or a fallback colour box —
 * that decision lives in Sprite.jsx / assets.js.
 */

import React from 'react';
import Sprite from './Sprite.jsx';
import Icon from './Icon.jsx';
import ITEMS from '../data/items.js';
import { roomsById } from '../data/rooms.js';
import { BONUS_TYPES, PRESTIGE } from '../data/config.js';
import {
  formatNumber, roomUpgrades, prestigeStatus, totalBonuses, reputationMultiplier,
} from '../state/selectors.js';

/** Bytes/sec this one floor puts out, for the label in the corner. */
function floorIncome(floor, state) {
  let flat = 0;
  for (const line of ITEMS[floor.roomType] || []) {
    const owned = floor.items?.[line.id] ?? 0;
    if (owned < 1) continue;
    const tier = line.tiers[Math.min(owned, line.tiers.length) - 1];
    if (tier?.bonus.type === 'bytesPerSec') flat += tier.bonus.value;
  }
  if (flat === 0) return 0;
  return flat * (1 + totalBonuses(state).passiveMult) * reputationMultiplier(state);
}

/** One spot on the floor: either a machine, or an empty pad waiting for one. */
function Plot({ upgrade, onBuy }) {
  const { line, owned, owned0, maxed, currentTier, nextTier, affordable } = upgrade;

  const describe = (tier) => BONUS_TYPES[tier.bonus.type].describe(tier.bonus.value);
  const tip = owned0
    ? `${nextTier.name} — ${describe(nextTier)}`
    : maxed
      ? `${currentTier.name} — fully upgraded, ${describe(currentTier)}`
      : `${currentTier.name} → ${nextTier.name} — ${describe(nextTier)}`;

  const canClick = !maxed && affordable;

  return (
    <div className="plot-wrap">
      <button
        className={`plot${owned0 ? ' is-empty' : ''}${maxed ? ' is-max' : ''}${canClick ? ' can-buy' : ''}`}
        onClick={() => canClick && onBuy(line.id)}
        disabled={!canClick}
        data-tip={tip}
        aria-label={tip}
      >
        {owned0 ? (
          <span className="plot-plus" aria-hidden="true">+</span>
        ) : (
          <Sprite
            spriteKey={`${line.sprite.replace(/^item\./, 'itemtop.')}.t${owned}`}
            placeholder={currentTier.placeholder}
            label={currentTier.name}
            className="plot-sprite"
          />
        )}

        {/* Tier pips, so you can see how far through a line you are. */}
        {!owned0 && (
          <span className="plot-pips" aria-hidden="true">
            {line.tiers.map((_, i) => (
              <i key={i} className={i < owned ? 'on' : ''} />
            ))}
          </span>
        )}
      </button>

      <div className="plot-label">{owned0 ? line.name : currentTier.name}</div>

      {maxed ? (
        <div className="plot-tag is-max">MAX</div>
      ) : (
        <button
          className={`plot-tag${affordable ? ' can-buy' : ''}`}
          onClick={() => affordable && onBuy(line.id)}
          disabled={!affordable}
          data-tip={affordable
            ? `${owned0 ? 'Install' : 'Upgrade to'} ${nextTier.name}`
            : `Needs ${formatNumber(nextTier.cost)} Bytes`}
        >
          <Icon name="coin" size={12} /> {formatNumber(nextTier.cost)}
        </button>
      )}
    </div>
  );
}

export default function RoomView({ state, onBuy, onPrestige }) {
  const floor = state.floors[state.selectedFloor] || state.floors[0];
  const index = state.floors.indexOf(floor);
  const room = roomsById[floor.roomType];
  const upgrades = roomUpgrades(state, index);
  const prestige = prestigeStatus(state);
  const income = floorIncome(floor, state);
  const built = upgrades.filter((u) => !u.owned0).length;

  return (
    <div className="card roomview-card">
      <div className="card-head">
        <span className="card-title" style={{ color: room.placeholder.accent }}>
          {floor.name || room.name}
        </span>
        <span className="row" style={{ fontSize: 12 }}>
          <span className="dim" data-tip="Machines installed on this floor">
            {built}/{upgrades.length} installed
          </span>
          {income > 0 && (
            <span className="floor-income" data-tip="What this floor earns on its own">
              <Icon name="bolt" size={11} /> {formatNumber(income)}/s
            </span>
          )}
        </span>
      </div>

      {/* The floor, from above. Machines stand on their plots. */}
      <div className="roomview-stage">
        <Sprite
          spriteKey={`roomtop.${floor.roomType}`}
          placeholder={{ color: room.placeholder.bg, glyph: room.placeholder.glyph }}
          label={`${room.name}, seen from above`}
          className="roomview-bg"
        />
        <div className="plots">
          {upgrades.map((u) => (
            <Plot key={u.line.id} upgrade={u} onBuy={(lineId) => onBuy(index, lineId)} />
          ))}
        </div>
      </div>

      {/* --- Series B ------------------------------------------------------ */}
      <div className="prestige-bar">
        <button
          className="btn-prestige"
          onClick={onPrestige}
          disabled={!prestige.available}
          data-tip={prestige.available
            ? `Reset the tower to one floor. You keep every problem you have solved and your level, and all future Bytes are worth ×${prestige.newMultiplier.toFixed(2)}.`
            : prestige.reason}
        >
          {prestige.available
            ? <>{PRESTIGE.name} · <Icon name="trophy" size={14} /> +{prestige.gain}</>
            : PRESTIGE.name}
        </button>
      </div>
    </div>
  );
}
