/**
 * Environment variable validation and type-safe access
 * This module ensures required environment variables are present at startup
 */

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAIL',
] as const

// Optional environment variables with defaults
const optionalEnvVars = {
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
} as const

type RequiredEnvVar = typeof requiredEnvVars[number]
type OptionalEnvVar = keyof typeof optionalEnvVars

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
  // Required variables (guaranteed to exist after validation)
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL!,

  // Optional variables (with defaults)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || optionalEnvVars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || optionalEnvVars.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || optionalEnvVars.NEXT_PUBLIC_BASE_URL,

  // Computed values
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // OAuth availability check
  hasGoogleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
} as const

export type Env = typeof env
