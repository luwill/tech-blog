/**
 * 博客内容管理 CLI —— Admin UI 移除后的唯一内容写入通路
 *
 * 用法:
 *   npm run post:publish -- <file.md> [--draft] [--dry-run]   发布/更新文章（按 slug upsert）
 *   npm run post:list -- [--drafts]                           列出文章
 *   npm run post:unpublish -- <slug>                          下线文章（转草稿）
 *   npm run post:delete -- <slug> --yes                       删除文章（必须显式 --yes）
 *   npm run post:export -- <slug> [outfile.md]                导出为带 frontmatter 的 markdown
 *
 * frontmatter 支持字段: title(必填), date, category, tags, excerpt, published, featured, slug
 * 中文标题的文件请在 frontmatter 里显式提供 slug。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { db } from '../src/lib/db'
import { parseFrontmatter, validateFrontmatter, slugFromFilename, toMarkdownFile } from '../src/lib/frontmatter'
import { calculateReadingTime, extractExcerpt, generateSlug } from '../src/lib/markdown'

async function resolveAuthorId(): Promise<string> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const byEmail = await db.user.findUnique({ where: { email: adminEmail } })
    if (byEmail) return byEmail.id
  }

  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    throw new Error('No admin user found. Run `npm run db:create-user` first.')
  }
  return admin.id
}

async function publish(args: string[]) {
  const dryRun = args.includes('--dry-run')
  const draft = args.includes('--draft')
  const file = args.find(a => !a.startsWith('--'))

  if (!file) {
    throw new Error('Usage: post:publish -- <file.md> [--draft] [--dry-run]')
  }

  const raw = await readFile(file, 'utf-8')
  const { frontmatter, content } = parseFrontmatter(raw)

  const validation = validateFrontmatter(frontmatter)
  if (!validation.isValid) {
    throw new Error(`Invalid frontmatter:\n  - ${validation.errors.join('\n  - ')}`)
  }
  if (!content.trim()) {
    throw new Error('Post content is empty')
  }

  const slug = frontmatter.slug || slugFromFilename(basename(file))
  if (!slug) {
    throw new Error('Cannot derive slug (non-ASCII filename?). Add `slug: "..."` to frontmatter.')
  }

  const published = draft ? false : frontmatter.published ?? true
  const excerpt = frontmatter.excerpt || extractExcerpt(content)
  const readTime = calculateReadingTime(content)
  const createdAt = frontmatter.date && !Number.isNaN(Date.parse(frontmatter.date))
    ? new Date(frontmatter.date)
    : undefined

  const existing = await db.post.findUnique({ where: { slug }, select: { id: true, title: true } })

  console.log(`${existing ? '🔄 Update' : '🆕 Create'}: "${frontmatter.title}"`)
  console.log(`   slug: ${slug} | published: ${published} | readTime: ${readTime}min`)
  console.log(`   category: ${frontmatter.category ?? '(none)'} | tags: ${frontmatter.tags?.join(', ') ?? '(none)'}`)

  if (dryRun) {
    console.log('🏜️  Dry run — no database writes.')
    return
  }

  const authorId = await resolveAuthorId()

  const categoryData = frontmatter.category
    ? {
        connectOrCreate: {
          where: { name: frontmatter.category },
          create: { name: frontmatter.category, slug: generateSlug(frontmatter.category) },
        },
      }
    : undefined

  const tagConnections = (frontmatter.tags ?? []).map(name => ({
    where: { name },
    create: { name, slug: generateSlug(name) || name.toLowerCase() },
  }))

  const shared = {
    title: frontmatter.title,
    excerpt,
    content,
    published,
    featured: frontmatter.featured ?? false,
    readTime,
    ...(categoryData ? { category: categoryData } : {}),
  }

  const post = existing
    ? await db.post.update({
        where: { slug },
        data: {
          ...shared,
          // 替换式更新标签，与 frontmatter 保持一致
          tags: { set: [], connectOrCreate: tagConnections },
        },
      })
    : await db.post.create({
        data: {
          ...shared,
          slug,
          author: { connect: { id: authorId } },
          tags: { connectOrCreate: tagConnections },
          ...(createdAt ? { createdAt } : {}),
        },
      })

  console.log(`✅ ${existing ? 'Updated' : 'Published'}: /blog/${post.slug}`)
}

async function list(args: string[]) {
  const draftsOnly = args.includes('--drafts')
  const posts = await db.post.findMany({
    where: draftsOnly ? { published: false } : {},
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, published: true, views: true, likes: true, createdAt: true },
  })

  if (posts.length === 0) {
    console.log(draftsOnly ? 'No drafts.' : 'No posts.')
    return
  }

  for (const p of posts) {
    const status = p.published ? '🟢' : '📝'
    const date = p.createdAt.toISOString().split('T')[0]
    console.log(`${status} ${date}  ${p.slug}  —  ${p.title}  (${p.views} views, ${p.likes} likes)`)
  }
  console.log(`\n${posts.length} post(s).`)
}

async function unpublish(args: string[]) {
  const slug = args.find(a => !a.startsWith('--'))
  if (!slug) throw new Error('Usage: post:unpublish -- <slug>')

  const post = await db.post.findUnique({ where: { slug }, select: { title: true } })
  if (!post) throw new Error(`Post not found: ${slug}`)

  await db.post.update({ where: { slug }, data: { published: false } })
  console.log(`📝 Unpublished: "${post.title}" (${slug})`)
}

async function remove(args: string[]) {
  const slug = args.find(a => !a.startsWith('--'))
  if (!slug) throw new Error('Usage: post:delete -- <slug> --yes')

  const post = await db.post.findUnique({ where: { slug }, select: { id: true, title: true } })
  if (!post) throw new Error(`Post not found: ${slug}`)

  if (!args.includes('--yes')) {
    console.log(`⚠️  Will DELETE "${post.title}" (${slug}) permanently, including its page views.`)
    console.log('   Re-run with --yes to confirm.')
    return
  }

  // 先清理外键引用，再删文章
  await db.pageView.deleteMany({ where: { postId: post.id } })
  await db.post.delete({ where: { slug } })
  console.log(`🗑️  Deleted: "${post.title}" (${slug})`)
}

async function exportPost(args: string[]) {
  const [slug, outfile] = args.filter(a => !a.startsWith('--'))
  if (!slug) throw new Error('Usage: post:export -- <slug> [outfile.md]')

  const post = await db.post.findUnique({
    where: { slug },
    include: { category: { select: { name: true } }, tags: { select: { name: true } } },
  })
  if (!post) throw new Error(`Post not found: ${slug}`)

  const markdown = toMarkdownFile(post)
  const target = outfile || `${slug}.md`
  await writeFile(target, markdown, 'utf-8')
  console.log(`📄 Exported to ${target}`)
}

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
  publish,
  list,
  unpublish,
  delete: remove,
  export: exportPost,
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  const handler = command ? COMMANDS[command] : undefined

  if (!handler) {
    console.log('Commands: publish <file.md> [--draft|--dry-run] | list [--drafts] | unpublish <slug> | delete <slug> --yes | export <slug> [outfile]')
    process.exitCode = command ? 1 : 0
    return
  }

  try {
    await handler(args)
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  } finally {
    await db.$disconnect()
  }
}

main()
