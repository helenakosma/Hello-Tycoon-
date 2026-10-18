/**
 * The HUD across the top.
 *
 * Deliberately arranged by importance rather than as a row of equal readouts:
 * Bytes is the number you care about, so it gets a big gold pill; everything
 * else is a small chip you can glance at. The uppercase micro-labels that make
 * dashboards feel like dashboards are gone — the icons say what things are.
 */

import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { CURRENCY, FEATURES, PRESTIGE } from '../data/config.js';
import ROOMS from '../data/rooms.js';
import ITEMS from '../data/items.js';
import { expectedAssetFilenames } from '../data/assets.js';
import {
  formatNumber, formatRate, incomePerSecond, levelProgress, solvedCount, streakMultiplier,
} from '../state/selectors.js';

/** Lists the PNG filenames the game looks for, for anyone redrawing the art. */
function AssetManifest({ onClose }) {
  const rows = expectedAssetFilenames(ROOMS, ITEMS);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Where the art lives</h3>
        <p>
          Every sprite below is an ordinary PNG in <code>public/assets/</code>. Open one in any
          pixel editor, paint over it, save, refresh. Delete one and the game falls back to a
          coloured box, so nothing can break.
        </p>
        <table>
          <thead><tr><th>File</th><th>What it is</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.spriteKey}>
                <td className="mono">{r.path.replace('./assets/', '')}</td>
                <td className="dim">{r.describes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function StatsBar({ state, dispatch, onSwitchLanguage }) {
  const [showAssets, setShowAssets] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const progress = levelProgress(state.xp);
  const income = incomePerSecond(state);
  const otherLanguage = state.language === 'python' ? 'java' : 'python';
  const otherLabel = otherLanguage === 'python' ? 'Python' : 'Java';
  const alreadyUnlocked = state.unlockedLanguages.includes(otherLanguage);
  const switchCost = alreadyUnlocked ? 0 : FEATURES.languageSwitchCost;

  return (
    <>
      <div className="hud">
        <div className="hud-brand">Hello,<br /><span>Tycoon!</span></div>

        {/* The number that matters, front and centre. */}
        <div
          className="hud-coins"
          data-tip={`${Math.floor(state.bytes).toLocaleString()} ${CURRENCY.name} — spend them on machines and new floors`}
        >
          <Icon name="coin" size={26} label={CURRENCY.name} />
          <div className="hud-coins-text">
            <b>{formatNumber(state.bytes)}</b>
            <span><Icon name="bolt" size={11} /> {formatRate(income)}/s</span>
          </div>
        </div>

        {/* Level and the bar towards the next one. */}
        <div
          className="hud-level"
          data-tip={progress.maxed
            ? 'Max level reached'
            : `Level ${progress.level} — ${progress.into} of ${progress.need} XP to the next one. Levels come only from solving problems, and they unlock new topics.`}
        >
          <div className="hud-level-badge">{progress.level}</div>
          <div className="hud-level-body">
            <span>LEVEL</span>
            <div className="xpbar"><div style={{ width: `${progress.fraction * 100}%` }} /></div>
          </div>
        </div>

        <div className="hud-chips">
          <span className="hud-chip" data-tip="Problems you have solved. New floors need a minimum number of these, so you cannot idle your way up.">
            <Icon name="check" size={16} /> {solvedCount(state)}
          </span>
          <span className="hud-chip" data-tip="Floors in your tower">
            <Icon name="floors" size={16} /> {state.floors.length}
          </span>
          {state.streak > 0 && (
            <span className="hud-chip is-hot" data-tip={`${state.streak} correct in a row — every Byte is worth ×${streakMultiplier(state).toFixed(2)}. Only a wrong answer resets it, never a slow one.`}>
              <Icon name="spark" size={16} /> {state.streak}×
            </span>
          )}
          {state.reputation > 0 && (
            <span className="hud-chip is-rep" data-tip={`Reputation from ${state.prestigeCount} ${PRESTIGE.name} round${state.prestigeCount === 1 ? '' : 's'} — it multiplies everything you earn, forever.`}>
              <Icon name="trophy" size={16} /> {state.reputation}
            </span>
          )}
        </div>

        <div className="hud-spacer" />

        <button
          className="btn btn-small"
          onClick={() => onSwitchLanguage(otherLanguage, switchCost)}
          disabled={!alreadyUnlocked && state.bytes < switchCost}
          data-tip={alreadyUnlocked
            ? `Switch to ${otherLabel} — your Bytes, tower and level all carry over`
            : `Unlock ${otherLabel} for ${formatNumber(switchCost)} ${CURRENCY.name}. Everything you have built carries over.`}
        >
          {alreadyUnlocked ? otherLabel : <>{otherLabel} <Icon name="coin" size={13} /> {formatNumber(switchCost)}</>}
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_SOUND', value: !state.settings.sound })}
          className="btn btn-icon tip-left"
          data-tip={state.settings.sound ? 'Sound is on — click to mute' : 'Sound is off — click to unmute'}
          aria-label={state.settings.sound ? 'Turn sound off' : 'Turn sound on'}
        >
          {state.settings.sound ? '♪' : '♪̸'}
        </button>
        <button
          className="btn btn-icon tip-left"
          onClick={() => setShowAssets(true)}
          data-tip="Show every pixel-art file and what it is"
        >🎨</button>
        <button
          className="btn btn-icon tip-left"
          onClick={() => setConfirmReset(true)}
          data-tip="Erase this save and start over"
        >↺</button>
      </div>

      {showAssets && <AssetManifest onClose={() => setShowAssets(false)} />}

      {confirmReset && (
        <div className="modal-backdrop" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Start over?</h3>
            <p>
              This erases your Bytes, your tower, and every problem you have solved on this
              computer. It cannot be undone.
            </p>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { dispatch({ type: 'HARD_RESET' }); setConfirmReset(false); }}
              >
                Erase everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
