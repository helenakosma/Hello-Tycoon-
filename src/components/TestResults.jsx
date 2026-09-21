/**
 * The test-results panel.
 *
 * Design rules, because this is the part students read most:
 *   - the verdict comes first, in plain English
 *   - a hidden test shows pass/fail but never its values, so students can't
 *     reverse-engineer an answer from the expected column
 *   - for print-based problems we show expected and actual side by side,
 *     because "spot the difference" is the whole skill being practised
 */

import React from 'react';
import { describeValue } from '../engine/grader.js';
import { FEATURES } from '../data/config.js';

export default function TestResults({ result, language, running }) {
  if (running) {
    return (
      <div className="card results-card">
        <div className="card-head"><span className="card-title">Tests</span></div>
        <div className="results-body">
          <div className="row"><span className="spinner" /> <span className="muted">Running your code…</span></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card results-card">
        <div className="card-head"><span className="card-title">Tests</span></div>
        <div className="results-body muted">
          Write your solution, then press <b>Run Tests</b> (or Ctrl+Enter).
        </div>
      </div>
    );
  }

  const passedCount = result.results.filter((r) => r.passed).length;

  return (
    <div className="card results-card">
      <div className="card-head">
        <span className="card-title">Tests</span>
        {result.results.length > 0 && (
          <span className="mono dim" style={{ fontSize: 12 }}>
            {passedCount}/{result.results.length} passing
          </span>
        )}
      </div>

      <div className="results-body">
        <div className={`verdict ${result.feedback.tone}`}>
          <h4>{result.feedback.title}</h4>
          <p>{result.feedback.message}</p>
        </div>

        {result.results.map((test, i) => (
          <div key={i} className={`test-row ${test.passed ? 'pass' : 'fail'}${test.hidden ? ' hidden-test' : ''}`}>
            <span className="mark">{test.passed ? '✓' : test.skipped ? '–' : '✗'}</span>
            <div className="body">
              <div className="label">{test.hidden ? 'hidden test' : test.label}</div>

              {/* Failed, visible, value-returning test: show both values. */}
              {!test.passed && !test.hidden && !test.error && test.actual !== undefined
                && typeof test.expected !== 'string' && (
                <div className="compare">
                  expected <b>{describeValue(test.expected, language)}</b>
                  {' '}· got <b>{describeValue(test.actual, language)}</b>
                </div>
              )}

              {/* Failed string / stdout test: a side-by-side block reads better. */}
              {!test.passed && !test.hidden && !test.error
                && (typeof test.expected === 'string') && (
                <div className="diffblock">
                  <div>
                    <h5>expected</h5>
                    <pre>{String(test.expected)}</pre>
                  </div>
                  <div>
                    <h5>your output</h5>
                    <pre>{test.actual === undefined || test.actual === ''
                      ? '(nothing)'
                      : String(test.actual)}</pre>
                  </div>
                </div>
              )}

              {test.hidden && !test.passed && !test.error && (
                <div className="compare dim">
                  This one is hidden — it checks an edge case the visible tests do not.
                </div>
              )}
            </div>
          </div>
        ))}

        {result.warnings.map((w, i) => (
          <div className="warning-note" key={i}>Heads up: {w}</div>
        ))}

        {FEATURES.showRawOutput && result.rawOutput && result.rawOutput.trim() !== '' && (
          <div style={{ marginTop: 12 }}>
            <h5 style={{ margin: '0 0 4px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dim)' }}>
              everything your program printed
            </h5>
            <pre style={{
              margin: 0,
              fontFamily: 'var(--mono)',
              fontSize: 12,
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '7px 9px',
              maxHeight: 120,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}>{result.rawOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
