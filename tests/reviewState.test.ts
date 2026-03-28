import { describe, it, expect } from 'vitest';
import { buildReviewFooter, decodeReviewState, encodeReviewState } from '../src/core/reviewState.js';

describe('reviewState', () => {
  it('encodes and decodes state', () => {
    const footer = encodeReviewState({ lastReviewedCommitSha: 'abc123' });
    const decoded = decodeReviewState(footer);
    expect(decoded?.lastReviewedCommitSha).toBe('abc123');
  });

  it('returns null for invalid state payload', () => {
    expect(decodeReviewState('hello')).toBeNull();
  });

  it('builds footer marker', () => {
    expect(buildReviewFooter('def456')).toContain('def456');
  });
});
