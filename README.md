# OpenPR Agent

[![CI](https://github.com/msn698/openpr-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/msn698/openpr-agent/actions/workflows/ci.yml)
[![CodeQL](https://github.com/msn698/openpr-agent/actions/workflows/codeql.yml/badge.svg)](https://github.com/msn698/openpr-agent/actions/workflows/codeql.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Open-source AI pull request reviewer + fixer for GitHub.

**Why people will care:** OpenPR gives teams a transparent, customizable alternative to closed PR bots — with security guardrails, deterministic autofixes, and BYO model support.

## 30-second demo

1. Open a PR
2. OpenPR posts a review summary + risk findings
3. Comment `@openpr review` for incremental re-review
4. Comment `@openpr fix` for safe deterministic fixes

## Features

- Secure GitHub webhook server (`/webhooks/github`)
- HMAC signature verification + replay attack protection
- PR review comments with model adapters:
  - Mock
  - OpenAI
  - Anthropic
  - Local (Ollama)
- `@openpr review` with incremental commit-aware re-review
- `@openpr fix` with safety policy gates:
  - sensitive path blocking
  - fork PR boundary protection
  - optional dry-run mode
- Deterministic safe autofix execution
- CI + CodeQL + Dependabot + coverage thresholds

## Quick start (local/self-hosted)

```bash
cp .env.example .env
npm install
npm run lint
npm run typecheck
npm test
npm run dev
```

Expose your local server (e.g. ngrok) and set GitHub App webhook URL:

`https://<your-domain>/webhooks/github`

Generate a secure webhook secret:

```bash
npm run generate:webhook-secret
```

## Environment

Core:
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY`

Model controls:
- `MODEL_PROVIDER=mock|openai|anthropic|local`
- `MODEL_TIMEOUT_MS=15000`
- `MODEL_MAX_RETRIES=2`
- `OPENAI_API_KEY` (if `openai`)
- `ANTHROPIC_API_KEY` (if `anthropic`)
- `OLLAMA_BASE_URL` + `LOCAL_MODEL` (if `local`)

Autofix:
- `AUTOFIX_DRY_RUN=true|false`

## Docs

- Setup guide: [`docs/GITHUB_APP_SETUP.md`](docs/GITHUB_APP_SETUP.md)
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- 5-min media plan: [`docs/QUICKSTART_MEDIA.md`](docs/QUICKSTART_MEDIA.md)

## Contributing

Contributions are welcome — especially:
- model adapters
- deterministic autofix rules
- SARIF/security annotations
- onboarding docs/demo media

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Roadmap

- [x] Secure webhook + review bot baseline
- [x] Incremental re-review state tracking
- [x] Safe deterministic autofix writeback + dry-run
- [x] OpenAI/Anthropic/Ollama adapters
- [ ] SARIF output and GitHub code scanning annotations
- [ ] PR quality dashboard
- [ ] Hosted one-click deployment templates

## License

MIT
