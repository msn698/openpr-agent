# OpenPR Agent

Open-source AI pull request reviewer + fixer for GitHub.

## What works now

- GitHub webhook server (`/webhooks/github`) with signature verification
- Replay-attack protection for webhook deliveries
- Pull request opened handler that comments with review findings
- `@openpr fix` and `@openpr review` command parsing on PR comments
- Rule-based checks (`.openpr.yml` / `.openpr.json`)
- Security redaction layer for sensitive token patterns
- CI + CodeQL + Dependabot + test coverage gates

## Quick start (local/self-hosted)

```bash
cp .env.example .env
npm install
npm run lint
npm run typecheck
npm test
npm run dev
```

Then expose your local server (e.g. with ngrok) and configure your GitHub App webhook URL:

`https://<your-domain>/webhooks/github`

Generate a secure webhook secret quickly:

```bash
npm run generate:webhook-secret
```

Detailed app setup guide: [`docs/GITHUB_APP_SETUP.md`](docs/GITHUB_APP_SETUP.md)

## Cloud-hosted path (easiest to scale)

- Deploy to Fly.io / Railway / Render / AWS with env vars from `.env.example`
- Keep one instance running behind HTTPS
- Configure GitHub App for your org/repo installations

## Security posture

- HMAC signature verification (`x-hub-signature-256`)
- Replay detection via `x-github-delivery`
- Strict environment validation with Zod
- Secret redaction in generated output
- CI runs lint, typecheck, tests, and npm high-severity audit checks
- CodeQL static analysis on pushes, PRs, and schedule

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

## Roadmap

1. Safe autofix branch + patch generation (`@openpr fix`) *(executor started with deterministic low-risk transforms)*
2. Incremental diff-aware re-review mode
3. Provider adapters (OpenAI/Anthropic/local) *(OpenAI + Anthropic + Local (Ollama) + Mock adapters implemented)*
4. SARIF + security annotation output
5. Dashboard for org-wide PR quality metrics
