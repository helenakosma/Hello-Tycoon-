/**
 * The panel under the tower: upgrade the selected floor, and (once you
 * qualify) take the Series B.
 *
 * Tiny Tower style — click a floor, see what you can buy in it.
 */

import React from 'react';
import Sprite from './Sprite.jsx';
import { roomsById } from '../data/rooms.js';
import { BONUS_TYPES, CURRENCY, PRESTIGE } from '../data/config.js';
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
          Floor {floor.level} · {floor.name || room.name}
        </span>
        <span className="dim" style={{ fontSize: 12 }}>click a floor above to switch</span>
      </div>

      <div className="shop-body">
        <p className="shop-blurb">{room.blurb}</p>

        {upgrades.map(({ line, owned, maxed, currentTier, nextTier, affordable }) => (
          <div className="upgrade-row" key={line.id}>
            <Sprite
              spriteKey={`${line.sprite}.t${owned}`}
              placeholder={currentTier.placeholder}
              label={currentTier.name}
            />

            <div className="upgrade-info">
              <div className="upgrade-name">
                {line.name}: <span className="muted">{currentTier.name}</span>
              </div>
              {maxed ? (
                <div className="upgrade-maxed">
                  Fully upgraded · {BONUS_TYPES[currentTier.bonus.type].describe(currentTier.bonus.value)}
                </div>
              ) : (
                <div className="upgrade-next">
                  Next: {nextTier.name} — <b>{BONUS_TYPES[nextTier.bonus.type].describe(nextTier.bonus.value)}</b>
                  <span className="dim">
                    {' '}(replaces {BONUS_TYPES[currentTier.bonus.type].describe(currentTier.bonus.value)})
                  </span>
                </div>
              )}
            </div>

            {!maxed && (
              <button
                className="btn btn-buy"
                onClick={() => onBuy(index, line.id)}
                disabled={!affordable}
                title={affordable ? `Buy ${nextTier.name}` : 'Not enough Bytes yet'}
              >
                {formatNumber(nextTier.cost)} {CURRENCY.symbol}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- Series B ------------------------------------------------------ */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-prestige"
          onClick={onPrestige}
          disabled={!prestige.available}
          title={prestige.reason || ''}
        >
          {prestige.available
            ? `Take ${PRESTIGE.name} — +${prestige.gain} Reputation`
            : PRESTIGE.name}
        </button>
        <div className="dim" style={{ fontSize: 11.5, marginTop: 7, lineHeight: 1.45 }}>
          {prestige.available ? (
            <>
              Resets your tower to one floor and your Bytes to zero. You keep every problem
              you have solved, your level, and your Reputation — which would rise to
              {' '}<b style={{ color: 'var(--purple)' }}>×{prestige.newMultiplier.toFixed(2)}</b> on all future Bytes.
            </>
          ) : (
            <>{PRESTIGE.flavour} <b>{prestige.reason}</b></>
          )}
        </div>
      </div>
    </div>
  );
}
