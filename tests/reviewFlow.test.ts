import { describe, it, expect } from 'vitest';
import { buildReviewBody } from '../src/github/reviewFlow.js';
import { rulesSchema } from '../src/config/schema.js';
import { MockAdapter } from '../src/models/adapter.js';

describe('buildReviewBody', () => {
  it('includes AI summary and suggested actions', async () => {
    const body = await buildReviewBody({
      owner: 'o',
      repo: 'r',
      pullNumber: 1,
      changedFiles: ['src/index.ts'],
      rules: rulesSchema.parse({}),
      model: new MockAdapter()
    });

    expect(body).toContain('OpenPR Agent Review');
    expect(body).toContain('AI Summary');
    expect(body).toContain('Suggested Actions');
  });
});
