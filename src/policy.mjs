import { redactObject } from './redactor.mjs';

export function assessDelegation(task) {
  const { value: sanitizedTask, findings } = redactObject(task);
  const blockers = [];
  const warnings = [];

  if (!sanitizedTask.title) blockers.push('TITLE_REQUIRED');
  if (!sanitizedTask.problem) blockers.push('PROBLEM_REQUIRED');
  if (!Array.isArray(sanitizedTask.acceptanceCriteria) || sanitizedTask.acceptanceCriteria.length === 0) blockers.push('ACCEPTANCE_CRITERIA_REQUIRED');
  if (sanitizedTask.allowExternalDelegation === false) blockers.push('EXTERNAL_DELEGATION_DISABLED');
  if (findings.some(item => item.severity === 'BLOCK')) blockers.push('SECRET_MATERIAL_DETECTED');

  const estimatedMinutes = Number(sanitizedTask.estimatedInternalMinutes || 0);
  const maxBudget = Number(sanitizedTask.maxBudgetUsdc || 0);
  if (estimatedMinutes > 0 && estimatedMinutes < 20) warnings.push('TOO_SMALL_TO_DELEGATE');
  if (maxBudget < 5) warnings.push('BUDGET_BELOW_PRACTICAL_MINIMUM');

  const clarity = Math.min(100,
    (sanitizedTask.title ? 20 : 0) +
    (sanitizedTask.problem ? 25 : 0) +
    (Array.isArray(sanitizedTask.acceptanceCriteria) ? Math.min(30, sanitizedTask.acceptanceCriteria.length * 10) : 0) +
    (Array.isArray(sanitizedTask.allowedFiles) ? 10 : 0) +
    (sanitizedTask.deadlineHours ? 15 : 0)
  );
  const privacy = blockers.includes('SECRET_MATERIAL_DETECTED') ? 0 : Math.max(40, 100 - findings.length * 8);
  const economics = Math.max(0, Math.min(100,
    (estimatedMinutes >= 60 ? 55 : estimatedMinutes >= 30 ? 40 : 20) +
    (maxBudget >= 25 ? 35 : maxBudget >= 10 ? 25 : maxBudget >= 5 ? 10 : 0) +
    (sanitizedTask.deadlineHours && sanitizedTask.deadlineHours <= 24 ? 10 : 5)
  ));
  const score = Math.round(clarity * 0.4 + privacy * 0.35 + economics * 0.25);

  let decision = 'DELEGATE_DRAFT';
  if (blockers.length) decision = 'BLOCK';
  else if (warnings.includes('TOO_SMALL_TO_DELEGATE') || warnings.includes('BUDGET_BELOW_PRACTICAL_MINIMUM')) decision = 'KEEP_LOCAL';

  return {
    decision,
    score,
    scores: { clarity, privacy, economics },
    blockers,
    warnings,
    findings,
    sanitizedTask
  };
}
