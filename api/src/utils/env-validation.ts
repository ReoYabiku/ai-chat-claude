import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().refine((url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'), {
    message: 'DATABASE_URL must be a valid MongoDB connection string',
  }),

  // AI API
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('3001'),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((s) => s.trim()) : [])),

  // Rate Limiting
  REDIS_URL: z.string().url().optional(),
  RATE_LIMIT_MAX: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('100'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('60000'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
}

export const env = validateEnv();
