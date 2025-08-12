# 项目设置与部署指南

## 主要修复内容

### ✅ 已修复的问题

1. **统一数据库配置**
   - 移除SQLite配置，统一使用PostgreSQL (Supabase)
   - 更新`prisma/schema.prisma`为PostgreSQL提供程序

2. **修复认证授权机制**
   - 实现真实的用户session验证
   - 添加管理员权限检查
   - 修复登录状态显示问题
   - 改为JWT session策略，解决session同步问题

3. **添加路由保护**
   - 创建`src/middleware.ts`中间件
   - 保护所有`/admin/*`路由
   - API路由权限验证

4. **改进配置与错误处理**
   - 完善Next.js配置（安全头、图片优化、压缩等）
   - 统一错误处理机制
   - 修复ESLint警告

5. **完善编辑器组件**
   - 修复checkbox状态绑定
   - 改进状态管理

## 环境变量设置

确保`.env.local`文件包含以下变量：

```bash
# 数据库配置 - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth配置
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 管理员邮箱
ADMIN_EMAIL="ygnjd2016@gmail.com"
```

## 部署步骤

### 1. 数据库设置

```bash
# 推送数据库schema到Supabase
npm run db:push

# 生成Prisma客户端
npm run db:generate
```

### 2. 创建管理员用户

```bash
# 运行用户创建脚本
npm run db:create-user
```

### 3. 构建和部署

```bash
# 本地测试
npm run build

# 部署到Vercel
git push origin main
```

## 安全改进

1. **路由保护**: 所有admin路由都需要管理员权限
2. **API保护**: POST、PUT、DELETE操作需要管理员身份验证
3. **会话管理**: 使用JWT策略，30天过期
4. **安全头**: 添加了各种安全HTTP头

## 性能优化

1. **图片优化**: 支持WebP和AVIF格式
2. **包优化**: 优化Radix UI和Lucide图标导入
3. **压缩**: 启用Gzip压缩
4. **缓存**: 改进API和静态资源缓存

## 注意事项

1. **首次登录**: 使用配置的管理员邮箱登录后，系统会自动分配ADMIN角色
2. **角色分配**: 延迟1秒执行，确保用户记录已创建
3. **会话更新**: 支持实时更新用户角色和权限
4. **错误处理**: 统一的API错误响应格式

## 故障排除

### 登录状态不更新
- 检查NEXTAUTH_SECRET是否设置
- 验证DATABASE_URL连接
- 清除浏览器缓存和cookies

### 管理员权限问题
- 确认ADMIN_EMAIL环境变量正确
- 检查数据库中用户的role字段
- 重新登录刷新JWT token

### 数据库连接问题
- 验证Supabase连接字符串
- 检查数据库实例是否运行
- 确认防火墙设置