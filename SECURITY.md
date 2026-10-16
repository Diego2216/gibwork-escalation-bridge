# Security Policy

Gibwork Escalation Bridge is designed to minimize the context that leaves an agent workstation.

## Hard rules

- Never place a seed phrase, Solana private key, GitHub token, password or API secret in a task file.
- The bridge does not accept private keys as command-line arguments.
- Wallet authentication and transaction signing remain in the official Gibwork CLI.
- Production publishing is disabled unless `GIB_ESCALATE_ALLOW_PRODUCTION=YES` is explicitly set.
- A detected secret produces `BLOCK`; redaction is not treated as permission to publish.
- Generated artifacts must be reviewed before any production bounty is created.

## Threat model

The primary risks are accidental oversharing by an agent, secret leakage, scope creep, uncontrolled spend, and accepting unverifiable external work. The bridge addresses those risks through privacy scanning, bounded file scope, explicit acceptance criteria, budget gates, fail-closed production publishing and evidence verification.

## Reporting

Please report security issues privately to the repository owner rather than opening a public issue containing sensitive data.
