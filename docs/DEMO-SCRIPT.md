# 90-second demo script

1. Show `examples/stuck-agent-task.json`: an AI backend agent is blocked on a parser task.
2. Run `node src/cli.mjs assess examples/stuck-agent-task.json` and show `DELEGATE_DRAFT` plus clarity/privacy/economics scores.
3. Run `node src/cli.mjs draft ...` and open `artifacts/gibwork-task.json` to show the minimal bounty payload.
4. Open `artifacts/delegation-receipt.json` and point to the SHA-256 audit receipt.
5. Run `node src/cli.mjs assess examples/unsafe-task.json` and show the fail-closed secret detection/redaction.
6. Run `node src/cli.mjs verify artifacts/work-order.json examples/submission-evidence.json` and show `READY_TO_REVIEW`.
7. Run `node src/cli.mjs doctor` to show the official Gibwork CLI integration point.
8. Close with the architecture: AI agent -> privacy/economics gate -> Gibwork contributor -> verified result -> AI agent.
