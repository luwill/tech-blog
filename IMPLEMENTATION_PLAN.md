# 修复实施计划

> 依据 2026-07-02 项目评审报告（代码 + 功能双视角），按优先级 1→6 逐项修复。
> 状态标记：⬜ 未开始 / 🔄 进行中 / ✅ 完成 / ⏸️ 等待用户输入

## Stage 1 — 堵安全洞 ✅（2026-07-02 完成）

- [x] 搜索页 XSS：`highlightSearchTerm` 先做 HTML 转义再包 `<mark>`；搜索页无高亮分支改为纯文本渲染
- [x] Markdown XSS：`MDEditor.Markdown` 接入 `rehype-sanitize`（自定义 schema：保留高亮 class、`clobberPrefix: ''` 保 TOC 锚点）
- [x] 草稿泄露：`/api/posts` 移除 `?published=false` 逃生口，强制 `published: true`
- [x] 草稿泄露：`/api/posts/[id]` 补 `published: true` 过滤
- [x] 输入防御：`page`/`limit` NaN 防御与上限（limit ≤ 50，page ≥ 1）

验证记录：type-check ✅ / lint（本次改动文件无新增问题，存量 4 error 留 Stage 5）✅ / curl 实测草稿口、limit 钳制、NaN 防御 ✅ / 无头浏览器实测文章页渲染+代码高亮+TOC 锚点、搜索页转义与高亮共存 ✅
备注：发现数据质量问题——某文章 excerpt 含 `<mark>` 污染标签（现被安全转义显示），建议后续清理数据。

## Stage 2 — 补发文闭环（CLI）✅（2026-07-02 完成）

- [x] 新建 `scripts/post-cli.ts`：publish（按 slug upsert，分类/标签 connectOrCreate，自动 readTime/excerpt）、list、unpublish、delete（强制 `--yes`）、export（导出带 frontmatter 的 md）
- [x] 复用 `frontmatter.ts` + `markdown.ts` 现成工具；作者按 `ADMIN_EMAIL` → ADMIN 角色兜底解析
- [x] npm scripts：`post:publish/list/unpublish/delete/export`（经 `--env-file=.env.local` 加载数据库连接，修复了 tsx 脚本读不到 env 的存量问题）
- [x] 中文标题保护：slug 无法从文件名导出时报错提示在 frontmatter 显式指定
- [ ] 图片方案：Vercel Blob，移至 Stage 6
- 验证记录：type-check ✅ / `list` 实连数据库 ✅ / `publish --dry-run` 全流程 ✅ / 错误路径与删除保护 ✅
- ⏸️ 待用户执行真实写库往返测试（publish → list → delete --yes）

## Stage 3 — 修用户可见坏链 ✅（2026-07-02 完成）

- [x] 新建 `/about` 页面（终端风格，复用 i18n About 文案），并在 header 导航补充 About 入口
- [x] 删除 `next.config.ts` `/dashboard → /admin` 与 `vercel.json` `/admin/*` 两处死重定向
- [x] 新增 `src/app/not-found.tsx` 与 `error.tsx`
- [x] 移除 `blog-post-client.tsx` 的 `router.push('/404')`（改用组件内置的 Post not found 兜底；真 404 状态码待 Stage 4 服务端化后由 `notFound()` 提供）
- 验证记录：type-check ✅ / /about 200 ✅ / 未知路径 404 + 自定义页 ✅ / /dashboard 不再重定向 ✅

## Stage 4 — 渲染架构改造（SSR/ISR）✅（2026-07-02 完成）

- [x] 新建 `src/lib/posts.ts`：服务端查询集中管理，`getPublishedPost` 用 React cache() 让 metadata 与页面共享一次查询（消除重复查询）
- [x] 博客详情改 async Server Component + ISR（revalidate 300s）；正文进入 SSR HTML；假 slug 返回真 404（`notFound()`）
- [x] Markdown 渲染从 `@uiw/react-md-editor`(dynamic, ssr:false) 换成 `@uiw/react-markdown-preview` 静态导入——正文可服务端渲染，并甩掉编辑器 bundle
- [x] 浏览量剥离到 `POST /api/posts/slug/[slug]/view`，GET 读接口恢复幂等
- [x] 博客列表拆为 server page（全量摘要 + 分类真实计数）+ client 交互层，修复"只取前 10 篇"截断与分类计数失真；列表 payload 不再含文章全文
- [x] `generateStaticParams` 返回空（按需 ISR）：构建期并行 worker 会打满 Supabase 连接池（P1001，两次复现），列表页构建失败时也降级空壳由 ISR 补数据
- 验证记录：type-check ✅ / Turbopack 生产构建通过（路由表：/blog 5m revalidate、/blog/[slug] SSG）✅ / 生产模式实测正文 SSR、404、列表、About ✅ / 无头浏览器实测高亮+TOC+Giscus+view 上报 ✅
- 发现（留 Stage 5/6）：`postbuild: next-sitemap` 在 Vercel 上从不执行（vercel-build 不触发 postbuild 钩子），与 `app/sitemap.ts` 动态路由重复，`public/sitemap*.xml` 是陈旧残留；`/blog/[slug]` First Load JS 520kB 偏大，可后续拆分高亮/katex chunk

## Stage 5 — 大扫除 ✅（2026-07-02 完成，删除已获用户确认）

已完成（编辑类，无需确认）：
- [x] `lib/analytics.ts` 修剪死函数（`getAnalytics`/`getOnlineUsers` 暂以 DEPRECATED 标注保留——被待删组件 real-time-stats 引用，随其一起删）
- [x] `lib/error-handler.ts` 删除认证错误类、认证字符串分支、`handleAuthError`
- [x] `lib/constants.ts` 删除 `CONFIG.UPLOAD`、`ROLE`、死 TIME 键
- [x] `lib/i18n.ts` 删除 signIn/signOut/admin 死键（About 键现被 /about 页使用，保留）
- [x] `robots.ts` 清理 /admin /auth /uploads 残留
- [x] 重写 `CLAUDE.md`（真实架构：无认证、CLI 工作流、ISR、构建注意事项）与 `README.md`（含发文教程）

删除类（已执行）：
- [x] 死代码文件/目录：services/、5 个 lib 文件 + validations/、13 个死组件（含 layout.tsx 里死挂载的 Toaster，双引号 import 曾漏检）、terminal 3 件套及其孤儿 CSS、3 个调试页目录、4 个测试脚本
- [x] 旧架构文件：supabase-schema.sql、Dockerfile、.dockerignore、DEPLOYMENT*.md、AGENTS.md、next-sitemap.config.js、public/sitemap*.xml
- [x] 15 个死依赖（npm uninstall）+ `optimizePackageImports` 同步 + 移除 `postbuild`
- [ ] `.env.local` 的 NEXTAUTH/GOOGLE 键请用户自行删除（私密文件，不代动）
- 验证：type-check ✅ / lint 零警告 ✅ / Turbopack 生产构建 ✅（调试页从路由表消失，shared JS 203→198kB）

## Stage 6 — 长尾 🔄（代码项已完成）

- [x] 搜索大小写：全部 `contains` 加 `mode: 'insensitive'`（实测小写 llm 命中 LLM 内容）
- [x] RSS：`/feed.xml` route handler（RSS 2.0，XML 转义，ISR 1h，实测 3 items）
- [x] OG 图：`/og?title=` 动态生成（next/og，终端风格，CJK 字体按需子集加载，实测中文渲染正常）；`seo.ts` 默认图与文章 og:image 已接入
- [x] 恢复构建期 TS/ESLint 检查（修复 4 个存量 lint error；Turbopack + 16GB 构建实测通过）
- [x] 真限流：`lib/rate-limit.ts`（@upstash/ratelimit 滑动窗口，like 10/min、埋点 60/min，按 IP）已接入 3 个公开 POST 端点；未配环境变量时优雅放行 ⏸️ 待用户在 .env.local 与 Vercel 配置 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- [ ] 图片上传方案（Vercel Blob）：后续事项
- [ ] （可选）点赞去重；`OnlineUser` 表长期堆积需清理任务（可用 Vercel Cron）

## 全局注意事项

- 本项目无测试框架，全局 TDD/80% 覆盖率规则暂无法执行；如需补测试基建（Vitest），列为后续独立事项
- 每个 Stage 完成后运行 `type-check` + `lint` 验证；提交时机由用户决定
