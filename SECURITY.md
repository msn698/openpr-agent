# Security Policy

## Reporting a vulnerability

Please open a private security advisory on GitHub or email the maintainer.
Do not post unpatched exploit details publicly.

## Security controls currently in place

- Secrets are redacted from generated output.
- Repository config is schema-validated.
- CI runs tests, lint, typecheck, and `npm audit --audit-level=high`.
- Pull requests should pass all required checks before merge.
