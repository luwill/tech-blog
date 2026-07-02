import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * 基于 Upstash Redis 的分布式限流（serverless 多实例下共享状态）。
 * 兼容两套环境变量命名：
 * - Vercel Marketplace 集成自动注入的 KV_REST_API_URL / KV_REST_API_TOKEN
 * - Upstash 原生的 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * 两者都未配置时优雅降级为放行（本地开发友好）。
 */
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

function createLimiter(requests: number, prefix: string): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, '1 m'),
    prefix: `rl:${prefix}`,
  })
}

// 点赞：同一 IP 每分钟 10 次
export const likeLimiter = createLimiter(10, 'like')
// 埋点（page-views / online-users）：同一 IP 每分钟 60 次
export const analyticsLimiter = createLimiter(60, 'analytics')

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

/** 返回 true 表示放行；false 表示已超限，调用方应返回 429 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return true
  try {
    const { success } = await limiter.limit(identifier)
    return success
  } catch (error) {
    // Redis 故障时不阻塞正常请求
    console.error('Rate limit check failed:', error)
    return true
  }
}
