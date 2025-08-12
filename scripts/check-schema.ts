import { db } from '../src/lib/db'

async function checkSchema() {
  try {
    console.log('🔍 Checking PageView table schema...')
    
    const result = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'page_views'
      ORDER BY ordinal_position;
    `
    
    console.log('📊 PageView table columns:')
    console.table(result)
  } catch (error) {
    console.error('❌ Error checking schema:', error)
  } finally {
    await db.$disconnect()
  }
}

checkSchema()