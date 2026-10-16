import crypto from 'node:crypto';

export function verifyEvidence(workOrder, evidence) {
  const missing = [];
  if (!evidence.repositoryUrl && !evidence.patchUrl) missing.push('repositoryUrl_or_patchUrl');
  if (!evidence.commit) missing.push('commit');
  if (!Array.isArray(evidence.tests) || evidence.tests.length === 0) missing.push('tests');
  if (!evidence.summary) missing.push('summary');

  const criteria = workOrder.internal?.acceptanceCriteria || [];
  const declared = new Set(evidence.criteriaSatisfied || []);
  const unmet = criteria.filter((_, index) => !declared.has(index + 1));
  const status = missing.length || unmet.length ? 'REVIEW_REQUIRED' : 'READY_TO_REVIEW';
  const digest = crypto.createHash('sha256').update(JSON.stringify({
    workOrderId: workOrder.workOrderId,
    evidence,
    status,
    missing,
    unmet
  })).digest('hex');

  return {
    schema: 'gibwork.escalation.verification.v1',
    status,
    missing,
    unmetCriteria: unmet,
    sha256: digest,
    event: status === 'READY_TO_REVIEW' ? 'EXTERNAL_WORK_READY_FOR_AGENT_REVIEW' : 'EXTERNAL_WORK_NEEDS_REVIEW'
  };
}
