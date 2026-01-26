import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/error-handler'
import { requireAdminAccess } from '@/lib/auth-utils'

// Anonymize IP address for privacy (hide last octet)
function anonymizeIp(ip: string): string {
  if (!ip || ip === 'unknown') return ip
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
  }
  // Handle IPv6 by truncating
  if (ip.includes(':')) {
    return ip.split(':').slice(0, 4).join(':') + ':xxxx'
  }
  return ip
}

// Update online user status
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userAgent } = await request.json()
    
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Check if user agent is a bot
    const isBot = /bot|crawler|spider/i.test(userAgent || '')
    
    if (isBot) {
      return NextResponse.json({ success: true, message: 'Bot detected, not tracked' })
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }
    
    // Update or create online user record
    const onlineUser = await db.onlineUser.upsert({
      where: { sessionId },
      update: {
        lastActiveAt: new Date(),
        ipAddress: ip,
        userAgent,
      },
      create: {
        sessionId,
        ipAddress: ip,
        userAgent,
        firstActiveAt: new Date(),
        lastActiveAt: new Date(),
      },
    })
    
    return NextResponse.json({ success: true, id: onlineUser.id })
  } catch (error) {
    return handleApiError(error)
  }
}

// Get online users count (admin only)
export async function GET() {
  try {
    // Require admin authentication
    await requireAdminAccess()

    // Consider users online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const [onlineCount, recentVisitors] = await Promise.all([
      // Count of online users
      db.onlineUser.count({
        where: {
          lastActiveAt: {
            gte: fiveMinutesAgo,
          },
        },
      }),
      
      // Recent visitors details (for admin)
      db.onlineUser.findMany({
        where: {
          lastActiveAt: {
            gte: fiveMinutesAgo,
          },
        },
        select: {
          id: true,
          sessionId: true,
          firstActiveAt: true,
          lastActiveAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: {
          lastActiveAt: 'desc',
        },
        take: 50,
      }),
    ])
    
    // Clean up old records (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    await db.onlineUser.deleteMany({
      where: {
        lastActiveAt: {
          lt: oneHourAgo,
        },
      },
    })
    
    // Anonymize IP addresses before returning
    const anonymizedVisitors = recentVisitors.map(visitor => ({
      ...visitor,
      ipAddress: visitor.ipAddress ? anonymizeIp(visitor.ipAddress) : null,
      // Truncate sessionId for privacy (show only first 8 chars)
      sessionId: visitor.sessionId.substring(0, 8) + '...',
    }))

    return NextResponse.json({
      success: true,
      data: {
        onlineCount: Number(onlineCount),
        recentVisitors: anonymizedVisitors,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}