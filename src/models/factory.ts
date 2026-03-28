import type { AppEnv } from '../config/env.js';
import type { ModelAdapter } from './adapter.js';
import { AnthropicAdapter, MockAdapter, OpenAIAdapter } from './adapter.js';

export function createModelAdapter(env: AppEnv): ModelAdapter {
  if (env.MODEL_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      throw new Error('MODEL_PROVIDER=openai requires OPENAI_API_KEY');
    }
    return new OpenAIAdapter(env.OPENAI_API_KEY);
  }

  if (env.MODEL_PROVIDER === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('MODEL_PROVIDER=anthropic requires ANTHROPIC_API_KEY');
    }
    return new AnthropicAdapter(env.ANTHROPIC_API_KEY);
  }

  return new MockAdapter();
}
