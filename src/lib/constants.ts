/**
 * Application-wide constants
 * Centralized configuration to avoid magic numbers and strings
 */

export const CONFIG = {
  // Pagination settings
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
    DEFAULT_PAGE: 1,
  },

  // File upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    ALLOWED_IMAGE_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ] as const,
    UPLOAD_DIR: 'public/uploads',
  },

  // Content settings
  CONTENT: {
    READING_SPEED_WPM: 200, // Words per minute for reading time calculation
    EXCERPT_LENGTH: 160, // Characters
    TITLE_MAX_LENGTH: 100,
    SLUG_MAX_LENGTH: 200,
  },

  // Time intervals (in milliseconds)
  TIME: {
    ONLINE_USER_WINDOW: 5 * 60 * 1000, // 5 minutes
    ONLINE_USER_CLEANUP: 60 * 60 * 1000, // 1 hour
    AUTO_SAVE_INTERVAL: 30 * 1000, // 30 seconds
    ONLINE_STATUS_UPDATE: 60 * 1000, // 60 seconds
    SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  // API settings
  API: {
    RATE_LIMIT: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 100,
    },
  },

  // Analytics settings
  ANALYTICS: {
    MAX_RECENT_VISITORS: 50,
    VIEWS_BY_DAY_LIMIT: 30,
  },

  // Cache settings
  CACHE: {
    REVALIDATE_INTERVAL: 60, // seconds
    STATIC_REVALIDATE: 3600, // 1 hour
  },
} as const

// HTTP Status codes for consistency
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Error codes for API responses
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  CONFLICT: 'CONFLICT',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
