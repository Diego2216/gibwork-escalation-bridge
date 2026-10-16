import crypto from 'node:crypto';

export function buildWorkOrder(assessment) {
  if (assessment.decision === 'BLOCK') throw new Error(`Delegation blocked: ${assessment.blockers.join(', ')}`);
  const task = assessment.sanitizedTask;
  const id = task.id || `work-${crypto.randomUUID()}`;
  const budget = Number(task.maxBudgetUsdc || 0);
  const minimum = Number(task.minimumPayoutUsdc || Math.max(5, Math.round(budget * 0.25 * 100) / 100));
  const criteria = (task.acceptanceCriteria || []).map((item, index) => `${index + 1}. ${item}`).join('\n');
  const allowedFiles = Array.isArray(task.allowedFiles) && task.allowedFiles.length
    ? task.allowedFiles.map(item => `- ${item}`).join('\n')
    : '- Only files explicitly required by the task; request clarification before expanding scope.';

  const content = [
    `<h2>Problem</h2><p>${escapeHtml(task.problem || '')}</p>`,
    `<h2>Acceptance criteria</h2><pre>${escapeHtml(criteria)}</pre>`,
    `<h2>Allowed scope</h2><pre>${escapeHtml(allowedFiles)}</pre>`,
    `<h2>Privacy boundary</h2><p>Do not request credentials, private keys, personal data, unrelated repository files, or production access.</p>`,
    `<h2>Delivery</h2><p>Provide a repository/patch, test evidence, concise implementation notes, and any limitations.</p>`
  ].join('\n');

  return {
    workOrderId: id,
    decisionScore: assessment.score,
    createdAt: new Date().toISOString(),
    gibworkTask: {
      title: task.title,
      content,
      tags: Array.isArray(task.tags) && task.tags.length ? task.tags : ['Development', 'AI Agents', 'Automation'],
      payment: { amount: budget.toFixed(2) },
      minSubmissionAmount: minimum.toFixed(2)
    },
    internal: {
      sourceAgent: task.sourceAgent || 'unknown-agent',
      projectRef: task.projectRef || null,
      deadlineHours: Number(task.deadlineHours || 48),
      acceptanceCriteria: task.acceptanceCriteria || [],
      privacyFindings: assessment.findings,
      eventFlow: ['AGENT_ESCALATION_REQUESTED', 'PRIVACY_GATE_PASSED', 'GIBWORK_BOUNTY_DRAFTED']
    }
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
