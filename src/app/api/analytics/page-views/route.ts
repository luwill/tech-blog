import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/error-handler'

// Track page view
export async function POST(request: NextRequest) {
  try {
    const { path, title, userAgent } = await request.json()

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

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
