import type { AppEnv } from '../config/env.js';
import type { ModelAdapter } from './adapter.js';
import { AnthropicAdapter, LocalOllamaAdapter, MockAdapter, OpenAIAdapter } from './adapter.js';

export function createModelAdapter(env: AppEnv): ModelAdapter {
  const retryOptions = {
    timeoutMs: env.MODEL_TIMEOUT_MS,
    maxRetries: env.MODEL_MAX_RETRIES
  };

  if (env.MODEL_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      throw new Error('MODEL_PROVIDER=openai requires OPENAI_API_KEY');
    }
    return new OpenAIAdapter(env.OPENAI_API_KEY, retryOptions);
  }

  if (env.MODEL_PROVIDER === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('MODEL_PROVIDER=anthropic requires ANTHROPIC_API_KEY');
    }
    return new AnthropicAdapter(env.ANTHROPIC_API_KEY, retryOptions);
  }

  if (env.MODEL_PROVIDER === 'local') {
    return new LocalOllamaAdapter(
      env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      env.LOCAL_MODEL ?? 'qwen2.5-coder:7b',
      retryOptions
    );
  }

  return new MockAdapter();
}
