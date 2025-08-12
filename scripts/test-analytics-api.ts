import { db } from '../src/lib/db'

async function testAnalyticsQueries() {
  try {
    console.log('🧪 Testing analytics queries...')
    
    // Test simple count queries
    const postCount = await db.post.count()
    console.log('📝 Post count:', typeof postCount, postCount)
    
    const onlineCount = await db.onlineUser.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    })
    console.log('👥 Online count:', typeof onlineCount, onlineCount)
    
    // Test raw query
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const viewTrends = await db.$queryRaw`
      SELECT 
        DATE("visitedAt") as date,
        COUNT(*) as views,
        COUNT(DISTINCT "ipAddress") as unique_views
      FROM page_views 
      WHERE "visitedAt" >= ${startDate}
      GROUP BY DATE("visitedAt")
      ORDER BY date ASC
      LIMIT 5
    `
    
    console.log('📊 View trends query result:')
    console.log('Type:', typeof viewTrends)
    console.log('Content:', viewTrends)
    
    // Test data conversion
    if (Array.isArray(viewTrends)) {
      const converted = viewTrends.map((trend: any) => ({
        date: trend.date,
        views: Number(trend.views),
        unique_views: Number(trend.unique_views),
      }))
      console.log('🔄 Converted data:', converted)
    }
    
    console.log('✅ All analytics queries working!')
    
  } catch (error) {
    console.error('❌ Error testing analytics queries:', error)
  } finally {
    await db.$disconnect()
  }
}

testAnalyticsQueries()