# Deployment Guide

This guide covers multiple deployment options for the LouWill Tech Blog.

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env.local` and configure:
   ```bash
   DATABASE_URL="your-database-url"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXT_PUBLIC_BASE_URL="https://your-domain.com"
   ADMIN_EMAIL="admin@your-domain.com"
   ```

2. **Database Setup**: Initialize and seed the database:
   ```bash
   npm run db:push
   npm run db:seed
   npm run db:create-user
   ```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the best Next.js deployment experience:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Environment Variables**: Set in Vercel dashboard or via CLI:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXT_PUBLIC_BASE_URL
   vercel env add ADMIN_EMAIL
   ```

4. **Database**: Use PlanetScale, Supabase, or Vercel Postgres:
   ```bash
   # For PlanetScale
   DATABASE_URL="mysql://user:pass@host:3306/db?sslaccept=strict"
   
   # For Supabase
   DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
   ```

### 2. Docker Deployment

For self-hosting with Docker:

1. **Build Image**:
   ```bash
   docker build -t tech-blog .
   ```

2. **Run Container**:
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-db-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     -e NEXTAUTH_URL="https://your-domain.com" \
     -e NEXT_PUBLIC_BASE_URL="https://your-domain.com" \
     tech-blog
   ```

3. **Docker Compose** (with PostgreSQL):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: "postgresql://user:pass@db:5432/techblog"
         NEXTAUTH_URL: "https://your-domain.com"
         NEXTAUTH_SECRET: "your-secret"
         NEXT_PUBLIC_BASE_URL: "https://your-domain.com"
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: pass
         POSTGRES_DB: techblog
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

### 3. Manual Server Deployment

For traditional server deployment:

1. **Server Requirements**:
   - Node.js 18+
   - PM2 for process management
   - Nginx for reverse proxy
   - SSL certificate

2. **Deploy Steps**:
   ```bash
   # Clone and build
   git clone <repo-url> tech-blog
   cd tech-blog
   npm install
   npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start npm --name "tech-blog" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**:
   ```nginx
   server {
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Database Options

### 1. PlanetScale (MySQL)
```bash
DATABASE_URL="mysql://user:password@host:3306/database?sslaccept=strict"
```

### 2. Supabase (PostgreSQL)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
```

### 3. Railway
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## Post-Deployment Setup

1. **Create Admin User**:
   ```bash
   npm run db:create-user
   ```

2. **Verify SEO Setup**:
   - Check `/sitemap.xml`
   - Check `/robots.txt`
   - Verify meta tags and structured data

3. **Performance Monitoring**:
   - Enable Vercel Analytics
   - Configure error tracking (Sentry)
   - Monitor Core Web Vitals

## Security Checklist

- [ ] NEXTAUTH_SECRET is secure and unique
- [ ] Database credentials are secure
- [ ] Admin routes are protected
- [ ] File upload is properly validated
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced
- [ ] Security headers are set

## Maintenance

1. **Database Backups**:
   ```bash
   # For PostgreSQL
   pg_dump $DATABASE_URL > backup.sql
   
   # For MySQL
   mysqldump --single-transaction --routines --triggers database > backup.sql
   ```

2. **Log Monitoring**:
   ```bash
   # With PM2
   pm2 logs tech-blog
   
   # With Docker
   docker logs container-name
   ```

3. **Updates**:
   ```bash
   git pull origin main
   npm install
   npm run build
   npm run db:push  # If schema changed
   pm2 restart tech-blog
   ```

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check Node.js version (18+)
- Clear `.next` folder and rebuild

### Database Issues
- Verify DATABASE_URL format
- Check database permissions
- Run migrations: `npm run db:push`

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches domain
- Ensure session cookies are working

### Performance Issues
- Enable Next.js caching
- Use CDN for static assets
- Optimize images and fonts
- Monitor database query performance

## Support

For deployment issues, check:
1. Application logs
2. Database connectivity
3. Environment variables
4. Network configuration

Contact: admin@louwill.com