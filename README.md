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
Official Gibwork CLI
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
- official Gibwork CLI integration adapter;
- stage-first execution and explicit production gate;
- SHA-256 audit receipt;
- evidence verification against declared acceptance criteria;
- runnable CLI, demo, tests and JSON schemas.

## Quick start

Requires **Node.js 22+**, matching the official Gibwork CLI requirement.

```bash
npm install --global @gibwork/cli@latest
npm test
npm run demo
node src/cli.mjs doctor
```

Evaluate a task:

```bash
node src/cli.mjs assess examples/stuck-agent-task.json
```

Build a delegation draft:

```bash
node src/cli.mjs draft examples/stuck-agent-task.json --out artifacts
```

Try an unsafe task:

```bash
node src/cli.mjs assess examples/unsafe-task.json
```

The unsafe example must fail closed.

## Gibwork integration

The adapter targets the official `@gibwork/cli` package and its supported JSON task creation flow:

```bash
gibwork task create --from task.json
```

The bridge intentionally leaves wallet authentication, quotes, confirmation and Solana transaction signing inside Gibwork's supported local tooling.

By design, this repository does **not** ship private keys, wallet secrets, API tokens or production credentials.

The bridge prepares a validated work order first. Production execution remains fail-closed until explicitly enabled in the operator's own environment.

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
  "execution": "STAGE_FIRST"
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

Public repository: https://github.com/Diego2216/gibwork-escalation-bridge

## License

MIT.
