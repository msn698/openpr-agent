import { describe, it, expect } from 'vitest';
import { parseCommand } from '../src/core/commands.js';

describe('parseCommand', () => {
  it('parses fix command', () => {
    expect(parseCommand('@openpr fix src/auth.ts')).toEqual({ kind: 'fix', args: ['src/auth.ts'] });
  });

  it('parses review command', () => {
    expect(parseCommand('@openpr-agent review')).toEqual({ kind: 'review', args: [] });
  });

  it('ignores non-command text', () => {
    expect(parseCommand('looks good')).toEqual({ kind: 'none' });
  });
});
