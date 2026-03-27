import { describe, it, expect } from 'vitest';
import { analyzeChangedFiles, summarizeFindings } from '../src/core/analyzeDiff.js';
import { rulesSchema } from '../src/config/schema.js';

describe('analyzeChangedFiles', () => {
  const rules = rulesSchema.parse({ maxFiles: 2, blockedPatterns: ['.env*'] });

  it('flags oversized PRs', () => {
    const findings = analyzeChangedFiles(['a.ts', 'b.ts', 'c.ts'], rules);
    expect(findings.some((f) => f.message.includes('too large'))).toBe(true);
  });

  it('flags blocked patterns', () => {
    const findings = analyzeChangedFiles(['src/.env.local'], rules);
    expect(findings.some((f) => f.severity === 'high')).toBe(true);
  });

  it('summarizes findings', () => {
    const summary = summarizeFindings([
      { severity: 'low', file: 'x.ts', message: 'note' }
    ]);
    expect(summary).toContain('[LOW]');
  });
});
