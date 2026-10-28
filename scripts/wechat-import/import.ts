/**
 * 公众号文章导入：vault markdown → 清洗 + 图片转存 Blob → 带 frontmatter 的 md 文件。
 * 本脚本不写数据库；产物交给 `npm run post:publish` 发布，CLI 仍是唯一写入通路。
 *
 * 用法:
 *   npm run post:import -- convert --vault <dir> --out <dir> [--only slug1,slug2] [--dry-run]
 *   npm run post:import -- rehost <file.md> --out <dir> [--dry-run]    已有文章（post:export 导出）只转存图片
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { z } from 'zod'
import { markImportStatus, parseFrontmatter, toMarkdownFile, type ImportStatus } from '../../src/lib/frontmatter'
import { cleanWechatMarkdown, buildExcerpt, normalizeTags, sourceFooter } from './clean'
import { rehostImages, listExternalImages, type ImageMap } from './images'

const MANIFEST_PATH = join(__dirname, 'manifest.json')
const IMAGE_MAP_FILE = 'image-map.json'

const ManifestSchema = z.object({
  categories: z.record(z.string(), z.object({ name: z.string().min(1) })),
  posts: z.array(z.object({
    file: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 只能是小写字母、数字和连字符'),
    category: z.string().min(1),
    title: z.string().min(1).optional(),
  })),
})
type Manifest = z.infer<typeof ManifestSchema>
type ManifestPost = Manifest['posts'][number]

interface Options {
  out: string
  dryRun: boolean
}

function readFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

async function loadManifest(): Promise<Manifest> {
  const manifest = ManifestSchema.parse(JSON.parse(await readFile(MANIFEST_PATH, 'utf-8')))
  const unknown = manifest.posts.filter((p) => !manifest.categories[p.category])
  if (unknown.length > 0) {
    throw new Error(`Unknown category in manifest: ${unknown.map((p) => `${p.slug}→${p.category}`).join(', ')}`)
  }
  const slugs = manifest.posts.map((p) => p.slug)
  const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i)
  if (dup.length > 0) throw new Error(`Duplicate slugs in manifest: ${dup.join(', ')}`)
  return manifest
}

async function loadImageMap(out: string): Promise<ImageMap> {
  try {
    return JSON.parse(await readFile(join(out, IMAGE_MAP_FILE), 'utf-8')) as ImageMap
  } catch {
    return {}
  }
}

async function processImages(content: string, slug: string, imageMap: ImageMap, opts: Options) {
  if (opts.dryRun) {
    return { content, imageMap, summary: `${listExternalImages(content).length} external image(s), not uploaded (dry run)`, failed: [] }
  }
  const r = await rehostImages(content, slug, imageMap)
  return { content: r.content, imageMap: r.imageMap, summary: `uploaded ${r.uploaded}, reused ${r.reused}`, failed: r.failed }
}

function importStatus(opts: Options, failed: string[]): ImportStatus {
  return opts.dryRun ? 'preview' : failed.length > 0 ? 'failed' : 'ready'
}

async function convertPost(post: ManifestPost, manifest: Manifest, vault: string, imageMap: ImageMap, opts: Options) {
  const raw = await readFile(join(vault, post.file), 'utf-8')
  const { frontmatter, content: body } = parseFrontmatter(raw)
  const cleaned = cleanWechatMarkdown(body)
  const title = post.title ?? cleaned.headingTitle ?? frontmatter.title
  const images = await processImages(cleaned.content, post.slug, imageMap, opts)
  const category = { name: manifest.categories[post.category].name, slug: post.category }

  const markdown = toMarkdownFile({
    title,
    content: images.content + sourceFooter(cleaned.sourceUrl),
    createdAt: frontmatter.date,
    category,
    tags: normalizeTags(frontmatter.tags ?? []).map((name) => ({ name })),
    excerpt: buildExcerpt(cleaned.content),
    published: true,
    featured: false,
    slug: post.slug,
  })
  const status = importStatus(opts, images.failed)
  await writeFile(join(opts.out, `${post.slug}.md`), markImportStatus(markdown, status), 'utf-8')

  const note = cleaned.sourceUrl ? '' : ' | no source URL'
  console.log(`${status === 'ready' ? '✅' : '⚠️'} ${post.slug} [${status}] — ${title}\n   images: ${images.summary}${note}`)
  images.failed.forEach((f) => console.log(`   ⚠️  image failed: ${f}`))
  return { imageMap: images.imageMap, failed: images.failed.length }
}

async function convert(args: string[], opts: Options) {
  const vault = readFlag(args, '--vault')
  if (!vault) throw new Error('Missing --vault <dir>')
  const only = readFlag(args, '--only')?.split(',').map((s) => s.trim())

  const manifest = await loadManifest()
  const posts = only ? manifest.posts.filter((p) => only.includes(p.slug)) : manifest.posts
  let imageMap = await loadImageMap(opts.out)
  let failedTotal = 0

  // 顺序处理：图片映射要在文章之间累积，也避免同时打爆微信图床
  for (const post of posts) {
    try {
      const r = await convertPost(post, manifest, vault, imageMap, opts)
      imageMap = r.imageMap
      failedTotal += r.failed
    } catch (error) {
      failedTotal++
      console.log(`❌ ${post.slug} (${post.file}): ${error instanceof Error ? error.message : error}`)
    }
    if (!opts.dryRun) await writeFile(join(opts.out, IMAGE_MAP_FILE), JSON.stringify(imageMap, null, 2), 'utf-8')
  }

  console.log(`\n${posts.length} post(s) → ${opts.out}${opts.dryRun ? ' (dry run, images untouched)' : ''}; failures: ${failedTotal}`)
  if (failedTotal > 0) process.exitCode = 1
}

async function rehost(args: string[], opts: Options) {
  const file = args.find((a) => !a.startsWith('--') && a !== readFlag(args, '--out'))
  if (!file) throw new Error('Usage: post:import -- rehost <file.md> --out <dir>')

  const raw = await readFile(file, 'utf-8')
  const { frontmatter, content } = parseFrontmatter(raw)
  if (!frontmatter.slug) throw new Error('rehost needs a file with `slug` in frontmatter (use post:export)')

  const imageMap = await loadImageMap(opts.out)
  const images = await processImages(content, frontmatter.slug, imageMap, opts)
  const status = importStatus(opts, images.failed)
  const metadata = raw.match(/^(---\s*\n[\s\S]*?\n---)\s*\n/)?.[1]
  if (!metadata) throw new Error('rehost needs valid frontmatter')
  const markdown = `${metadata}\n\n${images.content}`
  await writeFile(join(opts.out, basename(file)), markImportStatus(markdown, status), 'utf-8')
  if (!opts.dryRun) await writeFile(join(opts.out, IMAGE_MAP_FILE), JSON.stringify(images.imageMap, null, 2), 'utf-8')

  console.log(`${status === 'ready' ? '✅' : '⚠️'} ${frontmatter.slug} [${status}]: ${images.summary}`)
  images.failed.forEach((f) => console.log(`   ⚠️  image failed: ${f}`))
  if (images.failed.length > 0) process.exitCode = 1
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  const out = readFlag(args, '--out')
  const dryRun = args.includes('--dry-run')
  const handlers: Record<string, (a: string[], o: Options) => Promise<void>> = { convert, rehost }
  const handler = command ? handlers[command] : undefined

  if (!handler || !out) {
    console.log('Usage: post:import -- convert --vault <dir> --out <dir> [--only a,b] [--dry-run] | rehost <file.md> --out <dir> [--dry-run]')
    process.exitCode = 1
    return
  }
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('❌ BLOB_READ_WRITE_TOKEN is not set in .env.local (needed to upload images). Use --dry-run to preview.')
    process.exitCode = 1
    return
  }

  try {
    // dry-run 产物不覆盖已经转存完成的文件。
    const outputDirectory = dryRun ? join(out, 'preview') : out
    await mkdir(outputDirectory, { recursive: true })
    await handler(args, { out: outputDirectory, dryRun })
  } catch (error) {
    console.log(`❌ ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  }
}

main()
