import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { loadRules } from '../src/config/loadRules.js';

describe('loadRules', () => {
  it('loads yaml config when present', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openpr-'));
    fs.writeFileSync(path.join(dir, '.openpr.yml'), 'maxFiles: 12\ncommentStyle: detailed\n');
    const cfg = loadRules(dir);
    expect(cfg.maxFiles).toBe(12);
    expect(cfg.commentStyle).toBe('detailed');
  });

  it('falls back to defaults', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openpr-'));
    const cfg = loadRules(dir);
    expect(cfg.maxFiles).toBeGreaterThan(0);
  });
});
