import { describe, it, expect } from 'vitest';
import { loadEnv } from '../src/config/env.js';

describe('loadEnv', () => {
  it('loads and normalizes env values', () => {
    const env = loadEnv({
      GITHUB_WEBHOOK_SECRET: '1234567890123456',
      GITHUB_APP_ID: '12345',
      GITHUB_PRIVATE_KEY: 'line1\\nline2',
      PORT: '3456'
    });

    expect(env.PORT).toBe(3456);
    expect(env.GITHUB_PRIVATE_KEY).toContain('\n');
  });
});
