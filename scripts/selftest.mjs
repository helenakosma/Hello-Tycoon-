/**
 * ============================================================================
 * npm test  —  run this after you add or edit problems
 * ============================================================================
 *
 * It checks four things:
 *
 *   1. STRUCTURE    every problem has the fields the game needs, ids are
 *                   unique, tiers exist, difficulties are in range
 *   2. SOLVABLE     a known-good solution passes every test case, so a typo
 *                   in an `expected` value can't quietly ship
 *   3. NOT FREE     the starter code does NOT pass on its own
 *   4. ENGINE       the Java interpreter still gets Java's semantics right
 *
 * Step 2 needs a reference solution. Yours live in scripts/fixtures/. If you
 * add a problem without one, the test reports it as "no reference solution"
 * — a warning, not a failure, so you aren't blocked.
 *
 * The Python half of step 2 runs your real local Python if you have one
 * installed; if not, it is skipped with a note.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import javaProblems from '../src/data/problems/java.js';
import pythonProblems from '../src/data/problems/python.js';
import TIERS from '../src/data/tiers.js';
import FLOORS from '../src/data/floors.js';
import ROOMS from '../src/data/rooms.js';
import ITEMS from '../src/data/items.js';
import { BONUS_TYPES } from '../src/data/config.js';
import { gradeSubmission, normalizeOutput, valuesMatch } from '../src/engine/grader.js';
import { runEngineTests } from './engine-tests.mjs';

import javaSolutions from './fixtures/java-solutions.mjs';
import pythonSolutions from './fixtures/python-solutions.mjs';

const problems = { java: javaProblems, python: pythonProblems };
const solutions = { java: javaSolutions, python: pythonSolutions };

const errors = [];
const warnings = [];
let checks = 0;

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ---------------------------------------------------------------------------
// 1. Structure
// ---------------------------------------------------------------------------

const tierIds = new Set(TIERS.map((t) => t.id));
const roomIds = new Set(ROOMS.map((r) => r.id));

for (const [language, bank] of Object.entries(problems)) {
  const seen = new Set();
  for (const p of bank) {
    checks++;
    const where = `${language}/${p.id || '(no id)'}`;
    if (!p.id) fail(`${where}: missing id`);
    if (seen.has(p.id)) fail(`${where}: duplicate id`);
    seen.add(p.id);
    if (!tierIds.has(p.tier)) fail(`${where}: tier "${p.tier}" is not in tiers.js`);
    if (!p.title) fail(`${where}: missing title`);
    if (!p.prompt) fail(`${where}: missing prompt`);
    if (!p.starterCode) fail(`${where}: missing starterCode`);
    if (!['function', 'stdout'].includes(p.mode)) fail(`${where}: mode must be "function" or "stdout"`);
    if (p.mode === 'function' && !p.functionName) fail(`${where}: function mode needs functionName`);
    if (!p.tests?.length) fail(`${where}: no test cases`);
    if (!(p.difficulty >= 1 && p.difficulty <= 5)) fail(`${where}: difficulty must be 1-5`);
    if (!p.hints || p.hints.length < 2) warn(`${where}: fewer than 2 hints`);
    for (const t of p.tests || []) {
      if (t.expected === undefined) fail(`${where}: a test case has no "expected" value`);
      if (p.mode === 'function' && !Array.isArray(t.args)) fail(`${where}: a test case has no "args" array`);
    }
    for (const d of p.diagnostics || []) {
      if (!d.say) fail(`${where}: a diagnostic has no "say" message`);
    }
  }
}

// Both banks should cover the same tiers, so switching language is fair.
for (const tier of TIERS) {
  const j = javaProblems.filter((p) => p.tier === tier.id).length;
  const y = pythonProblems.filter((p) => p.tier === tier.id).length;
  checks++;
  if (j === 0 || y === 0) warn(`tier "${tier.id}" has ${j} Java and ${y} Python problems`);
}

// Floors / rooms / items must line up.
for (const floor of FLOORS) {
  checks++;
  if (!roomIds.has(floor.roomType)) fail(`floors.js: floor ${floor.level} uses unknown roomType "${floor.roomType}"`);
  if (!ITEMS[floor.roomType]?.length) warn(`items.js: room type "${floor.roomType}" has no upgrade lines`);
}
const lineIds = new Set();
for (const [roomType, lines] of Object.entries(ITEMS)) {
  if (!roomIds.has(roomType)) fail(`items.js: "${roomType}" is not a room in rooms.js`);
  for (const line of lines) {
    checks++;
    if (lineIds.has(line.id)) fail(`items.js: duplicate upgrade line id "${line.id}"`);
    lineIds.add(line.id);
    if (!line.sprite) fail(`items.js: "${line.id}" has no sprite key`);
    if (!line.tiers?.length) fail(`items.js: "${line.id}" has no tiers`);
    if (line.tiers?.[0]?.cost !== 0) fail(`items.js: "${line.id}" tier 1 must cost 0 (it comes with the room)`);
    line.tiers?.forEach((tier, i) => {
      if (!BONUS_TYPES[tier.bonus?.type]) fail(`items.js: "${line.id}" tier ${i + 1} has unknown bonus type "${tier.bonus?.type}"`);
      if (i > 0 && !(tier.cost > line.tiers[i - 1].cost)) fail(`items.js: "${line.id}" tier ${i + 1} is not more expensive than tier ${i}`);
    });
  }
}
// Floor requirements must be reachable with the problems that exist.
const smallestBank = Math.min(javaProblems.length, pythonProblems.length);
for (const floor of FLOORS) {
  checks++;
  if (floor.requiresProblems > smallestBank) {
    fail(`floors.js: floor ${floor.level} needs ${floor.requiresProblems} solved problems, but the smallest bank only has ${smallestBank}`);
  }
}
for (const tier of TIERS) {
  checks++;
  if (tier.requiresProblems > smallestBank) {
    fail(`tiers.js: tier "${tier.id}" needs ${tier.requiresProblems} solved problems, but the smallest bank only has ${smallestBank}`);
  }
}

// ---------------------------------------------------------------------------
// 2 + 3. Java: reference solutions pass, starter code does not
// ---------------------------------------------------------------------------

for (const p of javaProblems) {
  const source = javaSolutions[p.id];
  if (!source) { warn(`java/${p.id}: no reference solution in scripts/fixtures/java-solutions.mjs`); continue; }
  checks++;
  const graded = await gradeSubmission({ language: 'java', problem: p, source });
  if (!graded.passed) {
    fail(`java/${p.id} "${p.title}": the reference solution FAILS — ${graded.feedback.message.split('\n')[0]}`);
  }
  const starter = await gradeSubmission({ language: 'java', problem: p, source: p.starterCode });
  checks++;
  if (starter.passed) fail(`java/${p.id}: the starter code already passes, so the problem is free`);
}

// ---------------------------------------------------------------------------
// 2 + 3. Python: same, using a local Python if one is installed
// ---------------------------------------------------------------------------

function localPython() {
  for (const candidate of ['python', 'python3', 'py']) {
    try {
      const out = execFileSync(candidate, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      if (/Python 3/.test(out)) return candidate;
    } catch { /* try the next one */ }
  }
  return null;
}

const python = localPython();
if (!python) {
  warn('No local Python 3 found, so the Python problem bank was only checked for structure. '
    + 'Install Python (or run this on a machine that has it) to verify its reference solutions.');
} else {
  const harness = fileURLToPath(new URL('./fixtures/pyharness.py', import.meta.url));
  const payloadPath = fileURLToPath(new URL('./fixtures/.selftest-payload.json', import.meta.url));

  const runCases = (cases) => {
    writeFileSync(payloadPath, JSON.stringify(cases), 'utf8');
    const raw = execFileSync(python, [harness, payloadPath], { encoding: 'utf8', maxBuffer: 32e6 });
    return JSON.parse(raw);
  };

  // Reference solutions, one entry per (problem, test).
  const cases = [];
  const index = [];
  for (const p of pythonProblems) {
    const source = pythonSolutions[p.id];
    if (!source) { warn(`python/${p.id}: no reference solution in scripts/fixtures/python-solutions.mjs`); continue; }
    p.tests.forEach((t, ti) => {
      cases.push({ id: `${p.id}#${ti}`, source, mode: p.mode, functionName: p.functionName || '', args: t.args || [] });
      index.push({ p, t, ti });
    });
  }

  runCases(cases).forEach((r, i) => {
    const { p, t, ti } = index[i];
    checks++;
    if (!r.ok) {
      fail(`python/${p.id} test#${ti}: the reference solution crashed — ${r.error}`);
      return;
    }
    const ok = p.mode === 'function'
      ? valuesMatch(r.result, t.expected)
      : normalizeOutput(r.output) === normalizeOutput(t.expected);
    if (!ok) {
      fail(`python/${p.id} "${t.label || `test#${ti}`}": expected ${JSON.stringify(t.expected)}, got `
        + JSON.stringify(p.mode === 'function' ? r.result : normalizeOutput(r.output)));
    }
  });

  // Starter code must not already pass.
  const starterCases = pythonProblems.map((p) => ({
    id: p.id, source: p.starterCode, mode: p.mode,
    functionName: p.functionName || '', args: p.tests[0].args || [],
  }));
  runCases(starterCases).forEach((r, i) => {
    const p = pythonProblems[i];
    const t = p.tests[0];
    checks++;
    if (!r.ok) return;
    const ok = p.mode === 'function'
      ? valuesMatch(r.result, t.expected)
      : normalizeOutput(r.output) === normalizeOutput(t.expected);
    if (ok) fail(`python/${p.id}: the starter code already passes, so the problem is free`);
  });

  if (existsSync(payloadPath)) unlinkSync(payloadPath);
}

// ---------------------------------------------------------------------------
// 4. Java engine semantics
// ---------------------------------------------------------------------------

const engine = runEngineTests();
checks += engine.pass + engine.failures.length;
engine.failures.forEach((f) => fail(`java engine: ${f}`));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('');
console.log(`Java problems:    ${javaProblems.length}`);
console.log(`Python problems:  ${pythonProblems.length}`);
console.log(`Tiers / floors:   ${TIERS.length} / ${FLOORS.length}`);
console.log(`Checks run:       ${checks}`);
console.log('');

if (warnings.length) {
  console.log(`${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  warnings.forEach((w) => console.log('  - ' + w));
  console.log('');
}

if (errors.length) {
  console.log(`${errors.length} problem${errors.length === 1 ? '' : 's'} to fix:`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('');
  process.exit(1);
}

console.log('All checks passed. Your problem bank is good to go.');
