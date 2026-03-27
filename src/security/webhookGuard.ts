import crypto from 'node:crypto';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type ReplayStore = Map<string, number>;

function secureEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function buildSignature(secret: string, body: string): string {
  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${digest}`;
}

export function verifySignature(secret: string, body: string, signature: string): boolean {
  const expected = buildSignature(secret, body);
  return secureEqual(expected, signature);
}

export function assertNotReplay(deliveryId: string, replayStore: ReplayStore, now = Date.now()): void {
  const seenAt = replayStore.get(deliveryId);
  if (seenAt && now - seenAt < FIVE_MINUTES_MS) {
    throw new Error('Replay request rejected');
  }

  replayStore.set(deliveryId, now);

  for (const [id, ts] of replayStore.entries()) {
    if (now - ts > FIVE_MINUTES_MS) {
      replayStore.delete(id);
    }
  }
}
