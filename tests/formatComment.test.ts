import { describe, it, expect } from 'vitest';
import { formatReviewComment } from '../src/github/formatComment.js';

describe('formatReviewComment', () => {
  it('formats findings and redacts secrets', () => {
    const text = formatReviewComment([
      {
        severity: 'high',
        file: 'src/auth.ts',
        message: 'Leaked token ghp_1234567890123456789012345'
      }
    ]);

    expect(text).toContain('OpenPR Agent Review');
    expect(text).toContain('[REDACTED_SECRET]');
    expect(text).not.toContain('ghp_');
  });
});
