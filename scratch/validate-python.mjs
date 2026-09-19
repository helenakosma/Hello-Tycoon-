import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import problems from '../src/data/problems/python.js';
import solutions from './solutions-python.mjs';
import TIERS from '../src/data/tiers.js';
import { normalizeOutput, valuesMatch } from '../src/engine/grader.js';

const tierIds = new Set(TIERS.map((t) => t.id));
let bad = 0;

console.log('Python bank: ' + problems.length + ' problems');

// --- structural checks -----------------------------------------------------
const seen = new Set();
for (const p of problems) {
  const issues = [];
  if (seen.has(p.id)) issues.push('duplicate id');
  seen.add(p.id);
  if (!tierIds.has(p.tier)) issues.push('unknown tier ' + p.tier);
  if (!p.title || !p.prompt) issues.push('missing title/prompt');
  if (!p.starterCode) issues.push('missing starterCode');
  if (!p.tests || !p.tests.length) issues.push('no tests');
  if (p.mode === 'function' && !p.functionName) issues.push('function mode without functionName');
  if (!['function', 'stdout'].includes(p.mode)) issues.push('bad mode');
  if (!p.hints || p.hints.length < 2) issues.push('fewer than 2 hints');
  if (p.difficulty < 1 || p.difficulty > 5) issues.push('difficulty out of range');
  if (issues.length) { console.log('STRUCT ' + p.id + ': ' + issues.join('; ')); bad++; }
}

// --- build one payload with every (problem, test) pair ----------------------
const cases = [];
const index = [];
for (const p of problems) {
  const src = solutions[p.id];
  if (!src) { console.log('NO SOLUTION ' + p.id); bad++; continue; }
  p.tests.forEach((t, ti) => {
    cases.push({
      id: p.id + '#' + ti,
      source: src,
      mode: p.mode,
      functionName: p.functionName || '',
      args: t.args || [],
    });
    index.push({ p, t, ti });
  });
}

const payloadPath = fileURLToPath(new URL('./pypayload.json', import.meta.url));
writeFileSync(payloadPath, JSON.stringify(cases), 'utf8');

const harnessPath = fileURLToPath(new URL('./pyharness.py', import.meta.url));
const raw = execFileSync('python', [harnessPath, payloadPath], { encoding: 'utf8', maxBuffer: 20e6 });
const out = JSON.parse(raw);

// --- compare ---------------------------------------------------------------
for (let i = 0; i < out.length; i++) {
  const r = out[i];
  const { p, t, ti } = index[i];
  if (!r.ok) {
    console.log('ERROR ' + p.id + ' test#' + ti + ': ' + r.error);
    bad++;
    continue;
  }
  if (p.mode === 'function') {
    if (!valuesMatch(r.result, t.expected)) {
      console.log('FAIL ' + p.id + ' ' + (t.label || '#' + ti)
        + ' expected ' + JSON.stringify(t.expected) + ' got ' + JSON.stringify(r.result));
      bad++;
    }
  } else if (normalizeOutput(r.output) !== normalizeOutput(t.expected)) {
    console.log('FAIL ' + p.id + ' stdout');
    console.log('  expected: ' + JSON.stringify(normalizeOutput(t.expected)));
    console.log('  actual:   ' + JSON.stringify(normalizeOutput(r.output)));
    bad++;
  }
}

// --- starter code must not already pass ------------------------------------
const starterCases = problems.map((p) => ({
  id: p.id, source: p.starterCode, mode: p.mode, functionName: p.functionName || '',
  args: p.tests[0].args || [],
}));
writeFileSync(payloadPath, JSON.stringify(starterCases), 'utf8');
const starterOut = JSON.parse(execFileSync('python', [harnessPath, payloadPath], { encoding: 'utf8', maxBuffer: 20e6 }));
let freebies = 0;
starterOut.forEach((r, i) => {
  const p = problems[i];
  const t = p.tests[0];
  if (!r.ok) return;
  const ok = p.mode === 'function'
    ? valuesMatch(r.result, t.expected)
    : normalizeOutput(r.output) === normalizeOutput(t.expected);
  if (ok) { console.log('STARTER ALREADY PASSES: ' + p.id); freebies++; }
});

console.log('\n' + (bad === 0 ? 'All reference solutions pass.' : bad + ' problem(s) need attention.'));
console.log(freebies === 0 ? 'No starter code passes on its own.' : freebies + ' starter(s) pass for free.');
