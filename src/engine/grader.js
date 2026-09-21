/**
 * The grader: runs a student's submission against a problem's test cases and
 * turns the outcome into feedback that teaches rather than just judges.
 *
 * The order of checks matters, because the FIRST thing a student reads should
 * be the most useful thing:
 *   1. source rules   (e.g. "this one has to be recursive")
 *   2. crashes        (a syntax error beats a failed assertion every time)
 *   3. failed tests   (with a targeted diagnostic where the problem has one)
 *   4. success        (plus any style warnings, like == on Strings in Java)
 *
 * TEACHERS: the per-problem `diagnostics` list in the problem bank is what
 * makes feedback specific. Everything in this file is the generic machinery
 * around it.
 */

import { runJavaMain, runJavaFunction } from './java/interpreter.js';
import { runPythonProgram, runPythonFunction } from './python/pyodideRunner.js';

/** Encouraging lines for a pass. Picked at random so it doesn't get stale. */
const PRAISE = [
  'Shipped it.',
  'All tests green.',
  'Clean build.',
  'Merged to main.',
  'That is a pass.',
  'Deployed.',
];

/** Gentle lines for a fail. Never sarcastic, never "wrong". */
const ENCOURAGEMENT = [
  'Not quite yet — but you are close enough to debug it.',
  'Almost. One test is still unhappy.',
  'Good attempt. Let us look at what came back.',
  'Nearly there. Check the case below.',
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// ---------------------------------------------------------------------------
// Comparing answers
// ---------------------------------------------------------------------------

/**
 * Normalise printed output before comparing: Windows line endings, trailing
 * spaces on each line, and blank lines at the very end are all forgiven.
 * Capitalisation and everything else is NOT — those are part of the exercise.
 */
export function normalizeOutput(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');
}

/** Deep comparison with a small tolerance for floating-point answers. */
export function valuesMatch(actual, expected) {
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined;
  }
  if (typeof expected === 'number') {
    if (typeof actual !== 'number') return false;
    if (Number.isInteger(expected) && Number.isInteger(actual)) return actual === expected;
    return Math.abs(actual - expected) < 1e-9;
  }
  if (typeof expected === 'boolean' || typeof expected === 'string') {
    return actual === expected;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    return expected.every((e, i) => valuesMatch(actual[i], e));
  }
  if (typeof expected === 'object') {
    if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) return false;
    const ek = Object.keys(expected);
    const ak = Object.keys(actual);
    if (ek.length !== ak.length) return false;
    return ek.every((k) => valuesMatch(actual[k], expected[k]));
  }
  return actual === expected;
}

/**
 * Render a value the way the student's own language would show it, so the
 * expected/actual columns look familiar rather than like JavaScript.
 */
export function describeValue(value, language) {
  const py = language === 'python';
  if (value === null || value === undefined) return py ? 'None' : 'null';
  if (typeof value === 'boolean') return py ? (value ? 'True' : 'False') : String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    const inner = value.map((v) => describeValue(v, language)).join(', ');
    return py ? `[${inner}]` : `{${inner}}`;
  }
  if (typeof value === 'object') {
    return '{' + Object.entries(value)
      .map(([k, v]) => `${py ? `'${k}'` : k}${py ? ': ' : '='}${describeValue(v, language)}`)
      .join(', ') + '}';
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Source rules
// ---------------------------------------------------------------------------

/**
 * Strip comments and string literals so a rule like "no for loops" doesn't
 * trip on the word "for" inside a comment or a printed message.
 */
function stripCommentsAndStrings(source, language) {
  let out = source;
  if (language === 'python') {
    out = out.replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, ' ');
    out = out.replace(/#[^\n]*/g, ' ');
  } else {
    out = out.replace(/\/\*[\s\S]*?\*\//g, ' ');
    out = out.replace(/\/\/[^\n]*/g, ' ');
  }
  out = out.replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  out = out.replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
  return out;
}

/** Returns the first broken rule, or null if the source is acceptable. */
function checkSourceRules(problem, source, language) {
  if (!problem.sourceChecks) return null;
  const cleaned = stripCommentsAndStrings(source, language);
  for (const rule of problem.sourceChecks) {
    if (rule.forbid && new RegExp(rule.forbid).test(cleaned)) return rule.message;
    if (rule.require && !new RegExp(rule.require).test(cleaned)) return rule.message;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Running one test
// ---------------------------------------------------------------------------

async function runOneTest(language, problem, source, test) {
  if (problem.mode === 'function') {
    const args = test.args ?? [];
    if (language === 'python') {
      const r = await runPythonFunction(source, problem.functionName, args, { stdin: test.stdin });
      return { ok: r.ok, output: r.output, result: r.result, error: r.error, errorLine: r.errorLine, warnings: [] };
    }
    const r = runJavaFunction(source, problem.functionName, args, { stdin: test.stdin });
    return {
      ok: r.ok,
      output: r.output,
      result: r.result,
      error: r.error?.message,
      errorLine: r.error?.line,
      warnings: r.warnings || [],
    };
  }

  // stdout mode
  if (language === 'python') {
    const r = await runPythonProgram(source, { stdin: test.stdin });
    return { ok: r.ok, output: r.output, result: undefined, error: r.error, errorLine: r.errorLine, warnings: [] };
  }
  const r = runJavaMain(source, { stdin: test.stdin });
  return {
    ok: r.ok,
    output: r.output,
    result: undefined,
    error: r.error?.message,
    errorLine: r.error?.line,
    warnings: r.warnings || [],
  };
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

/**
 * Find the problem-specific hint that matches what the student actually did.
 * Diagnostics are checked in order, so put the most specific ones first.
 */
function matchDiagnostic(problem, run, testOutcome) {
  if (!problem.diagnostics) return null;

  const trimmedOutput = normalizeOutput(run.output);

  for (const d of problem.diagnostics) {
    if (d.errorContains !== undefined) {
      if (run.error && run.error.toLowerCase().includes(d.errorContains.toLowerCase())) return d.say;
      continue;
    }
    if (run.error) continue; // value-based diagnostics need a value, not a crash

    if (d.resultEquals !== undefined && valuesMatch(testOutcome.actual, d.resultEquals)) return d.say;
    if (d.outputTrimmedEquals !== undefined && trimmedOutput === normalizeOutput(d.outputTrimmedEquals)) return d.say;
    if (d.outputContains !== undefined && trimmedOutput.includes(d.outputContains)) return d.say;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Grade one submission.
 *
 * @param {object}   options
 * @param {'python'|'java'} options.language
 * @param {object}   options.problem  a problem from the bank
 * @param {string}   options.source   the student's code
 * @returns {Promise<{
 *   passed: boolean,
 *   results: Array<object>,
 *   feedback: {tone: 'success'|'error'|'blocked', title: string, message: string},
 *   warnings: string[],
 *   rawOutput: string,
 * }>}
 */
export async function gradeSubmission({ language, problem, source }) {
  // --- 0. empty submission ------------------------------------------------
  if (!source || !source.trim()) {
    return {
      passed: false,
      results: [],
      warnings: [],
      rawOutput: '',
      feedback: {
        tone: 'blocked',
        title: 'Nothing to run',
        message: 'The editor is empty. Write some code and press Run Tests.',
      },
    };
  }

  // --- 1. source rules ----------------------------------------------------
  const broken = checkSourceRules(problem, source, language);
  if (broken) {
    return {
      passed: false,
      results: [],
      warnings: [],
      rawOutput: '',
      feedback: { tone: 'blocked', title: 'Rule for this problem', message: broken },
    };
  }

  // --- 2. run every test --------------------------------------------------
  const results = [];
  const warnings = new Set();
  let firstRun = null;
  let firstFailure = null;

  for (const test of problem.tests) {
    // eslint-disable-next-line no-await-in-loop -- tests must stay in order
    const run = await runOneTest(language, problem, source, test);
    if (!firstRun) firstRun = run;
    (run.warnings || []).forEach((w) => warnings.add(w));

    let passed;
    let actual;
    if (run.error) {
      passed = false;
      actual = undefined;
    } else if (problem.mode === 'function') {
      actual = run.result;
      passed = valuesMatch(actual, test.expected);
    } else {
      actual = normalizeOutput(run.output);
      passed = actual === normalizeOutput(test.expected);
    }

    const outcome = {
      label: test.label || (problem.mode === 'function' ? formatCall(problem, test) : 'program output'),
      hidden: !!test.hidden,
      passed,
      expected: test.expected,
      actual,
      error: run.error || null,
      errorLine: run.errorLine ?? null,
      output: run.output,
    };
    results.push(outcome);

    if (!passed && !firstFailure) firstFailure = { outcome, run };

    // A crash fails everything the same way; no point running the rest.
    if (run.error) {
      for (const remaining of problem.tests.slice(results.length)) {
        results.push({
          label: remaining.label || 'test',
          hidden: !!remaining.hidden,
          passed: false,
          expected: remaining.expected,
          actual: undefined,
          error: run.error,
          errorLine: run.errorLine ?? null,
          output: '',
          skipped: true,
        });
      }
      break;
    }
  }

  const passed = results.length > 0 && results.every((r) => r.passed);
  const rawOutput = firstRun?.output ?? '';

  // --- 3. success ---------------------------------------------------------
  if (passed) {
    return {
      passed: true,
      results,
      warnings: [...warnings],
      rawOutput,
      feedback: {
        tone: 'success',
        title: pick(PRAISE),
        message: results.length === 1
          ? 'The test passed.'
          : `All ${results.length} tests passed.`,
      },
    };
  }

  // --- 4. failure: crash beats a wrong answer -----------------------------
  const { outcome, run } = firstFailure;
  const diagnostic = matchDiagnostic(problem, run, outcome);

  if (run.error) {
    return {
      passed: false,
      results,
      warnings: [...warnings],
      rawOutput,
      feedback: {
        tone: 'error',
        title: run.errorLine ? `Your code stopped on line ${run.errorLine}` : 'Your code could not run',
        message: diagnostic || run.error,
      },
    };
  }

  const detail = problem.mode === 'function'
    ? `For ${outcome.label} I expected ${describeValue(outcome.expected, language)} `
      + `but got ${describeValue(outcome.actual, language)}.`
    : 'The printed output does not match yet — compare them line by line below.';

  return {
    passed: false,
    results,
    warnings: [...warnings],
    rawOutput,
    feedback: {
      tone: 'error',
      title: pick(ENCOURAGEMENT),
      message: diagnostic ? `${detail}\n\n${diagnostic}` : detail,
    },
  };
}

/** "add(2, 3)" — a readable label when a test doesn't provide one. */
function formatCall(problem, test) {
  const args = (test.args ?? []).map((a) => JSON.stringify(a)).join(', ');
  return `${problem.functionName}(${args})`;
}
