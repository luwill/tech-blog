import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/error-handler'
import { analyticsLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Update online user status
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)

    if (!(await checkRateLimit(analyticsLimiter, ip))) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { sessionId, userAgent } = await request.json()

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
