# OpenPR Agent

Open-source AI pull request reviewer + fixer for GitHub.

## MVP status

This repository contains the initial secure core:
- PR risk/finding engine
- Rule-based repository config (`.openpr.yml`)
- Secret redaction layer
- Test suite with coverage thresholds

## Quick start

```bash
npm install
npm run test
npm run build
npm run dev
```

## Security posture

- Input validation via Zod
- Secret redaction before logging/output
- Strict TypeScript settings
- CI requires lint, tests, typecheck
- Dependabot + npm audit in CI

## Config

Create `.openpr.yml`:

```yaml
maxFiles: 60
blockedPatterns:
  - ".env*"
  - "*.pem"
requiredChecks:
  - "tests"
  - "lint"
commentStyle: "concise"
```

## Next milestones

1. GitHub App installation + comment posting API integration
2. Inline diff-aware suggestions
3. `@openpr fix` command with safe patch generation
4. Multi-model adapter (OpenAI/Anthropic/local)
