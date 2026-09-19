import problems from '../src/data/problems/java.js';
import solutions from './solutions-java.mjs';
import { gradeSubmission } from '../src/engine/grader.js';
import TIERS from '../src/data/tiers.js';

const tierIds = new Set(TIERS.map((t) => t.id));
let bad = 0;

console.log('Java bank: ' + problems.length + ' problems');

// Structural checks
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

// Reference solutions must pass
for (const p of problems) {
  const src = solutions[p.id];
  if (!src) { console.log('NO SOLUTION ' + p.id); bad++; continue; }
  const r = await gradeSubmission({ language: 'java', problem: p, source: src });
  if (!r.passed) {
    bad++;
    console.log('\nFAIL ' + p.id + ' — ' + p.title);
    console.log('  ' + r.feedback.title + ': ' + r.feedback.message.replace(/\n/g, '\n  '));
    for (const t of r.results.filter((x) => !x.passed).slice(0, 2)) {
      console.log('   test ' + t.label + ' expected ' + JSON.stringify(t.expected) + ' got ' + JSON.stringify(t.actual) + (t.error ? ' error=' + t.error : ''));
    }
  } else if (r.warnings.length) {
    console.log('warn ' + p.id + ': ' + r.warnings[0].slice(0, 80));
  }
}

// The starter code must NOT pass (otherwise the problem is free)
let freebies = 0;
for (const p of problems) {
  const r = await gradeSubmission({ language: 'java', problem: p, source: p.starterCode });
  if (r.passed) { console.log('STARTER ALREADY PASSES: ' + p.id); freebies++; }
}

console.log('\n' + (bad === 0 ? 'All reference solutions pass.' : bad + ' problem(s) need attention.'));
console.log(freebies === 0 ? 'No starter code passes on its own.' : freebies + ' starter(s) pass for free.');
