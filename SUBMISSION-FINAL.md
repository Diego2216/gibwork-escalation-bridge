# Gibwork Escalation Bridge — Privacy-first human fallback for AI agents

I built **Gibwork Escalation Bridge**, a terminal-native workflow that lets an AI coding agent safely delegate a bounded task to a Gibwork contributor when the agent is blocked or when external execution makes more sense.

The main idea is simple: an agent should not dump its full repository, credentials, local paths, or private context into a marketplace just to ask for help.

The bridge adds a decision layer before delegation:

1. **Privacy Firewall** scans the task and blocks secrets, credentials, seed/private-key-like material and sensitive local context.
2. **Delegation Policy** scores clarity, privacy and economics, returning `BLOCK`, `KEEP_LOCAL` or `DELEGATE_DRAFT`.
3. **Work Order Builder** produces a minimal Gibwork-compatible task with bounded scope, explicit acceptance criteria and a maximum USDC budget.
4. **Official Gibwork CLI Adapter** uses the supported `gibwork task create --from task.json` flow while leaving wallet authentication, quotes, confirmation and transaction signing inside Gibwork tooling.
5. **Evidence Verifier** checks the returned repository/patch, commit, tests and declared acceptance criteria before the result goes back to the parent agent.
6. **Audit Receipt** generates deterministic SHA-256 evidence for the delegation and verification steps.

This creates a full agent workflow:

`AI agent blocked -> privacy/economics gate -> Gibwork work order -> contributor -> evidence verification -> AI agent resumes`

### Why this is useful

AI coding agents are strong, but they still hit tasks that need a human, a specialist, a different environment, hardware access, local knowledge, manual validation or simply a second opinion. Gibwork becomes the agent's external workforce lane without requiring the agent to expose the whole project.

### Working prototype

Public repository:
https://github.com/Diego2216/gibwork-escalation-bridge

Reviewer commands:

```bash
npm install --global @gibwork/cli@latest
npm test
npm run demo
node src/cli.mjs doctor
node src/cli.mjs draft examples/stuck-agent-task.json --out artifacts
```

The repository includes:

- functional CLI prototype;
- official Gibwork CLI integration point;
- privacy firewall;
- economic/scope gate;
- safe and unsafe examples;
- JSON schemas;
- deterministic tests;
- end-to-end demo;
- SHA-256 receipts;
- architecture and security documentation.

The demo is intentionally safe: it does not require production funds, expose wallet secrets, or publish a live bounty. Production publishing is fail-closed and must be explicitly enabled after the generated task has been reviewed.

I wanted the project to demonstrate more than “an agent can spend money.” The useful part is that an agent can **recognize when it should ask for help, minimize what it reveals, define the work precisely, and bring a verifiable result back into its own workflow.**
