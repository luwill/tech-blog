import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/error-handler'
import { analyticsLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Track page view
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)

    if (!(await checkRateLimit(analyticsLimiter, ip))) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { path, title, userAgent } = await request.json()

    const isBot = /bot|crawler|spider/i.test(userAgent || '')

    if (isBot) {
      return NextResponse.json({ success: true, message: 'Bot detected, not tracked' })
    }

    const pageView = await db.pageView.create({
      data: {
        path,
        title,
        userAgent,
        ipAddress: ip,
        visitedAt: new Date(),
      },
    })

    await db.siteStats.upsert({
      where: { id: 1 },
      update: {
        totalViews: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        totalViews: 1,
        totalPosts: 0,
        totalCategories: 0,
        totalTags: 0,
      },
    })

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    return handleApiError(error)
  }
}
