import { z } from 'zod';

// Validate environment once at boot. Fail loudly if anything is missing —
// better than a silent null pointer at 3am.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(3000),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  TOTP_ENCRYPTION_KEY: z
    .string()
    .length(64, 'TOTP_ENCRYPTION_KEY must be 64 hex chars (32 bytes)')
    .optional(),

  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL_PRIMARY: z.string().default('claude-sonnet-4-5'),
  ANTHROPIC_MODEL_FALLBACK: z.string().default('claude-haiku-4-5'),
  ANTHROPIC_DAILY_BUDGET_USD: z.coerce.number().default(50),

  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default('cyberscore-evidence'),
  R2_ENDPOINT: z.string().url().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('CyberScore <no-reply@cyberscore.app>'),

  EXPO_ACCESS_TOKEN: z.string().optional(),

  SENTRY_DSN: z.string().optional(),

  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().default(5),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().int().default(15 * 60 * 1000),

  AI_FREE_DAILY_CALLS: z.coerce.number().int().default(20),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Avoid `throw` wrapped in an extra Error class — the stack is clearer this way.
  console.error(`[env] Invalid environment variables:\n${issues}`);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
