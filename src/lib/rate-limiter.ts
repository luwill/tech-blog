import { NextRequest } from 'next/server'
import { RateLimitError } from './error-handler'

/**
 * Simple in-memory rate limiter using sliding window algorithm
 * For production with multiple instances, use Redis-based solution (e.g., @upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimiterConfig {
  windowMs: number  // Time window in milliseconds
  max: number       // Maximum requests per window
}

// In-memory store for rate limit entries
const store = new Map<string, RateLimitEntry>()

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000

// Periodic cleanup of expired entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  // Check common headers for real IP (when behind proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - this may not work in all environments
  return '127.0.0.1'
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(config: RateLimiterConfig) {
  const { windowMs, max } = config

  return {
    /**
     * Check if request is rate limited
     * @returns { success: boolean, remaining: number, reset: number }
     */
    check(request: NextRequest, identifier?: string): {
      success: boolean
      remaining: number
      reset: number
    } {
      const key = identifier || getClientIp(request)
      const now = Date.now()

      // Get or create entry
      let entry = store.get(key)

      if (!entry || entry.resetAt < now) {
        // Create new entry
        entry = {
          count: 1,
          resetAt: now + windowMs
        }
        store.set(key, entry)

        return {
          success: true,
          remaining: max - 1,
          reset: entry.resetAt
        }
      }

      // Increment count
      entry.count++

      if (entry.count > max) {
        return {
          success: false,
          remaining: 0,
          reset: entry.resetAt
        }
      }

      return {
        success: true,
        remaining: max - entry.count,
        reset: entry.resetAt
      }
    },

    /**
     * Middleware function that throws RateLimitError if limit exceeded
     */
    async limit(request: NextRequest, identifier?: string): Promise<void> {
      const result = this.check(request, identifier)

      if (!result.success) {
        throw new RateLimitError(
          `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds`
        )
      }
    }
  }
}

// Pre-configured rate limiters for common use cases

/**
 * General API rate limiter (100 requests per minute)
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 100
})

/**
 * Auth rate limiter (10 requests per minute)
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 10
})

/**
 * Upload rate limiter (5 uploads per minute)
 */
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 5
})

/**
 * Search rate limiter (30 requests per minute)
 */
export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 30
})

/**
 * Analytics rate limiter (20 requests per minute)
 */
export const analyticsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 20
})
