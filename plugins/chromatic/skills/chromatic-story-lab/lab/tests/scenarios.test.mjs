import assert from 'node:assert/strict';
import test from 'node:test';
import { checkAnswers, scenarios } from './check-scenarios.mjs';

const correct = () => Object.fromEntries(scenarios.map(({ id, expected }) => [id, { ...expected }]));

test('complete answers preserve the requested capture and review behavior', () => {
  assert.deepEqual(checkAnswers(correct()), []);
});

test('quarantine cannot solve a no-capture cost request', () => {
  const answers = correct();
  answers['retired-demo'] = { action: 'quarantine', billedSnapshots: 10, diffsReviewed: false };
  assert.deepEqual(checkAnswers(answers), ['retired-demo: reconsider action', 'retired-demo: reconsider billedSnapshots']);
});

test('quarantine keeps capture cost and suspends diff review', () => {
  const answers = correct();
  answers['temporary-flake'].billedSnapshots = 0;
  answers['temporary-flake'].diffsReviewed = true;
  assert.equal(checkAnswers(answers).length, 2);
});

test('disabling an unstable but required story loses the requested coverage', () => {
  const answers = correct();
  answers.timer = { action: 'disable', billedSnapshots: 0, diffsReviewed: false };
  assert.equal(checkAnswers(answers).length, 3);
  assert.equal(checkAnswers({}).length, 9);
});
