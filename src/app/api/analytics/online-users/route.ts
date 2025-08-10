import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const onlineUser = await prisma.onlineUser.upsert({
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
    console.error('Error updating online user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update online status' },
      { status: 500 }
    )
  }
}

// Get online users count
export async function GET() {
  try {
    // Consider users online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const [onlineCount, recentVisitors] = await Promise.all([
      // Count of online users
      prisma.onlineUser.count({
        where: {
          lastActiveAt: {
            gte: fiveMinutesAgo,
          },
        },
      }),
      
      // Recent visitors details (for admin)
      prisma.onlineUser.findMany({
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
    await prisma.onlineUser.deleteMany({
      where: {
        lastActiveAt: {
          lt: oneHourAgo,
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        onlineCount,
        recentVisitors,
      },
    })
  } catch (error) {
    console.error('Error fetching online users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch online users' },
      { status: 500 }
    )
  }
}