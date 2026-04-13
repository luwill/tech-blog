# CLAUDE.md

## Project

louwill 的个人技术博客。Next.js 15 + React 19 + TypeScript + Prisma + PostgreSQL，部署在 Vercel。

## Commands

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run lint             # ESLint 检查
npm run type-check       # TypeScript 类型检查
npm run db:push          # 同步 Prisma schema 到数据库
npm run db:generate      # 生成 Prisma Client
npm run db:studio        # 打开 Prisma Studio
```

## Architecture

- `src/app/` — App Router 页面和 API 路由
- `src/app/api/` — REST API (posts, categories, search, analytics, upload, auth)
- `src/components/` — React 组件 (ui/, blog/, editor/, admin/, layout/, providers/)
- `src/services/` — 业务逻辑层 (post, category, tag)
- `src/lib/` — 工具函数 (auth, db, seo, markdown, validations/, error-handler, env)
- `prisma/schema.prisma` — 数据模型: User, Post, Category, Tag, PageView, OnlineUser, SiteStats

## Key Patterns

- **认证**: NextAuth.js + Google OAuth, JWT session, ADMIN/VISITOR 角色, `ADMIN_EMAIL` 环境变量自动授权
- **API 验证**: Zod schemas in `src/lib/validations/`, 统一错误处理 via `ApiError` + `handleApiError()`
- **API 响应**: 标准信封格式, HTTP Cache-Control headers on GET endpoints
- **数据库**: Prisma singleton (`src/lib/db.ts`), server-only external package
- **样式**: Tailwind CSS v4 + CSS Modules, next-themes 主题切换
- **SEO**: JSON-LD 结构化数据 (`src/lib/seo.ts`), 动态 sitemap, robots.txt
- **编辑器**: @uiw/react-md-editor, 动态导入避免 SSR 问题
- **文件上传**: magic byte 验证 + 速率限制, 存储于 `/public/uploads/`
- **环境变量**: `src/lib/env.ts` 启动时验证, 类型安全导出

## Notes

- 构建时跳过 TypeScript/ESLint 错误检查 (内存优化, 见 `next.config.ts`)
- Vercel 构建使用 Turbopack + 16GB 内存限制
- Admin 路由保护在 `src/middleware.ts`
- 评论系统使用 Giscus (GitHub Discussions)
