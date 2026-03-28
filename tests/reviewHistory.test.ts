import { describe, it, expect } from 'vitest';
import { getLastReviewedCommitSha } from '../src/github/reviewHistory.js';

describe('getLastReviewedCommitSha', () => {
  it('returns latest sha from OpenPR state marker', async () => {
    const client = {
      issues: {
        listComments: async () => ({
          data: [
            { body: 'random' },
            { body: '## OpenPR\n\n<!-- openpr:state {"lastReviewedCommitSha":"abc123"} -->' }
          ]
        })
      }
    };

    const sha = await getLastReviewedCommitSha({
      client: client as never,
      owner: 'o',
      repo: 'r',
      issueNumber: 1
    });

    expect(sha).toBe('abc123');
  });
});
