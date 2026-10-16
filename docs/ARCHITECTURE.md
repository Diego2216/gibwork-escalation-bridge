# Architecture

## Goal

Turn Gibwork into a safe external workforce lane for autonomous coding agents.

## Components

1. **Task Intake** — receives a bounded problem from an AI coding agent or orchestrator.
2. **Privacy Firewall** — scans and redacts personal/local context and blocks secret-bearing tasks.
3. **Delegation Policy** — returns `BLOCK`, `KEEP_LOCAL`, or `DELEGATE_DRAFT` using clarity, privacy and economics scores.
4. **Work Order Builder** — generates a minimal Gibwork-compatible task payload with explicit scope and acceptance criteria.
5. **Audit Receipt** — SHA-256 evidence that ties the routing decision to the generated work order.
6. **Official Gibwork CLI Adapter** — invokes `gibwork task create --from ...`; wallet and transaction handling stay inside Gibwork's official tool.
7. **Evidence Verifier** — checks repository/patch, commit, tests and declared criteria before external work returns to the agent workflow.

## State flow

```text
AGENT_BLOCKED
  -> ASSESSING
  -> BLOCK | KEEP_LOCAL | DELEGATE_DRAFT
  -> GIBWORK_DRAFT_READY
  -> GIBWORK_PUBLISHED
  -> EXTERNAL_WORK_RECEIVED
  -> REVIEW_REQUIRED | READY_TO_REVIEW
  -> AGENT_RESUME
```

## Privacy boundary

The external bounty should contain the smallest context necessary to solve the task. Repository-wide context, credentials, user home paths, personal e-mail addresses and production access are outside the delegation boundary.

## Gibwork integration

The bridge intentionally delegates authenticated actions to the official `@gibwork/cli`. This avoids implementing another wallet custody layer and keeps transaction confirmation where Gibwork already handles it.
