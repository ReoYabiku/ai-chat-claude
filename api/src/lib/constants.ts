/**
 * AI Model Configuration
 *
 * IMPORTANT: Keep these in sync!
 * - Mastra provider config (mastra.ts)
 * - Metadata recording (chat.service.ts)
 */

export const AI_MODEL = {
  // Actual model used by Mastra
  PROVIDER_ID: 'anthropic/claude-sonnet-4-5-20250929',

  // Human-readable name for metadata/logs
  DISPLAY_NAME: 'claude-sonnet-4.5',

  // Full version for detailed tracking
  VERSION: 'claude-sonnet-4-5-20250929',
} as const;

export const AI_CONFIG = {
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  DEFAULT_SYSTEM_PROMPT:
    '親切で役立つ日本語アシスタントです。自然で分かりやすい回答を心がけてください。',
} as const;
