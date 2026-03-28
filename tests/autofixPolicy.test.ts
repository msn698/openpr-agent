import { describe, it, expect } from 'vitest';
import { evaluateAutofixPolicy } from '../src/core/autofixPolicy.js';

describe('evaluateAutofixPolicy', () => {
  it('blocks oversized PRs', () => {
    const files = Array.from({ length: 30 }, (_, i) => `src/f${i}.ts`);
    const result = evaluateAutofixPolicy(files, 25);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('limited');
  });

  it('blocks sensitive paths', () => {
    const result = evaluateAutofixPolicy(['src/.env.local', 'src/app.ts']);
    expect(result.allowed).toBe(false);
    expect(result.blockedFiles).toContain('src/.env.local');
  });

  it('allows safe small PRs', () => {
    const result = evaluateAutofixPolicy(['src/a.ts', 'src/b.ts']);
    expect(result.allowed).toBe(true);
  });
});
