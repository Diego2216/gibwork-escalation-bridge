import test from 'node:test';
import assert from 'node:assert/strict';
import { assessDelegation } from '../src/policy.mjs';
import { buildWorkOrder } from '../src/workorder.mjs';
import { verifyEvidence } from '../src/verify.mjs';

test('delegates a bounded, well-defined task', () => {
  const assessment = assessDelegation({
    title: 'Implement parser',
    problem: 'Build a deterministic parser',
    acceptanceCriteria: ['parses input', 'has tests', 'deterministic output'],
    allowedFiles: ['src/parser.mjs'],
    estimatedInternalMinutes: 90,
    maxBudgetUsdc: 25,
    deadlineHours: 24,
    allowExternalDelegation: true
  });
  assert.equal(assessment.decision, 'DELEGATE_DRAFT');
  assert.ok(assessment.score >= 70);
  const order = buildWorkOrder(assessment);
  assert.equal(order.gibworkTask.payment.amount, '25.00');
  assert.match(order.gibworkTask.content, /Privacy boundary/);
});

test('blocks secret-bearing context before it leaves the machine', () => {
  const assessment = assessDelegation({
    title: 'Debug auth',
    problem: 'api_key=DEMO_NOT_A_REAL_SECRET',
    acceptanceCriteria: ['works'],
    estimatedInternalMinutes: 60,
    maxBudgetUsdc: 20,
    allowExternalDelegation: true
  });
  assert.equal(assessment.decision, 'BLOCK');
  assert.ok(assessment.blockers.includes('SECRET_MATERIAL_DETECTED'));
  assert.match(assessment.sanitizedTask.problem, /REDACTED/);
});

test('keeps tiny work local', () => {
  const assessment = assessDelegation({
    title: 'Rename variable',
    problem: 'Rename one local variable',
    acceptanceCriteria: ['tests pass'],
    estimatedInternalMinutes: 5,
    maxBudgetUsdc: 3,
    allowExternalDelegation: true
  });
  assert.equal(assessment.decision, 'KEEP_LOCAL');
});

test('verification requires all declared acceptance criteria', () => {
  const assessment = assessDelegation({
    title: 'Implement parser',
    problem: 'Build parser',
    acceptanceCriteria: ['one', 'two'],
    estimatedInternalMinutes: 60,
    maxBudgetUsdc: 15,
    allowExternalDelegation: true
  });
  const order = buildWorkOrder(assessment);
  const report = verifyEvidence(order, {
    repositoryUrl: 'https://example.test/repo',
    commit: 'abc123',
    summary: 'done',
    tests: ['PASS'],
    criteriaSatisfied: [1, 2]
  });
  assert.equal(report.status, 'READY_TO_REVIEW');
});
