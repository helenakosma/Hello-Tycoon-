/**
 * The problem side: pick a topic, pick a problem, read it, ask for hints.
 *
 * Laid out like a quest board rather than a table — big tappable cards, a coin
 * badge for the reward, stars for difficulty, a tick when it's done.
 *
 * Both the problem list and the prompt can be folded away with the chevron in
 * their corner, which hands all that height to the code editor. That matters
 * on a laptop screen, where the editor is otherwise squeezed into a few lines.
 *
 * Hints are revealed one at a time and never show the answer; the last hint in
 * each problem is written to be the strongest nudge, not the solution.
 */

import React, { useMemo, useState } from 'react';
import Markdown from './Markdown.jsx';
import Icon from './Icon.jsx';
import TIERS from '../data/tiers.js';
import {
  rewardFor, tierStatus, formatNumber, problemsForTier,
} from '../state/selectors.js';

/** ★★☆☆☆ drawn with the pixel star sprites. */
function Stars({ value }) {
  return (
    <span className="stars" data-tip={`Difficulty ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? 'star' : 'star_empty'} size={11} />
      ))}
    </span>
  );
}

/** The fold-away chevron used on both panels. */
function CollapseButton({ collapsed, onToggle, what }) {
  return (
    <button
      className="collapse-btn"
      onClick={onToggle}
      data-tip={collapsed ? `Show ${what}` : `Hide ${what} to make the editor bigger`}
      aria-label={collapsed ? `Show ${what}` : `Hide ${what}`}
      aria-expanded={!collapsed}
    >
      {collapsed ? '▾' : '▴'}
    </button>
  );
}

export default function ProblemPanel({ state, dispatch, problems, problem, hintsShown, onShowHint }) {
  const status = useMemo(
    () => tierStatus(state),
    [state.xp, state.solvedProblemIds.length],
  );
  const firstUnlocked = status.find((s) => s.unlocked)?.tier.id ?? TIERS[0].id;
  const [activeTier, setActiveTier] = useState(problem?.tier ?? firstUnlocked);

  // This save's own order for the topic, so two students differ. See selectors.
  const tierProblems = useMemo(
    () => problemsForTier(state, problems, activeTier),
    [state.seed, problems, activeTier],
  );
  const activeStatus = status.find((s) => s.tier.id === activeTier);

  const listHidden = !!state.settings.hideProblemList;
  const promptHidden = !!state.settings.hidePrompt;
  const setSetting = (key, value) => dispatch({ type: 'SET_SETTING', key, value });

  return (
    <>
      <div className="card">
        <div className="picker-head">
          <div className="tier-tabs">
            {status.map(({ tier, unlocked, reason }) => {
              const solved = problems.filter(
                (p) => p.tier === tier.id && state.solvedProblemIds.includes(p.id),
              ).length;
              const total = problems.filter((p) => p.tier === tier.id).length;
              const done = solved === total && total > 0;
              const active = activeTier === tier.id;
              return (
                <button
                  key={tier.id}
                  className={`tier-tab${active ? ' is-active' : ''}${unlocked ? '' : ' is-locked'}`}
                  onClick={() => { setActiveTier(tier.id); setSetting('hideProblemList', false); }}
                  disabled={!unlocked}
                  data-tip={unlocked ? `${tier.blurb} — ${solved} of ${total} solved` : reason}
                  style={{ '--tab': tier.colour }}
                >
                  {!unlocked && <Icon name="lock" size={13} />}
                  {done && <Icon name="check" size={13} />}
                  <span>{tier.name}</span>
                  <b>{solved}/{total}</b>
                </button>
              );
            })}
          </div>
          <CollapseButton
            collapsed={listHidden}
            onToggle={() => setSetting('hideProblemList', !listHidden)}
            what="the problem list"
          />
        </div>

        {!listHidden && (
          activeStatus && !activeStatus.unlocked ? (
            <div className="locked-note">
              <Icon name="lock" size={22} />
              <div>
                <strong>{activeStatus.tier.name}</strong> is locked.
                <div className="dim">{activeStatus.reason}.</div>
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
                    className={`quest${problem?.id === p.id ? ' is-active' : ''}${solved ? ' is-done' : ''}`}
                    onClick={() => dispatch({ type: 'SELECT_PROBLEM', problemId: p.id })}
                  >
                    <span className="quest-tick">{solved && <Icon name="check" size={16} />}</span>
                    <span className="quest-body">
                      <span className="quest-title">{p.title}</span>
                      <Stars value={p.difficulty} />
                    </span>
                    <span
                      className={`quest-pay${solved ? ' is-done' : ''}`}
                      data-tip={solved ? 'Already solved — a repeat pays a quarter' : 'Bytes for solving this'}
                    >
                      <Icon name="coin" size={14} />
                      {solved ? '¼' : formatNumber(pay.total)}
                    </span>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

      {problem && (
        <div className={`card prompt-card${promptHidden ? ' is-collapsed' : ''}`}>
          <div className="card-head">
            <span className="card-title">{problem.title}</span>
            <span className="row">
              <Stars value={problem.difficulty} />
              <span className="reward-pill" data-tip="Bytes for solving this">
                <Icon name="coin" size={13} /> {formatNumber(rewardFor(state, problem).total)}
              </span>
              <button
                className="btn btn-small"
                onClick={() => { setSetting('hidePrompt', false); onShowHint(); }}
                disabled={hintsShown >= problem.hints.length}
                data-tip="One nudge at a time — never the answer"
              >
                {hintsShown === 0 ? 'Hint' : hintsShown >= problem.hints.length ? 'No more hints' : 'Another hint'}
              </button>
              <CollapseButton
                collapsed={promptHidden}
                onToggle={() => setSetting('hidePrompt', !promptHidden)}
                what="the question"
              />
            </span>
          </div>

          {!promptHidden && (
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
          )}
        </div>
      )}
    </>
  );
}
