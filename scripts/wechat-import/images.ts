/**
 * 文章图片转存：下载外链图片 → 压缩为 WebP → 上传 Vercel Blob → 改写链接。
 * 微信图床带防盗链、GitHub 图片在国内约三到四成节点打不开（Stage 8 实测），
 * 所以正文里除 Blob 自身以外的外链图片一律转存。
 */
import { createHash } from 'node:crypto'
import { put } from '@vercel/blob'
import sharp from 'sharp'

const IMAGE_RE = /!\[([^\]]*)\]\((\S+?)(?:\s+"[^"]*")?\)/g
const BLOB_HOST_SUFFIX = '.blob.vercel-storage.com'
const MAX_WIDTH = 1600
const WEBP_QUALITY = 80
const DOWNLOAD_TIMEOUT_MS = 20_000
const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
// 不带 Referer 请求微信图床才能拿到原图；UA 用常见浏览器即可
const DOWNLOAD_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
}

/** 原始 URL → Blob URL，跨文章、跨运行复用，避免重复上传 */
export type ImageMap = Readonly<Record<string, string>>

export interface RehostResult {
  content: string
  imageMap: ImageMap
  uploaded: number
  reused: number
  failed: string[]
}

export function listExternalImages(content: string): string[] {
  const urls = [...content.matchAll(IMAGE_RE)].map((m) => m[2])
  return [...new Set(urls.filter(isExternalImage))]
}

function isExternalImage(url: string): boolean {
  if (!/^https?:\/\//.test(url)) return false
  return !new URL(url).hostname.endsWith(BLOB_HOST_SUFFIX)
}

export async function rehostImages(
  content: string,
  slug: string,
  imageMap: ImageMap,
): Promise<RehostResult> {
  const urls = listExternalImages(content)
  const additions: Record<string, string> = {}
  const failed: string[] = []
  let reused = 0

  for (const url of urls) {
    if (imageMap[url]) {
      reused++
      continue
    }
    try {
      additions[url] = await uploadImage(url, slug)
    } catch (error) {
      failed.push(`${url} — ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const nextMap: ImageMap = { ...imageMap, ...additions }
  const rewritten = content.replace(IMAGE_RE, (whole, alt: string, url: string) =>
    nextMap[url] ? `![${cleanAlt(alt)}](${nextMap[url]})` : whole
  )

  return { content: rewritten, imageMap: nextMap, uploaded: Object.keys(additions).length, reused, failed }
}

// 公众号导出的 alt 基本是无意义的「图片」
function cleanAlt(alt: string): string {
  return alt === '图片' ? '' : alt
}

async function uploadImage(url: string, slug: string): Promise<string> {
  const original = await download(url)
  const webp = await toWebp(original)
  const hash = createHash('sha256').update(original).digest('hex').slice(0, 12)
  const blob = await put(`posts/${slug}/${hash}.webp`, webp, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    access: 'public',
    contentType: 'image/webp',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: CACHE_MAX_AGE_SECONDS,
  })
  return blob.url
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: DOWNLOAD_HEADERS,
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    redirect: 'follow',
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const type = response.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) {
    throw new Error(`not an image (content-type: ${type || 'unknown'})`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function toWebp(input: Buffer): Promise<Buffer> {
  // animated: true 保留 GIF 动图的多帧
  return sharp(input, { animated: true })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()
}
