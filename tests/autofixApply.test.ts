import { describe, it, expect } from 'vitest';
import { applySafeAutofixes } from '../src/core/autofixApply.js';

describe('applySafeAutofixes', () => {
  it('trims trailing whitespace', () => {
    const input = 'const a = 1;   \nconst b = 2;\t\n';
    const result = applySafeAutofixes(input);
    expect(result.changed).toBe(true);
    expect(result.output).toBe('const a = 1;\nconst b = 2;\n');
    expect(result.edits).toContain('trim-trailing-whitespace');
  });

  it('ensures final newline', () => {
    const input = 'const x = 1;';
    const result = applySafeAutofixes(input);
    expect(result.output.endsWith('\n')).toBe(true);
    expect(result.edits).toContain('ensure-final-newline');
  });

  it('returns unchanged for clean input', () => {
    const input = 'const ok = true;\n';
    const result = applySafeAutofixes(input);
    expect(result.changed).toBe(false);
    expect(result.edits).toHaveLength(0);
  });
});
