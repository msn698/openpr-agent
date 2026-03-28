# OpenPR Agent Architecture

```mermaid
flowchart TD
  GH[GitHub App Webhook] --> S[Webhook Server /webhooks/github]
  S --> V[Signature + Replay Guard]
  V --> PR[PR Open Handler]
  V --> IC[Issue Comment Handler]

  PR --> RF[Review Flow Engine]
  RF --> RA[Model Adapter Factory]
  RA --> M1[Mock]
  RA --> M2[OpenAI]
  RA --> M3[Anthropic]
  RA --> M4[Local Ollama]
  RF --> C1[Post PR Review Comment]

  IC --> CP[Command Parser]
  CP --> FX[@openpr fix]
  CP --> RV[@openpr review]

  FX --> PG[Autofix Policy Gates]
  PG -->|allowed| AP[Autofix Patch Builder]
  AP --> AC[Autofix Commit Executor]
  AC --> C2[Post Commit/Status Comment]
  PG -->|blocked| C3[Post Blocked Reason]
```

## Security boundaries

- HMAC webhook signature verification
- Delivery replay protection (time-window)
- Sensitive-path policy blocks for autofix
- Fork PR writeback blocked for safety/access constraints
- Secret redaction in output rendering
