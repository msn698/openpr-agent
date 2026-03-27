# GitHub App Setup

## 1) Create app

1. Go to GitHub **Settings → Developer settings → GitHub Apps → New GitHub App**
2. Set:
   - Homepage URL: your repo URL
   - Webhook URL: `https://<your-domain>/webhooks/github`
   - Webhook secret: generated random string (32+ bytes)

## 2) Permissions

Repository permissions:
- Pull requests: Read
- Contents: Read
- Issues: Read & Write
- Metadata: Read-only

Subscribe to events:
- Pull request
- Issue comment

## 3) Install app

Install to target account/org and selected repositories.

## 4) Configure environment

Set in deployment environment:

- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`
- `MODEL_PROVIDER=mock` (or openai/anthropic later)

## 5) Validate flow

- Open PR in installed repository
- Confirm OpenPR Agent posts a review comment
- Add `@openpr fix` comment on PR and confirm autofix plan response
