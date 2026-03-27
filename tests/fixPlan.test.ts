import { describe, it, expect } from 'vitest';
import { buildFixPlan, formatFixPlan } from '../src/core/fixPlan.js';

describe('fixPlan', () => {
  it('blocks when sensitive file is present', () => {
    const plan = buildFixPlan(['src/.env.local']);
    expect(plan.blocked).toBe(true);
    expect(formatFixPlan(plan)).toContain('Blocked');
  });

  it('returns executable plan for normal changes', () => {
    const plan = buildFixPlan(['src/app.ts']);
    expect(plan.blocked).toBe(false);
    expect(formatFixPlan(plan)).toContain('Ready to execute');
  });
});
