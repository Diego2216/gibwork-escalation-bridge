# Gibwork Escalation Bridge

A privacy-first delegation bridge for AI agents that need to escalate bounded work to external contributors through Gibwork.

The prototype is designed around one question: **when should an autonomous developer agent keep work local, block it for safety, or prepare a minimal external work order?**

## Why this exists

AI agents are good at many coding tasks, but some jobs are still better delegated: environment-specific reproduction, specialist review, manual validation, hardware access, or a bounded implementation task. Sending the entire project context to an external worker creates unnecessary privacy, security, and IP risk.

Gibwork Escalation Bridge solves that by creating a **sanitized, budget-bounded, auditable work order** instead of exposing the parent agent's full context.

## Flow

```text
AI agent gets stuck
      ↓
Delegation policy
      ↓
Privacy Firewall
      ↓
BLOCK / KEEP_LOCAL / DELEGATE_DRAFT
      ↓
Minimal work order
      ↓
Gibwork CLI adapter
      ↓
Human / external contributor
      ↓
Evidence verification
      ↓
Result returns to parent agent
```

## What the prototype demonstrates

- deterministic delegation policy;
- privacy firewall with fail-closed handling of secret-bearing context;
- economic gate based on estimated internal time and maximum delegation budget;
- minimal-context work order generation;
- Gibwork CLI integration adapter;
- dry-run by default and explicit production gate;
- SHA-256 audit receipt;
- evidence verification against declared acceptance criteria;
- runnable CLI, demo, tests and JSON schemas.

## Quick start

Requires Node.js 20+.

```bash
npm test
npm run demo
```

Evaluate a task:

```bash
node src/cli.mjs assess examples/stuck-agent-task.json
```

Build a delegation draft:

```bash
node src/cli.mjs draft examples/stuck-agent-task.json
```

Try an unsafe task:

```bash
node src/cli.mjs assess examples/unsafe-task.json
```

The unsafe example must fail closed.

## Gibwork integration

The adapter targets the official Gibwork CLI package:

```bash
npx @gibwork/cli@latest --help
```

By design, this repository does **not** ship private keys, wallet secrets, API tokens, production credentials, or a live bounty-creation command with hidden authorization.

The bridge prepares a validated work order first. Production execution must be explicitly enabled and authenticated in the operator's own environment.

## Safety model

The bridge never assumes that external delegation is harmless. It checks for:

- token/API-key-like material;
- `.env` references;
- local user paths;
- private keys and seed phrases;
- disallowed external delegation;
- insufficient acceptance criteria;
- work too small to justify delegation;
- missing budget boundaries.

A task containing risky context is blocked before work-order generation.

## Example decision

```json
{
  "decision": "DELEGATE_DRAFT",
  "score": 84,
  "maxBudgetUsdc": 25,
  "privacy": "SANITIZED",
  "execution": "DRY_RUN"
}
```

## Project structure

```text
src/
  cli.mjs          command-line interface
  policy.mjs       delegation decision engine
  redactor.mjs     privacy firewall
  workorder.mjs    minimal Gibwork work-order builder
  gibwork-cli.mjs  official CLI adapter
  verify.mjs       return-evidence validator
  audit.mjs        audit receipt generator

tests/             deterministic tests
demo/              end-to-end demonstration
examples/          safe and unsafe sample tasks
schemas/           JSON contracts
docs/              architecture, demo and submission notes
```

## Status

Prototype for the Gibwork Developer Hackathon Bounty.

It is intentionally **non-web-app-first**: the core experience is CLI / agent workflow automation.

## License

MIT.
