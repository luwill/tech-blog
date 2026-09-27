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

---

# 第二期：技术博客 → 个人 IP 站（2026-09-27 立项）

> 定位：课程为主要转化目标，同时承载个人 IP；受众以国内为主。
> 依据：2026-09-14 项目评审 + 2026-09-27 需求确认。每个 Stage 开工前先给方案要点等确认（CLAUDE.md §8.5）。

## 已知事实（决定方案的输入）

- 线上现状：已发布 3 篇，分类表为空；课程页有 40 个小节，但**没有任何报名/购买入口**；公众号二维码藏在 footer 的弹窗里
- 公众号 vault：`/Users/louwill/Documents/wechat-article/AI编程实验室`，共 239 篇，时间跨度 2025-09-29 → 2026-09-24，正文中位数约 3900 字
  - 全部带 frontmatter（title/date/tags/status），**没有 slug**，文件名是中文 → 每篇需要生成英文 slug（§5.11）
  - **113 篇引用了 `mmbiz.qpic.cn` 图片，共 867 张**。微信图床有防盗链，外站直接引用会裂图，必须下载后转存
  - 正文开头带公众号导出残留（重复标题、"原创 louwill AI编程实验室 …"、原文地址），导入时要清掉
  - 标签 Top：claude-code 83 / vibe-coding 41 / agent 36 / codex 21 / skills 12 / 科研 12
  - vault 下还有一个独立的 `website/`（"AI编程实验室官网"，含 articles-data.js），与本站的关系待定
- 开源项目（月下载量，npm，2026-08-27 → 09-25）：
  - `token-watcher` v1.8.0，1491 次/月，面向各家 AI 编程 Agent 的本地 token 用量看板，repo `luwill/token-watcher`
  - `claude-code-model-router`（ccmr）v1.21.0，903 次/月，把 Claude Code 请求路由到多个模型的轻量网关，repo `luwill/Claude-Code-Model-Router`
- 飞书数据表（文章阅读数据）需要登录，⏸️ 待用户导出 CSV

## Stage 7 — 修地基 ✅（2026-09-27 完成，未提交）

- [x] 作者邮箱从公开 API 和文章页源码里移除（`lib/posts.ts` 与 4 个 API 路由去掉 `email` 字段，同步删掉类型定义）
- [x] `POST /api/posts/slug/[slug]/view` 接限流：新增 `viewLimiter`（同一 IP 每分钟 20 次），检查放在函数体最前面；非 P2025 错误改走 `handleApiError`
- [x] `like` 的查询和更新都补上 `published: true`；删除 `db:reset` script
- [x] `/blog` SSR 空壳：Suspense fallback 改为按默认筛选渲染完整列表（`BlogListView`），URL 筛选逻辑移到 `BlogListWithParams`
- [x] `sitemap.ts` 加 `revalidate = 3600`
- [x] `seo.ts` 新增 `SITE_LANGUAGE` / `OG_LOCALE` 常量，`<html lang>`、OG locale、`inLanguage` 统一为 zh-CN
- [x] `handleApiError` 在所有环境都记录完整错误，返回给客户端的 message 仍按环境脱敏

验证记录：type-check ✅ / lint ✅ / 16GB turbopack 构建 ✅（20 页，路由表无变化）/ 预渲染 `blog.html` 文章链接 0 → 3，`html lang="zh-CN"` ✅ / manifest：`/sitemap.xml` revalidate False → 3600 ✅ / `next start` 实测：文章页、`/api/search`、`/api/posts` 均无邮箱 ✅；like 不存在 id → 404 ✅；view 连续 22 次（用不存在的 slug，不写库）→ 前 20 次 404、第 21 次起 429 ✅；不存在文章 → 404 ✅
未做：暗/亮主题 × zh/en 的目视检查（§7.B）。`/blog` 默认视图的标记与改动前一致，风险低

## Stage 8 — 国内可访问性评估 ⬜（在大规模导入前完成）

- [ ] 在国内多地实测 louwill.com 的可达性与首屏时间（Vercel 在大陆不稳定，且无法备案）
- [ ] 根据结果选定：维持 Vercel / 前置国内 CDN / 迁移到国内托管。这个决定同时决定 Stage 9 图片转存到哪里

## Stage 9 — 文章精选与导入管线 ⬜

- [ ] 选文标准（待用户确认）：优先常青内容（教程、方法论、工作流），其次是与课程主题重合的内容（claude-code / vibe-coding / agent / skills）；时效性强的新闻快讯默认不收；再结合飞书阅读数据排序。首批目标 30–50 篇
- [ ] 导入脚本（放 `scripts/`，走 npm script）：清理导出残留 → 生成 slug → 图片下载并转存、改写链接 → 转成 post-cli 可用的 frontmatter → 先 `--dry-run` 全量检查
- [ ] 分类体系：用 4–6 个稳定分类替代空表（例如 Claude Code / Vibe Coding / Agent / AI 科研 / 观点），标签保持细粒度
- [ ] 保留 `createdAt` 为公众号原发日期；每篇文末附原文链接
- [ ] 真实写库需用户按清单批准（§3.5）

## Stage 10 — 个人 IP 枢纽 ⬜

- [ ] 首页改版：一句话定位 → 证据（课程、开源下载量、公众号）→ 精选文章 → 主 CTA（课程）
- [ ] `/projects` 页：token-watcher、ccmr，展示简介、安装命令、GitHub/npm 链接和下载量（构建期或 ISR 拉取 npm API）
- [ ] 文章末尾统一 CTA 区块：公众号二维码 + 课程入口
- [ ] `/links` 页：作为小红书/X/公众号主页链接的落地页，各入口带 UTM
- [ ] About 文案与首页定位统一

## Stage 11 — 课程转化页 ⬜

- [ ] 课程页补报名/购买出口（外链到现有售卖平台，不在站内做支付，保持 §0 "无后台、无认证"）
- [ ] 课程页补充：适合谁、能学到什么、试看内容、学员反馈

## Stage 12 — 统计与归因 ⬜

- [ ] 引入第三方统计替代自研埋点（新外部服务，需用户确认选型）；停掉双计
- [ ] 旧 `page_views` / `online_users` 表的存废由用户决定（DB 操作）

## 已确认（2026-09-27）

- 课程尚未上线，计划放在**飞书付费知识库**售卖。上线前课程页 CTA 用「关注公众号获取开课通知」，上线后换成知识库链接
- 选文标准与首批 30–50 篇：认可
- 阅读数据来源：飞书多维表格「AI编程实验室」里的「文章累计阅读」表，共 153 条。字段有发表日期、内容标题、阅读人数（全部 / 公众号消息 / 朋友圈 / 聊天会话 / 公众号主页 / 推荐 / 搜一搜 / 其他）、各渠道占比。表格是 canvas 渲染，页面上抓不到数据；自动化点击导出菜单会自己收起，所以需要用户手动导出 CSV

## 待用户决定

1. ⏸️ 导出「文章累计阅读」表为 CSV
2. vault 里的"AI编程实验室官网"和本站是什么关系：合并、互链，还是另有用途

## 全局注意事项

- 本项目无测试框架，全局 TDD/80% 覆盖率规则暂无法执行；如需补测试基建（Vitest），列为后续独立事项
- 每个 Stage 完成后运行 `type-check` + `lint` 验证；提交时机由用户决定
