# louwill.com — Tech Blog

LouWill（鲁工）的个人技术博客，聚焦 AI 算法与全栈开发。终端美学 UI，无后台、无认证，内容用本地 CLI 管理。

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · Prisma · PostgreSQL (Supabase) · Tailwind CSS v4 · Vercel

## 快速开始

Node.js 需要 20.19+（建议使用当前 LTS）。安全补丁后的 sharp 需要 Node 20+。

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
npm run test:regression # Node 内置测试：安全输出、分页、frontmatter、导入发布保护；不连接真实 DB
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

## 公众号导入产物

`post:import convert/rehost --dry-run --out <dir>` 把预览写入 `<dir>/preview/`，不会覆盖已经完成迁图的产物。预览带 `importStatus: preview`，迁图失败带 `importStatus: failed`；两者都强制为草稿，发布 CLI 在任何数据库查询之前拒绝它们。完成迁图后生成 `importStatus: ready`，再按原发布流程审批并发文。

Frontmatter 使用 YAML 1.2，带引号的 `"true"`/`"123"` 保持字符串，标签可含逗号。published/featured 使用未加引号的布尔值；重复键、别名及错误字段类型会被拒绝。

## 安全维护

Next 保持 15.x，Prisma 保持 6.x。package.json 的 overrides 为 Prisma 配置层使用已修复的 deepmerge-ts，并更新 PostCSS、nanoid 和 source-map-js 的安全版本；升级上游依赖时须重新审计这些约束。

Blob SDK 固定为 2.4.0，移除 2.8.x 引入的 OIDC/CLI 配置依赖链；本项目只使用显式 BLOB_READ_WRITE_TOKEN，WebP 上传、覆盖和缓存参数均有模拟服务回归验证。升级 SDK 时须重新检查这条依赖链及上传参数兼容性。

数据库密码切换步骤见 [CREDENTIAL_ROTATION.md](./CREDENTIAL_ROTATION.md)。轮换与线上部署需要独立执行，本地修复不会使远程泄露的旧密码自动失效。
