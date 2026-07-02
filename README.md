# louwill.com — Tech Blog

LouWill（鲁工）的个人技术博客，聚焦 AI 算法与全栈开发。终端美学 UI，无后台、无认证，内容用本地 CLI 管理。

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · Prisma · PostgreSQL (Supabase) · Tailwind CSS v4 · Vercel

## 快速开始

```bash
npm install
cp .env.example .env.local   # 如无 example，手动创建并填入下方变量
npm run dev                  # http://localhost:3000
```

`.env.local` 需要：

| 变量 | 用途 |
|---|---|
| `DATABASE_URL` | Supabase pooler 连接串 |
| `ADMIN_EMAIL` | 发文 CLI 的作者解析 |
| `NEXT_PUBLIC_BASE_URL` | 站点地址（SEO/sitemap） |
| `NEXT_PUBLIC_GISCUS_*` | Giscus 评论（repo/repoId/category/categoryId） |

## 写文章

内容通过 CLI 直写数据库，markdown 文件带 frontmatter：

```markdown
---
title: "文章标题"
date: "2026-07-02"
category: "AI"
tags: ["LLM", "Agent"]
slug: "my-post-slug"        # 中文标题必填；英文文件名可省略
published: true              # 省略默认 true
---

正文 markdown……
```

```bash
npm run post:publish -- path/to/post.md          # 发布（slug 已存在则更新）
npm run post:publish -- path/to/post.md --draft  # 存为草稿
npm run post:list                                # 列出全部文章
npm run post:unpublish -- <slug>                 # 下线
npm run post:delete -- <slug> --yes              # 删除
npm run post:export -- <slug>                    # 导出回 markdown
```

## 常用命令

```bash
npm run type-check   # TS 检查
npm run lint         # ESLint
npm run db:studio    # Prisma Studio
npm run db:push      # 同步 schema
```

本地生产构建（普通 `next build` 会 OOM）：

```bash
NODE_OPTIONS='--max-old-space-size=16384' npx next build --turbopack
```

## 部署

推送到 main 后 Vercel 自动构建（`vercel-build` script）。页面走 ISR（5 分钟窗口），CLI 发文后线上最迟 5 分钟可见。

更多架构细节见 [CLAUDE.md](./CLAUDE.md)，修复进度见 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)。
