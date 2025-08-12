import { db } from '../src/lib/db'

async function initializeSiteStats() {
  try {
    console.log('🔍 Checking existing site stats...')
    
    const existing = await db.siteStats.findFirst({ where: { id: 1 } })
    
    if (!existing) {
      console.log('📊 Creating initial site stats...')
      
      // Count existing posts
      const postCount = await db.post.count()
      
      await db.siteStats.create({
        data: {
          id: 1,
          totalViews: 0,
          totalPosts: postCount,
          totalCategories: 0,
          totalTags: 0
        }
      })
      
      console.log('✅ SiteStats initialized successfully')
      console.log(`📝 Total posts: ${postCount}`)
    } else {
      console.log('📊 SiteStats already exists:')
      console.log(`   - Total Views: ${existing.totalViews}`)
      console.log(`   - Total Posts: ${existing.totalPosts}`)
      console.log(`   - Total Categories: ${existing.totalCategories}`)
      console.log(`   - Total Tags: ${existing.totalTags}`)
    }
  } catch (error) {
    console.error('❌ Error initializing site stats:', error)
  } finally {
    await db.$disconnect()
  }
}

initializeSiteStats()