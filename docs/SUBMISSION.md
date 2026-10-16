# Gibwork Hackathon submission draft

## Gibwork Escalation Bridge — Human fallback for AI coding agents

Gibwork Escalation Bridge is a terminal-native workflow that lets an AI coding agent safely delegate a bounded task to a human contributor on Gibwork when the agent is blocked or when external execution is economically better.

The key idea is that an agent should **not** dump its full repository/context into a marketplace. The bridge runs a privacy and scope gate first, removes personal/local context, blocks credentials and secrets, calculates whether delegation makes sense, generates explicit acceptance criteria, and produces a minimal Gibwork-compatible task.

It integrates with the official `@gibwork/cli` for task creation, leaving wallet authentication, quotes and transaction signing inside Gibwork's supported local flow. Production publishing is fail-closed and stage is the default.

After a contributor returns work, the bridge validates repository/patch evidence, commit/test evidence and declared acceptance criteria, then emits a signed-style SHA-256 verification receipt and an event that can be consumed by the original AI-agent workflow.

### What it demonstrates

- A new Gibwork use case: Gibwork as a **human escalation lane for autonomous developer agents**.
- Non-web workflow: CLI + machine-readable JSON artifacts.
- Official Gibwork CLI integration.
- Privacy firewall and least-context delegation.
- Budget/scope decision gate.
- Deterministic audit receipts.
- Return path from contributor work back into an AI agent pipeline.

### Reviewer commands

```bash
npm test
npm run demo
node src/cli.mjs doctor
node src/cli.mjs draft examples/stuck-agent-task.json --out artifacts
```

No wallet or production funds are required for the demo.
