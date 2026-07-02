# CLAUDE.md

## Project

louwill 的个人技术博客。Next.js 15 (App Router) + React 19 + TypeScript + Prisma + PostgreSQL (Supabase)，部署在 Vercel。

**无后台、无认证**：Admin UI 与 NextAuth 已整体移除，所有内容写入通过本地 CLI 完成（见 Content Workflow）。

## Commands

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建（本地需 NODE_OPTIONS 大内存 + --turbopack，见 Notes）
npm run lint             # ESLint 检查
npm run type-check       # TypeScript 类型检查
npm run db:push          # 同步 Prisma schema 到数据库
npm run db:generate      # 生成 Prisma Client
npm run db:studio        # 打开 Prisma Studio

# 内容管理 CLI（唯一写入通路，自动加载 .env.local）
npm run post:publish -- <file.md> [--draft|--dry-run]   # 发布/更新（按 slug upsert）
npm run post:list -- [--drafts]                          # 列出文章
npm run post:unpublish -- <slug>                         # 转草稿
npm run post:delete -- <slug> --yes                      # 删除（必须 --yes）
npm run post:export -- <slug> [outfile.md]               # 导出为 markdown
```

## Architecture

- `src/app/` — 页面：`/`、`/blog`（Server Component + ISR 300s）、`/blog/[slug]`（按需 ISR，`generateStaticParams` 故意返回空，因构建期并行 worker 会打满 Supabase 连接池）、`/search`（客户端）、`/course`、`/about`
- `src/app/api/` — 只读 REST（posts/categories/search，公开接口只返回 published）+ 三个匿名 POST（`posts/[id]/like`、`posts/slug/[slug]/view` 浏览量上报、`analytics/*` 埋点）。**无内容写入端点**
- `src/lib/posts.ts` — 服务端查询层；`getPublishedPost` 用 React cache() 供 page 与 generateMetadata 共享
- `src/lib/` — db (Prisma singleton)、seo (JSON-LD)、markdown、frontmatter (CLI 用)、search、analytics (客户端埋点)、error-handler
- `scripts/post-cli.ts` — 内容管理 CLI，复用 lib/frontmatter + lib/markdown
- `prisma/schema.prisma` — User(仅作者解析)、Post、Category、Tag、PageView、OnlineUser、SiteStats

## Key Patterns

- **内容渲染**: `@uiw/react-markdown-preview` 静态导入（服务端可渲染，正文进 SSR HTML）+ `rehype-sanitize`（自定义 schema：保留高亮 class，`clobberPrefix: ''` 保 TOC 锚点）
- **XSS 防线**: 搜索高亮先 HTML 转义（`lib/search.ts` `escapeHtml`）；Markdown 输出走 sanitize 白名单
- **浏览量**: 读接口幂等，自增走独立 `POST .../view`，由客户端 useEffect 上报
- **样式**: Tailwind CSS v4 + CSS Modules，next-themes 主题切换，终端美学（TerminalWindow 等）
- **SEO**: JSON-LD (`lib/seo.ts`)、动态 sitemap (`app/sitemap.ts`)、robots.txt
- **评论**: Giscus（`NEXT_PUBLIC_GISCUS_*` 环境变量）
- **i18n**: 纯客户端切换（locale-provider + `lib/i18n.ts`），仅覆盖 UI 文案

## Notes

- 本地生产构建：`NODE_OPTIONS='--max-old-space-size=16384' npx next build --turbopack`（普通 `next build` 会 OOM）
- Vercel 构建走 `vercel-build` script；注意 npm 的 `postbuild` 钩子在 `vercel-build` 下不触发
- 发布文章 frontmatter 必填 `title`，中文标题需显式给 `slug`；作者按 `ADMIN_EMAIL` → 首个 ADMIN 用户解析
- 环境变量：`DATABASE_URL`（Supabase pooler）、`ADMIN_EMAIL`、`NEXT_PUBLIC_BASE_URL`、`NEXT_PUBLIC_GISCUS_*`
