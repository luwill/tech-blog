import { db } from '../src/lib/db'

async function updateSiteStats() {
  try {
    console.log('📊 Updating site statistics...')
    
    const postCount = await db.post.count()
    console.log(`📝 Found ${postCount} posts`)
    
    const result = await db.siteStats.update({
      where: { id: 1 },
      data: { totalPosts: postCount }
    })
    
    console.log('✅ Site stats updated successfully:')
    console.log(`   - Total Posts: ${result.totalPosts}`)
    console.log(`   - Total Views: ${result.totalViews}`)
  } catch (error) {
    console.error('❌ Error updating site stats:', error)
  } finally {
    await db.$disconnect()
  }
}

updateSiteStats()