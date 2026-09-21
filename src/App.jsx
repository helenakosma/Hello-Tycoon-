/**
 * Hello, Tycoon! — the top-level screen.
 *
 * Holds the two things that are genuinely per-session rather than per-save:
 * the result of the last test run, and how many hints are showing. Everything
 * durable lives in the game store (src/state/gameStore.jsx).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGame } from './state/gameStore.jsx';
import { gradeSubmission } from './engine/grader.js';
import { loadPython } from './engine/python/pyodideRunner.js';
import { tierStatus, formatNumber } from './state/selectors.js';

import javaProblems from './data/problems/java.js';
import pythonProblems from './data/problems/python.js';
import { isStorageAvailable } from './state/persistence.js';

import LanguagePicker from './components/LanguagePicker.jsx';
import StatsBar from './components/StatsBar.jsx';
import ProblemPanel from './components/ProblemPanel.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import TestResults from './components/TestResults.jsx';
import Tower from './components/Tower.jsx';
import RoomPanel from './components/RoomPanel.jsx';
import Toasts from './components/Toasts.jsx';
import { playBuild, playCorrect, playIncorrect, playPurchase } from './components/sfx.js';

const BANKS = { java: javaProblems, python: pythonProblems };

export default function App() {
  const { state, dispatch } = useGame();

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [hintCounts, setHintCounts] = useState({});
  const [pythonStage, setPythonStage] = useState(null);

  const problems = BANKS[state.language] || [];

  // --- which problem is on screen ----------------------------------------
  const problem = useMemo(() => {
    const chosen = problems.find((p) => p.id === state.currentProblemId);
    if (chosen) return chosen;
    // Default to the first unsolved problem in an unlocked tier.
    const unlocked = new Set(tierStatus(state).filter((s) => s.unlocked).map((s) => s.tier.id));
    return problems.find((p) => unlocked.has(p.tier) && !state.solvedProblemIds.includes(p.id))
      || problems.find((p) => unlocked.has(p.tier))
      || problems[0]
      || null;
  }, [problems, state.currentProblemId, state.solvedProblemIds, state.xp]);

  const source = problem
    ? (state.drafts[problem.id] ?? problem.starterCode)
    : '';

  /** The next unsolved problem in an unlocked tier, for the "Next" button. */
  const nextProblem = useMemo(() => {
    if (!problem) return null;
    const unlocked = new Set(tierStatus(state).filter((s) => s.unlocked).map((s) => s.tier.id));
    return problems.find(
      (p) => p.id !== problem.id && unlocked.has(p.tier) && !state.solvedProblemIds.includes(p.id),
    ) || null;
  }, [problems, problem, state.solvedProblemIds, state.xp]);

  const goToNextProblem = () => {
    if (nextProblem) dispatch({ type: 'SELECT_PROBLEM', problemId: nextProblem.id });
  };

  // Clear the previous run's results when the student moves to a new problem.
  useEffect(() => { setResult(null); }, [problem?.id]);

  // --- start downloading Python as soon as it's the chosen language -------
  useEffect(() => {
    if (state.language !== 'python') return;
    setPythonStage('Downloading Python…');
    loadPython((stage) => setPythonStage(stage))
      .then(() => setPythonStage('ready'))
      .catch((err) => setPythonStage(err.message));
  }, [state.language]);

  // --- actions ------------------------------------------------------------
  const setSource = useCallback((next) => {
    if (!problem) return;
    dispatch({ type: 'SAVE_DRAFT', problemId: problem.id, source: next });
  }, [dispatch, problem]);

  const runTests = useCallback(async () => {
    if (!problem || running) return;
    setRunning(true);
    try {
      const graded = await gradeSubmission({ language: state.language, problem, source });
      setResult(graded);

      if (graded.passed) {
        dispatch({ type: 'SOLVE', problem });
        // Pin the student to the problem they just solved. Without this the
        // "first unsolved problem" default would yank the editor to the next
        // problem the instant they succeed, before they've read the result.
        dispatch({ type: 'SELECT_PROBLEM', problemId: problem.id });
        playCorrect(state.settings.sound);
      } else {
        dispatch({ type: 'FAIL_ATTEMPT', problemId: problem.id });
        playIncorrect(state.settings.sound);
      }
    } catch (err) {
      // A crash in the grader itself should still say something useful.
      setResult({
        passed: false,
        results: [],
        warnings: [],
        rawOutput: '',
        feedback: {
          tone: 'blocked',
          title: 'The tester hit a problem',
          message: String(err?.message || err),
        },
      });
    } finally {
      setRunning(false);
    }
  }, [problem, running, source, state.language, state.settings.sound, dispatch]);

  const showHint = () => {
    if (!problem) return;
    setHintCounts((prev) => ({
      ...prev,
      [problem.id]: Math.min((prev[problem.id] || 0) + 1, problem.hints.length),
    }));
  };

  const resetCode = () => {
    if (!problem) return;
    dispatch({ type: 'RESET_DRAFT', problemId: problem.id });
    setResult(null);
  };

  const buyItem = (floorIndex, lineId) => {
    dispatch({ type: 'BUY_ITEM', floorIndex, lineId });
    playPurchase(state.settings.sound);
  };

  const buildFloor = () => {
    dispatch({ type: 'BUILD_FLOOR' });
    playBuild(state.settings.sound);
  };

  const switchLanguage = (language, cost) => {
    if (state.bytes < cost) return;
    dispatch({ type: 'SWITCH_LANGUAGE', language });
    setResult(null);
  };

  // --- the coin pop after a correct answer --------------------------------
  useEffect(() => {
    if (!state.lastSolve) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_SOLVE_FLASH' }), 1300);
    return () => clearTimeout(timer);
  }, [state.lastSolve, dispatch]);

  // --- first screen -------------------------------------------------------
  if (!state.language) {
    return <LanguagePicker onChoose={(language) => dispatch({ type: 'CHOOSE_LANGUAGE', language })} />;
  }

  const pythonBusy = state.language === 'python' && pythonStage && pythonStage !== 'ready';
  const pythonFailed = pythonBusy && !pythonStage.endsWith('…');
  const errorLine = result?.results?.find((r) => r.errorLine)?.errorLine ?? null;

  return (
    <div className="app">
      <StatsBar state={state} dispatch={dispatch} onSwitchLanguage={switchLanguage} />

      <div className="split">
        {/* ------------------------------ code side ------------------------ */}
        <div className="pane code-pane">
          {!isStorageAvailable() && (
            <div className="loading-banner" style={{ background: '#f5744d14', borderColor: '#f5744d44', color: 'var(--red)' }}>
              This browser is blocking saved data, so your progress will disappear when you
              close the tab. A normal (not private) window fixes it.
            </div>
          )}

          {pythonBusy && (
            <div
              className="loading-banner"
              style={pythonFailed ? { background: '#f5744d14', borderColor: '#f5744d44', color: 'var(--red)' } : undefined}
            >
              {!pythonFailed && <span className="spinner" />}
              <span>{pythonStage}{!pythonFailed && ' You can read the problem while this finishes.'}</span>
            </div>
          )}

          <ProblemPanel
            state={state}
            dispatch={dispatch}
            problems={problems}
            problem={problem}
            hintsShown={hintCounts[problem?.id] || 0}
            onShowHint={showHint}
          />

          <div className="card editor-card">
            <div className="card-head">
              <span className="card-title">
                {state.language === 'python' ? 'solution.py' : 'Main.java'}
              </span>
              <span className="dim" style={{ fontSize: 11.5 }}>
                Tab indents · Ctrl+Enter runs
              </span>
            </div>

            <CodeEditor
              value={source}
              onChange={setSource}
              language={state.language}
              errorLine={errorLine}
              onRun={runTests}
            />

            <div className="editor-actions">
              <button
                className="btn btn-primary"
                onClick={runTests}
                disabled={running || pythonBusy}
              >
                {running ? 'Running…' : 'Run Tests'}
              </button>
              <button className="btn btn-ghost" onClick={resetCode}>Reset code</button>

              {/* Appears once solved, so moving on is the student's choice. */}
              {nextProblem && problem && state.solvedProblemIds.includes(problem.id) && (
                <button className="btn" onClick={goToNextProblem}>
                  Next problem: {nextProblem.title} →
                </button>
              )}

              <div className="grow" />
              {problem && state.solvedProblemIds.includes(problem.id) && (
                <span className="dim" style={{ fontSize: 12 }}>
                  ✓ solved — running it again pays a small practice reward
                </span>
              )}
            </div>
          </div>

          <TestResults result={result} language={state.language} running={running} />
        </div>

        {/* ------------------------------ tower side ----------------------- */}
        <div className="pane" style={{ position: 'relative' }}>
          {state.lastSolve && (
            <div className="coinpop">+{formatNumber(state.lastSolve.amount)}</div>
          )}
          <Tower state={state} dispatch={dispatch} onBuild={buildFloor} />
          <RoomPanel
            state={state}
            onBuy={buyItem}
            onPrestige={() => dispatch({ type: 'PRESTIGE' })}
          />
        </div>
      </div>

      <Toasts toasts={state.toasts} dispatch={dispatch} />
    </div>
  );
}
