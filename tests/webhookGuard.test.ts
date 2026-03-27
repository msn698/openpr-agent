import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { assertNotReplay, verifySignature } from '../src/security/webhookGuard.js';

function sign(secret: string, body: string): string {
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('webhookGuard', () => {
  it('verifies valid signatures', () => {
    const secret = 'super-secret-123456';
    const body = JSON.stringify({ hello: 'world' });
    expect(verifySignature(secret, body, sign(secret, body))).toBe(true);
  });

  it('rejects invalid signatures', () => {
    expect(verifySignature('a', '{}', 'sha256=deadbeef')).toBe(false);
  });

  it('rejects replayed delivery ids', () => {
    const store = new Map<string, number>();
    assertNotReplay('delivery-1', store, 1000);
    expect(() => assertNotReplay('delivery-1', store, 1001)).toThrow('Replay request rejected');
  });
});
