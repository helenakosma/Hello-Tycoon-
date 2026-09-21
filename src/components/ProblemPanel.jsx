/**
 * The problem side: pick a tier, pick a problem, read the prompt, ask for hints.
 *
 * Hints are revealed one at a time and never show the answer — the last hint
 * in each problem is written to be the strongest nudge, not the solution.
 */

import React, { useMemo, useState } from 'react';
import Markdown from './Markdown.jsx';
import TIERS from '../data/tiers.js';
import { CURRENCY } from '../data/config.js';
import { formatNumber, rewardFor, tierStatus } from '../state/selectors.js';

/** ★★☆☆☆ for difficulty 2. */
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function ProblemPanel({ state, dispatch, problems, problem, hintsShown, onShowHint }) {
  const status = useMemo(() => tierStatus(state), [state.xp, state.solvedProblemIds.length]);
  const firstUnlockedTier = status.find((s) => s.unlocked)?.tier.id ?? TIERS[0].id;
  const [activeTier, setActiveTier] = useState(problem?.tier ?? firstUnlockedTier);

  const tierProblems = problems.filter((p) => p.tier === activeTier);
  const activeStatus = status.find((s) => s.tier.id === activeTier);

  return (
    <>
      <div className="card">
        <div className="picker">
          {status.map(({ tier, unlocked, reason }) => {
            const solvedInTier = problems
              .filter((p) => p.tier === tier.id && state.solvedProblemIds.includes(p.id)).length;
            const totalInTier = problems.filter((p) => p.tier === tier.id).length;
            return (
              <button
                key={tier.id}
                className={`tier-chip${activeTier === tier.id ? ' is-active' : ''}`}
                onClick={() => setActiveTier(tier.id)}
                disabled={!unlocked}
                title={unlocked ? tier.blurb : reason}
                style={activeTier === tier.id ? { borderColor: tier.colour } : undefined}
              >
                {unlocked ? '' : '🔒 '}{tier.name}
                <span className="dim"> {solvedInTier}/{totalInTier}</span>
              </button>
            );
          })}
        </div>

        {activeStatus && !activeStatus.unlocked ? (
          <div style={{ padding: 16 }} className="muted">
            <strong>{activeStatus.tier.name}</strong> is locked. {activeStatus.reason}.
            <div className="dim" style={{ marginTop: 6, fontSize: 12.5 }}>
              Both conditions exist on purpose: solving problems raises your level, and your
              level is what opens the next topic.
            </div>
          </div>
        ) : (
          <div className="problem-list">
            {tierProblems.map((p) => {
              const solved = state.solvedProblemIds.includes(p.id);
              const pay = rewardFor(state, p);
              return (
                <button
                  key={p.id}
                  className={`problem-row${problem?.id === p.id ? ' is-active' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_PROBLEM', problemId: p.id })}
                >
                  <span className="tick">{solved ? '✓' : ''}</span>
                  <span className="title">
                    {p.title}
                    <span className="difficulty"> {stars(p.difficulty)}</span>
                  </span>
                  <span className="pay">
                    {solved ? <span className="dim">practice</span>
                      : `+${formatNumber(pay.total)} ${CURRENCY.symbol}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {problem && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '0 1 auto', maxHeight: '32vh' }}>
          <div className="card-head">
            <span className="card-title">{problem.title}</span>
            <span className="row">
              <span className="difficulty">{stars(problem.difficulty)}</span>
              <span className="mono" style={{ color: 'var(--gold)', fontSize: 12 }}>
                +{formatNumber(rewardFor(state, problem).total)} {CURRENCY.symbol}
              </span>
              <button
                className="btn btn-ghost"
                onClick={onShowHint}
                disabled={hintsShown >= problem.hints.length}
              >
                {hintsShown === 0 ? 'Hint' : hintsShown >= problem.hints.length ? 'No more hints' : 'Another hint'}
              </button>
            </span>
          </div>

          <div className="prompt-body">
            <Markdown text={problem.prompt} />

            {hintsShown > 0 && (
              <div className="hint-box">
                <h4>{hintsShown === 1 ? 'Hint' : `Hints (${hintsShown})`}</h4>
                <ol>
                  {problem.hints.slice(0, hintsShown).map((h, i) => (
                    <li key={i}><Markdown text={h} /></li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
