import { z } from 'zod';

export const rulesSchema = z.object({
  maxFiles: z.number().int().positive().default(80),
  blockedPatterns: z.array(z.string()).default(['*.pem', '*.key', '.env*']),
  requiredChecks: z.array(z.string()).default(['tests', 'lint']),
  commentStyle: z.enum(['concise', 'detailed']).default('concise')
});

export type RulesConfig = z.infer<typeof rulesSchema>;
