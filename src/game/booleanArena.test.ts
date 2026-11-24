import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK,
  PHASE_CONFIG,
  buildArenaDeck,
  resolveArenaTurn,
  getTimerUrgency,
  BooleanQuestion,
} from './booleanArena';

function evaluateExpressionSafely(q: BooleanQuestion): boolean {
  const vars = q.variables ?? {};
  const argNames = Object.keys(vars);
  const argValues = Object.values(vars);
  const fn = new Function(...argNames, `return Boolean(${q.expression});`);
  return Boolean(fn(...argValues));
}

test('todas as questões do banco possuem resposta booleana exata', () => {
  for (const q of QUESTION_BANK) {
    const computed = evaluateExpressionSafely(q);
    assert.equal(
      computed,
      q.expectedAnswer,
      `Questão ${q.id} (${q.expression}) deveria ser ${computed}, mas expectedAnswer está ${q.expectedAnswer}`
    );
    assert.ok(q.steps.length >= 2, `Questão ${q.id} deve ter passos de resolução`);
  }
});

test('deck da Arena monta exatamente 3 + 4 + 5 = 12 questões progressivas', () => {
  const deck = buildArenaDeck(false);
  assert.equal(deck.length, 12);
  assert.equal(deck.filter((q) => q.phase === 1).length, PHASE_CONFIG[1].questionsToDefeat);
  assert.equal(deck.filter((q) => q.phase === 2).length, PHASE_CONFIG[2].questionsToDefeat);
  assert.equal(deck.filter((q) => q.phase === 3).length, PHASE_CONFIG[3].questionsToDefeat);
});

test('acertar dá dano no Bug e soma pontos; errar ou estourar tempo tira 1 vida de Café', () => {
  const q1 = QUESTION_BANK[0];
  const hit = resolveArenaTurn({
    question: q1,
    chosenAnswer: q1.expectedAnswer,
    timeLeft: 7,
    bugHp: 90,
    coffeeLives: 3,
    streak: 0,
  });
  assert.equal(hit.isCorrect, true);
  assert.equal(hit.newBugHp, 60);
  assert.equal(hit.newCoffeeLives, 3);
  assert.ok(hit.pointsEarned > 100);

  const miss = resolveArenaTurn({
    question: q1,
    chosenAnswer: !q1.expectedAnswer,
    timeLeft: 5,
    bugHp: 90,
    coffeeLives: 3,
    streak: 2,
  });
  assert.equal(miss.isCorrect, false);
  assert.equal(miss.newBugHp, 90);
  assert.equal(miss.newCoffeeLives, 2);

  const timeout = resolveArenaTurn({
    question: q1,
    chosenAnswer: null,
    timeLeft: 0,
    bugHp: 90,
    coffeeLives: 2,
    streak: 1,
  });
  assert.equal(timeout.isCorrect, false);
  assert.equal(timeout.newCoffeeLives, 1);
});

test('urgência do cronômetro muda de normal para warning e critical', () => {
  assert.equal(getTimerUrgency(9), 'normal');
  assert.equal(getTimerUrgency(5), 'warning');
  assert.equal(getTimerUrgency(2.5), 'critical');
});
