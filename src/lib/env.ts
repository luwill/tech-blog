/**
 * Environment variable validation and type-safe access
 * This module ensures required environment variables are present at startup
 */

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
] as const

// Optional environment variables with defaults
const optionalEnvVars = {
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
} as const

// Validate required environment variables
function validateEnv(): void {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env file or environment configuration.`
    )
  }
}

// Validate on module load (in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  validateEnv()
}

// Type-safe environment variable access
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,

  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || optionalEnvVars.NEXT_PUBLIC_BASE_URL,

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
} as const

export type Env = typeof env
