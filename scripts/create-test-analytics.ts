import { db } from '../src/lib/db'

async function createTestAnalytics() {
  try {
    console.log('📊 Creating test analytics data...')
    
    // Create some sample page views
    const testViews = [
      {
        path: '/',
        title: 'LouWill\'s Tech Blog - Home',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      },
      {
        path: '/blog/welcome-to-my-tech-blog',
        title: 'Welcome to My Tech Blog',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        path: '/',
        title: 'LouWill\'s Tech Blog - Home',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      }
    ]
    
    for (const view of testViews) {
      await db.pageView.create({
        data: view
      })
    }
    
    console.log(`✅ Created ${testViews.length} test page views`)
    
    // Update site stats
    await db.siteStats.update({
      where: { id: 1 },
      data: {
        totalViews: {
          increment: testViews.length
        }
      }
    })
    
    console.log('📈 Updated site stats')
    
    // Create some online user records
    await db.onlineUser.createMany({
      data: [
        {
          sessionId: 'session_test_1',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          firstActiveAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
          lastActiveAt: new Date(Date.now() - 1000 * 30), // 30 seconds ago
        },
        {
          sessionId: 'session_test_2',
          ipAddress: '192.168.1.4',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          firstActiveAt: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
          lastActiveAt: new Date(), // now
        }
      ]
    })
    
    console.log('👥 Created test online users')
    console.log('🎉 Test analytics data created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating test analytics:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestAnalytics()