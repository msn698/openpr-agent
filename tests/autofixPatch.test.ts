import { describe, it, expect } from 'vitest';
import { buildSafePatch, formatPatchSummary } from '../src/core/autofixPatch.js';

describe('buildSafePatch', () => {
  it('builds patches for text files', () => {
    const result = buildSafePatch([
      { path: 'src/a.ts', original: 'const a = 1;   ' },
      { path: 'README.md', original: 'hello' }
    ]);

    expect(result.changedFiles.length).toBe(2);
    expect(result.changedFiles[0]?.edits.length).toBeGreaterThan(0);
  });

  it('skips unsupported files', () => {
    const result = buildSafePatch([{ path: 'image.png', original: 'binary' }]);
    expect(result.changedFiles.length).toBe(0);
    expect(result.skippedFiles).toContain('image.png');
  });

  it('formats summary', () => {
    const summary = formatPatchSummary({
      changedFiles: [{ path: 'x.ts', edits: ['trim-trailing-whitespace'], content: 'ok\n' }],
      skippedFiles: ['a.png']
    });

    expect(summary).toContain('Changed files: 1');
    expect(summary).toContain('Skipped non-text/unsupported files: 1');
  });
});
