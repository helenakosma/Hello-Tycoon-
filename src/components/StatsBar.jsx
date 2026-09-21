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
        <div className="hud-coins" title={`${Math.floor(state.bytes).toLocaleString()} ${CURRENCY.name}`}>
          <Icon name="coin" size={26} label={CURRENCY.name} />
          <div className="hud-coins-text">
            <b>{formatNumber(state.bytes)}</b>
            <span><Icon name="bolt" size={11} /> {formatRate(income)}/s</span>
          </div>
        </div>

        {/* Level and the bar towards the next one. */}
        <div className="hud-level" title={progress.maxed ? 'Max level' : `${progress.into} / ${progress.need} XP`}>
          <div className="hud-level-badge">{progress.level}</div>
          <div className="hud-level-body">
            <span>LEVEL</span>
            <div className="xpbar"><div style={{ width: `${progress.fraction * 100}%` }} /></div>
          </div>
        </div>

        <div className="hud-chips">
          <span className="hud-chip" title="Problems solved">
            <Icon name="check" size={16} /> {solvedCount(state)}
          </span>
          <span className="hud-chip" title="Floors built">
            <Icon name="floors" size={16} /> {state.floors.length}
          </span>
          {state.streak > 0 && (
            <span className="hud-chip is-hot" title={`${state.streak} correct in a row — rewards ×${streakMultiplier(state).toFixed(2)}`}>
              <Icon name="spark" size={16} /> {state.streak}×
            </span>
          )}
          {state.reputation > 0 && (
            <span className="hud-chip is-rep" title={`${PRESTIGE.name} completed: ${state.prestigeCount}`}>
              <Icon name="trophy" size={16} /> {state.reputation}
            </span>
          )}
        </div>

        <div className="hud-spacer" />

        <button
          className="btn btn-small"
          onClick={() => onSwitchLanguage(otherLanguage, switchCost)}
          disabled={!alreadyUnlocked && state.bytes < switchCost}
          title={alreadyUnlocked
            ? `Switch to ${otherLabel}`
            : `Unlock ${otherLabel} for ${formatNumber(switchCost)} ${CURRENCY.name}`}
        >
          {alreadyUnlocked ? otherLabel : <>{otherLabel} <Icon name="coin" size={13} /> {formatNumber(switchCost)}</>}
        </button>

        <button
          className="btn btn-icon"
          onClick={() => dispatch({ type: 'SET_SOUND', value: !state.settings.sound })}
          title={state.settings.sound ? 'Sound on' : 'Sound off'}
          aria-label={state.settings.sound ? 'Turn sound off' : 'Turn sound on'}
        >
          {state.settings.sound ? '♪' : '♪̸'}
        </button>
        <button className="btn btn-icon" onClick={() => setShowAssets(true)} title="Where the art lives">🎨</button>
        <button className="btn btn-icon" onClick={() => setConfirmReset(true)} title="Start over">↺</button>
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
