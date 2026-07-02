import { getPublishedPostSummaries } from '@/lib/posts'

// RSS 2.0 订阅源，ISR 每小时再生
export const revalidate = 3600

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.louwill.com'

  let posts: Awaited<ReturnType<typeof getPublishedPostSummaries>> = []
  try {
    posts = await getPublishedPostSummaries()
  } catch (error) {
    console.error('Error generating RSS feed:', error)
  }

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`
      const categories = [
        ...(post.category ? [post.category.name] : []),
        ...post.tags.map((tag) => tag.name),
      ]
        .map((name) => `      <category>${escapeXml(name)}</category>`)
        .join('\n')

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
${categories}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LouWill's Tech Blog</title>
    <link>${baseUrl}</link>
    <description>AI algorithms, full-stack development, and technology insights by LouWill</description>
    <language>zh-cn</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
