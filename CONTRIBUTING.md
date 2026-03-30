# Contributing to OpenPR Agent

Thanks for helping build OpenPR Agent.

## Quick dev loop

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run dev
```

## Pull request checklist

- Keep changes focused and reviewable
- Add/update tests for behavior changes
- Keep security-sensitive logic explicit and documented
- Ensure this passes locally:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`

## Areas where help is most needed

1. Deterministic autofix rules (safe/high-confidence only)
2. SARIF/code scanning annotations
3. Provider adapters + reliability improvements
4. Docs, examples, and setup media

## Security policy

If you discover a vulnerability, follow `SECURITY.md` and do not disclose exploit details publicly before a patch is available.
