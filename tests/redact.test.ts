import { describe, it, expect } from 'vitest';
import { redactSecrets } from '../src/security/redact.js';

describe('redactSecrets', () => {
  it('redacts GitHub token-like strings', () => {
    const raw = 'token: ghp_1234567890123456789012345';
    const out = redactSecrets(raw);
    expect(out).not.toContain('ghp_');
    expect(out).toContain('[REDACTED_SECRET]');
  });
});
