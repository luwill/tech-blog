# Code Review 报告

## 高优先级问题
- [Bug] `src/app/api/posts/slug/[slug]/route.ts:12`：`prisma.post.findUnique` 的 `where` 条件同时包含 `slug` 和 `published`，Prisma 的 `findUnique` 只接受唯一键字段，这段代码会在运行时抛出校验错误，导致接口无法返回文章数据。建议改用 `findFirst` 并在 `where` 中添加 `published: true` 过滤，或保留 `findUnique` 但在后续手动校验 `published`。
- [Bug] `src/app/api/analytics/page-views/route.ts:105-116`：在 `db.$queryRaw` 模板字符串中插入 `db.$queryRawUnsafe`，实际插入的是一个 Promise，生成的 SQL 会包含 `[object Promise]` 并直接报错；即便语法能通过，也会把外部参数拼接进 SQL，存在注入风险。应改用 `Prisma.sql` 构造可选的 `AND path = ...` 片段，或在 `where` 条件中使用 Prisma 查询构造器完成统计。
- [Security] `src/app/api/upload/route.ts:6` 与 `src/middleware.ts:33-51`：上传接口缺少鉴权，且 middleware 的 `authorized` 回调只检查 `/admin` 路径，导致 `/api/upload`、`/api/categories` 等敏感接口对未登录用户完全开放，可被滥用上传任意文件或写入后台数据。需要在 middleware 中针对 API 路径校验角色，并在对应路由内调用 `requireAdminAccess()`。

## 中等优先级问题
- [Bug] `src/lib/analytics.ts:69-82`：`useAnalytics` 直接在函数体内调用 `trackPageView` 并注册 `setInterval`，每次组件渲染都会重复执行副作用且不会清理旧定时器。应改为真正的 React hook（使用 `useEffect`）或提供显式的启动/销毁 API。

## 建议改进
- 针对上述修复补充端到端/单元测试：例如为 `/api/analytics/page-views` 加入路径过滤用例，为 `/api/upload` 编写鉴权失败用例，确保回归时能自动捕捉问题。
