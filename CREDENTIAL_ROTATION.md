# 数据库凭据轮换步骤

这份清单供你在决定切换线上凭据时执行。本次修复没有读取 `.env.local` 的值、修改密码、连接真实数据库或操作 Vercel。远程仓库当前配置文件中的旧密码是否已失效仍待你确认。

## 1. 确定要轮换的项目与使用方

在你自己的编辑器里查看 `.env.local` 中 DATABASE_URL 的主机和用户名，确认对应哪个 Supabase 项目。不要把完整连接串贴进聊天、终端命令或 Git 文件。

列出使用同一密码的地方：本地 DATABASE_URL、Vercel 的 Production / Preview / Development 环境，以及你配置过的其他脚本或服务。提前打开这些配置页，准备一次性更新。若是自建数据库角色，需轮换该角色；Dashboard 的 Database password 主要针对 postgres 角色。

## 2. 在 Supabase 重置数据库密码

进入正确项目 → **Database → Settings → Database password / Reset database password**，生成新的随机密码并存入密码管理器。重置的是 PostgreSQL 数据库密码，不是 Supabase 账号登录密码或 API key。

官方入口与说明：[Supabase 重置数据库密码](https://supabase.com/kb/troubleshooting/how-do-i-reset-my-supabase-database-password-oTs5sB)、[Postgres 角色与密码](https://supabase.com/docs/guides/database/postgres/roles)。

外部应用仍需手动更新连接串，切换期间使用旧密码的新连接可能失败。建议把下面两步紧接着完成。Supavisor 在轮换后可能短暂出现 28P01；使用新密码重试，避免反复重置密码。

## 3. 更新本地连接串

在 Supabase 的 **Connect** 对话框选择与当前配置相同的连接方式。保持现有主机、端口、数据库名、用户名格式及查询参数；只替换密码部分。密码中的保留字符必须进行 URL 百分号编码。

在本地编辑器更新 `.env.local` 的 DATABASE_URL。不要运行会重置数据库的脚本，也不要把新值写入 `.claude/settings.local.json`。重启之后需要使用数据库的本地服务，令进程读取新环境变量。

连接方式参考：[Supabase 连接 PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres)。

## 4. 更新 Vercel 并重新部署已选定的版本

进入 Vercel → 对应项目 → **Settings → Environment Variables**，修改 DATABASE_URL，覆盖实际使用该数据库的环境；同时检查 Preview 是否有覆盖默认值的分支专属变量。有 Secret 选项时将连接串设为 Secret。

环境变量变更仅作用于新部署。进入 **Deployments**，选择你准备继续使用的生产版本，执行 **Redeploy**，确认此次部署使用更新后的环境变量。这会部署你在 Dashboard 选定的版本，不会自动包含本地未推送修复。当前“暂不推送”的约束下，不要误以为凭据轮换同时发布了本次本地代码。

官方依据：[Vercel 环境变量](https://vercel.com/docs/environment-variables)。

## 5. 做切换验收

以下动作会访问真实服务，请在你决定进行轮换验收时执行；本次没有代为运行：

1. 用新连接串进行一次新的数据库连接，执行只读 `SELECT 1`；确认连接成功。
2. 用旧凭据进行一次新的认证尝试，确认被拒绝；如果仍成功，核对项目、角色、连接入口及池化状态。不要把旧密码放进命令行参数。
3. 检查新 Vercel deployment 的日志，确认不再出现数据库认证失败；访问 `/api/posts?limit=1`，确认实际返回预期文章，而非只检查可能已缓存的 /blog 页面。
4. 检查 Supabase 的连接/查询日志是否有异常访问。密码失效不等于此前已建立的所有会话已关闭；若发现可疑连接，按独立的事件处置流程处理。

## 6. 后续清理 Git 暴露

本地 HEAD 已停止跟踪 `.claude/settings.local.json`，并且 .gitignore 已覆盖它。本次继续保持这个状态。

等你允许推送时，把该修复同步到远程。旧提交仍含历史副本，凭据失效必须独立完成；历史重写会影响其他克隆和分支，应另行计划并明确批准后操作。本次没有删除本地配置文件、改写 Git 历史或推送。
