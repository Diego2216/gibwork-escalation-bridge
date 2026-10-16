import crypto from 'node:crypto';

export function createReceipt(workOrder, assessment) {
  const canonical = JSON.stringify({
    workOrderId: workOrder.workOrderId,
    gibworkTask: workOrder.gibworkTask,
    decision: assessment.decision,
    score: assessment.score,
    blockers: assessment.blockers,
    warnings: assessment.warnings
  });
  return {
    schema: 'gibwork.escalation.receipt.v1',
    workOrderId: workOrder.workOrderId,
    decision: assessment.decision,
    decisionScore: assessment.score,
    privacyFindingCount: assessment.findings.length,
    sha256: crypto.createHash('sha256').update(canonical).digest('hex'),
    createdAt: new Date().toISOString()
  };
}
