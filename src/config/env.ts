import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  GITHUB_WEBHOOK_SECRET: z.string().min(16),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_PRIVATE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  MODEL_PROVIDER: z.enum(['mock', 'openai', 'anthropic', 'local']).default('mock'),
  MODEL_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  MODEL_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  AUTOFIX_DRY_RUN: z.coerce.boolean().default(false),
  OLLAMA_BASE_URL: z.string().url().optional(),
  LOCAL_MODEL: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): AppEnv {
  const normalized = {
    ...raw,
    GITHUB_PRIVATE_KEY: raw.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  return envSchema.parse(normalized);
}
