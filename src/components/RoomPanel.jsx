/**
 * The panel under the tower: upgrade the selected floor, and (once you
 * qualify) take the Series B.
 *
 * Tiny Tower style — click a floor, see what you can buy in it.
 */

import React from 'react';
import Sprite from './Sprite.jsx';
import Icon from './Icon.jsx';
import { roomsById } from '../data/rooms.js';
import { BONUS_TYPES, PRESTIGE } from '../data/config.js';
import { formatNumber, roomUpgrades, prestigeStatus } from '../state/selectors.js';

export default function RoomPanel({ state, onBuy, onPrestige }) {
  const floor = state.floors[state.selectedFloor] || state.floors[0];
  const index = state.floors.indexOf(floor);
  const room = roomsById[floor.roomType];
  const upgrades = roomUpgrades(state, index);
  const prestige = prestigeStatus(state);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title" style={{ color: room.placeholder.accent }}>
          {floor.name || room.name}
        </span>
        <span className="dim" style={{ fontSize: 12 }}>floor {floor.level}</span>
      </div>

      <div className="shop-body">
        {upgrades.map(({ line, owned, maxed, currentTier, nextTier, affordable }) => (
          <div className="upgrade-row" key={line.id}>
            <Sprite
              spriteKey={`${line.sprite}.t${owned}`}
              placeholder={currentTier.placeholder}
              label={currentTier.name}
            />

            <div className="upgrade-info">
              <div className="upgrade-name">{currentTier.name}</div>
              {maxed ? (
                <div className="upgrade-maxed">
                  Maxed · {BONUS_TYPES[currentTier.bonus.type].describe(currentTier.bonus.value)}
                </div>
              ) : (
                <div className="upgrade-next">
                  → {nextTier.name} · <b>{BONUS_TYPES[nextTier.bonus.type].describe(nextTier.bonus.value)}</b>
                </div>
              )}
            </div>

            {!maxed && (
              <button
                className="btn-buy"
                onClick={() => onBuy(index, line.id)}
                disabled={!affordable}
                title={affordable ? `Buy ${nextTier.name}` : 'Not enough Bytes yet'}
              >
                <Icon name="coin" size={13} />
                {formatNumber(nextTier.cost)}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- Series B ------------------------------------------------------ */}
      <div style={{ padding: '11px 14px', borderTop: '2px solid var(--border)' }}>
        <button
          className="btn-prestige"
          onClick={onPrestige}
          disabled={!prestige.available}
          title={prestige.reason || ''}
        >
          {prestige.available
            ? <>{PRESTIGE.name} · <Icon name="trophy" size={14} /> +{prestige.gain}</>
            : PRESTIGE.name}
        </button>
        <div className="dim" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.45 }}>
          {prestige.available ? (
            <>
              Start the tower again from one floor. You keep every problem you have solved and
              your level, and all future Bytes are worth
              {' '}<b style={{ color: 'var(--purple)' }}>×{prestige.newMultiplier.toFixed(2)}</b>.
            </>
          ) : (
            <>{prestige.reason}.</>
          )}
        </div>
      </div>
    </div>
  );
}
