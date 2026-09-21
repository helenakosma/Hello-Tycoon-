/**
 * The persistent stats bar across the top: Bytes, income, solved, level,
 * floors, streak — plus the sound toggle and the help/reset menu.
 */

import React, { useState } from 'react';
import { CURRENCY, FEATURES, PRESTIGE } from '../data/config.js';
import ROOMS from '../data/rooms.js';
import ITEMS from '../data/items.js';
import { expectedAssetFilenames, ASSET_MODE } from '../data/assets.js';
import {
  formatNumber, formatRate, incomePerSecond, levelProgress, solvedCount, streakMultiplier,
} from '../state/selectors.js';

function Stat({ label, value, className = '', children, title }) {
  return (
    <div className={`stat ${className}`} title={title}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {children}
    </div>
  );
}

/** Lists the exact PNG filenames an artist would need to supply. */
function AssetManifest({ onClose }) {
  const rows = expectedAssetFilenames(ROOMS, ITEMS);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Pixel art filenames</h3>
        <p>
          Drop PNGs into <code>public/assets/</code> with these exact names, then change
          {' '}<code>ASSET_MODE</code> in <code>src/data/assets.js</code> from
          {' '}<code>&apos;{ASSET_MODE}&apos;</code> to <code>&apos;auto&apos;</code>.
          Any file that is missing simply keeps its coloured placeholder, so you can convert
          one room at a time.
        </p>
        <table>
          <thead>
            <tr><th>File</th><th>What it is</th></tr>
          </thead>
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
  const streakMult = streakMultiplier(state);
  const otherLanguage = state.language === 'python' ? 'java' : 'python';
  const otherLabel = otherLanguage === 'python' ? 'Python' : 'Java';
  const alreadyUnlocked = state.unlockedLanguages.includes(otherLanguage);
  const switchCost = alreadyUnlocked ? 0 : FEATURES.languageSwitchCost;

  return (
    <>
      <div className="statsbar">
        <div className="brand">Hello, <span>Tycoon!</span></div>

        <Stat
          className="is-money"
          label={CURRENCY.name}
          value={`${formatNumber(state.bytes)} ${CURRENCY.symbol}`}
          title={`${Math.floor(state.bytes).toLocaleString()} ${CURRENCY.name}`}
        />
        <Stat
          className="is-income"
          label="per sec"
          value={`+${formatRate(income)}`}
          title="Passive income from your tower"
        />
        <Stat label="solved" value={solvedCount(state)} title="Problems solved (kept through a Series B)" />
        <Stat label="floors" value={state.floors.length} />
        <Stat
          label={progress.maxed ? 'max level' : `${progress.into}/${progress.need} xp`}
          value={`Lv ${progress.level}`}
        >
          <div className="xpbar"><div style={{ width: `${progress.fraction * 100}%` }} /></div>
        </Stat>

        {state.streak > 0 && (
          <Stat
            className="is-streak"
            label="streak"
            value={`${state.streak}× (${streakMult.toFixed(2)}×)`}
            title="Consecutive correct answers. Resets only when an answer is wrong."
          />
        )}
        {state.reputation > 0 && (
          <Stat
            className="is-streak"
            label="reputation"
            value={state.reputation}
            title={`${PRESTIGE.name} rounds completed: ${state.prestigeCount}`}
          />
        )}

        <div className="statsbar-spacer" />

        {/* Stretch goal: buy your way into the other language. */}
        <button
          className="btn btn-ghost"
          onClick={() => onSwitchLanguage(otherLanguage, switchCost)}
          disabled={!alreadyUnlocked && state.bytes < switchCost}
          title={alreadyUnlocked
            ? `Switch to ${otherLabel} (already unlocked)`
            : `Unlock ${otherLabel} for ${formatNumber(switchCost)} ${CURRENCY.name}`}
        >
          {alreadyUnlocked
            ? `Switch to ${otherLabel}`
            : `Unlock ${otherLabel} · ${formatNumber(switchCost)} ${CURRENCY.symbol}`}
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'SET_SOUND', value: !state.settings.sound })}
          title={state.settings.sound ? 'Sound on' : 'Sound off'}
          aria-label={state.settings.sound ? 'Turn sound off' : 'Turn sound on'}
        >
          {state.settings.sound ? '♪' : '✕♪'}
        </button>

        <button className="btn btn-ghost" onClick={() => setShowAssets(true)} title="Pixel art filenames">
          art
        </button>

        <button className="btn btn-ghost" onClick={() => setConfirmReset(true)} title="Erase this save and start over">
          reset
        </button>
      </div>

      {showAssets && <AssetManifest onClose={() => setShowAssets(false)} />}

      {confirmReset && (
        <div className="modal-backdrop" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Start over?</h3>
            <p>
              This erases everything saved in this browser: your Bytes, your tower, and the
              record of which problems you have solved. It cannot be undone.
            </p>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button
                className="btn"
                style={{ background: '#f5744d22', borderColor: '#f5744d66', color: 'var(--red)' }}
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
