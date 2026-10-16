# Gibwork Hackathon submission draft

## Gibwork Escalation Bridge — Human fallback for AI coding agents

Gibwork Escalation Bridge is a terminal-native workflow that lets an AI coding agent safely delegate a bounded task to a human contributor on Gibwork when the agent is blocked or when external execution is economically better.

The core idea is simple: an agent should **not** dump its full repository or private context into a marketplace. The bridge runs a privacy, scope and economics gate first, removes personal/local context, blocks credentials and secrets, generates explicit acceptance criteria, and produces a minimal Gibwork-compatible task.

It integrates with the official `@gibwork/cli` task-creation flow. Wallet authentication, quotes, confirmation and Solana transaction signing remain inside Gibwork's supported local tooling. Production publishing is fail-closed and stage-first.

After a contributor returns work, the bridge validates repository/patch evidence, commit/test evidence and declared acceptance criteria, then emits a deterministic SHA-256 verification receipt and an event that can be consumed by the original AI-agent workflow.

### What it demonstrates

- A new Gibwork use case: Gibwork as a **human escalation lane for autonomous developer agents**.
- Non-web workflow: CLI + machine-readable JSON artifacts.
- Official Gibwork CLI integration.
- Privacy firewall and least-context delegation.
- Budget/scope decision gate.
- Deterministic audit receipts.
- Return path from contributor work back into an AI agent pipeline.

### Public repository

https://github.com/Diego2216/gibwork-escalation-bridge

### Reviewer commands

```bash
npm install --global @gibwork/cli@latest
npm test
npm run demo
node src/cli.mjs doctor
node src/cli.mjs draft examples/stuck-agent-task.json --out artifacts
```

No wallet or production funds are required for the demo.
