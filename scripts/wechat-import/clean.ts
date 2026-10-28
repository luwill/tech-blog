/**
 * 公众号导出 markdown 的清洗：去掉导出残留，提取原文地址、发布标题和摘要。
 * 全部是纯函数，不做 IO。
 */

export interface CleanResult {
  content: string
  /** 正文开头 setext/atx 一级标题，即公众号发布时的标题（vault 自写稿没有） */
  headingTitle?: string
  sourceUrl?: string
}

const SOURCE_URL_RE = /^>\s*原文地址:\s*\[?(https:\/\/mp\.weixin\.qq\.com\/s\/[^\]\s)]+)/m
const SOURCE_LINE_RE = /^>\s*原文地址:.*$/m
// 「原创 鲁工 AI编程实验室 2026-03-02 10:35 浙江」这类署名行
const BYLINE_RE = /^原创\s+\S+\s+AI编程实验室\s+\d{4}-\d{2}-\d{2}.*$/m
// 文末签名：「感谢您阅读我的文章。我是鲁工……交个朋友。」+ 个人微信二维码，多种变体
const SIGNATURE_RE = /(感谢您阅读我的文章。?\s*)?我是鲁工，[八九]年AI算法老兵/g
const THANKS_ONLY_RE = /\n\s*感谢您阅读我的文章。?\s*$/
// 签名只在文末这段范围内才截断，防止正文里的自我介绍把整篇删掉
const SIGNATURE_TAIL_WINDOW = 800
// 1px 透明占位图、未补的图片占位
const JUNK_IMAGE_RE = /!\[[^\]]*\]\((?:data:image\/svg\+xml[^)]*|待补充)\)\s*/g

export function cleanWechatMarkdown(raw: string): CleanResult {
  const sourceUrl = raw.match(SOURCE_URL_RE)?.[1]
  const { body, headingTitle } = stripLeadingHeading(raw)

  const content = stripTailSignature(body)
    .replace(SOURCE_LINE_RE, '')
    .replace(BYLINE_RE, '')
    .replace(THANKS_ONLY_RE, '')
    .replace(JUNK_IMAGE_RE, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { content, headingTitle, sourceUrl }
}

function stripTailSignature(text: string): string {
  const matches = [...text.matchAll(SIGNATURE_RE)]
  const last = matches.at(-1)
  if (!last || last.index === undefined) return text
  if (text.length - last.index > SIGNATURE_TAIL_WINDOW) return text
  return text.slice(0, last.index).replace(THANKS_ONLY_RE, '')
}

/** 去掉正文开头与标题重复的一级标题（setext `===` 或 `# `），返回标题文本 */
function stripLeadingHeading(raw: string): { body: string; headingTitle?: string } {
  const text = raw.replace(/^\s+/, '')
  const setext = text.match(/^([^\n]+)\n=+\s*\n/)
  if (setext) {
    return { body: text.slice(setext[0].length), headingTitle: setext[1].trim() }
  }
  const atx = text.match(/^#\s+([^\n]+)\n/)
  if (atx) {
    // 原稿偶有 `# #标题` 这种多敲的 #
    return { body: text.slice(atx[0].length), headingTitle: atx[1].replace(/^#+\s*/, '').trim() }
  }
  return { body: raw }
}

const GREETING_RE = /^大家好，我是鲁工。?$/

/** 取正文第一段有信息量的文字做摘要（跳过问候语、图片、标题、引用、代码） */
export function buildExcerpt(content: string, maxLength = 120): string {
  const paragraph = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) =>
      p.length > 0 &&
      !GREETING_RE.test(p) &&
      !p.startsWith('!') &&
      !p.startsWith('#') &&
      !p.startsWith('>') &&
      !p.startsWith('```') &&
      !/^[-=*_]{3,}$/.test(p)
    ) ?? ''

  const plain = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain
}

const DROPPED_TAGS = new Set(['未分类'])

/** 标签统一小写去重：DB 里 tag.slug 唯一，"Claude" 和 "claude" 会撞 slug */
export function normalizeTags(tags: readonly string[]): string[] {
  const normalized = tags
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && !DROPPED_TAGS.has(t))
  return [...new Set(normalized)]
}

export function sourceFooter(sourceUrl?: string): string {
  const link = sourceUrl ? `，[阅读原文](${sourceUrl})` : ''
  return `\n\n---\n\n> 本文首发于微信公众号「AI编程实验室」${link}`
}
