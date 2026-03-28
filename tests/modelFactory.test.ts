import { describe, it, expect } from 'vitest';
import { createModelAdapter } from '../src/models/factory.js';

describe('createModelAdapter', () => {
  it('returns mock adapter by default', () => {
    const adapter = createModelAdapter({
      NODE_ENV: 'test',
      PORT: 3000,
      GITHUB_WEBHOOK_SECRET: '1234567890123456',
      GITHUB_APP_ID: '1',
      GITHUB_PRIVATE_KEY: 'key',
      MODEL_PROVIDER: 'mock'
    });

    expect(adapter).toBeDefined();
  });

  it('throws when openai key missing', () => {
    expect(() =>
      createModelAdapter({
        NODE_ENV: 'test',
        PORT: 3000,
        GITHUB_WEBHOOK_SECRET: '1234567890123456',
        GITHUB_APP_ID: '1',
        GITHUB_PRIVATE_KEY: 'key',
        MODEL_PROVIDER: 'openai'
      })
    ).toThrow('OPENAI_API_KEY');
  });

  it('supports local provider without API key', () => {
    const adapter = createModelAdapter({
      NODE_ENV: 'test',
      PORT: 3000,
      GITHUB_WEBHOOK_SECRET: '1234567890123456',
      GITHUB_APP_ID: '1',
      GITHUB_PRIVATE_KEY: 'key',
      MODEL_PROVIDER: 'local',
      OLLAMA_BASE_URL: 'http://localhost:11434',
      LOCAL_MODEL: 'qwen2.5-coder:7b'
    });

    expect(adapter).toBeDefined();
  });
});
