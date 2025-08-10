# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal tech blog system for louwill (AI Algorithm Engineer / AI Full Stack Developer), featuring:
- Personal homepage with professional profile
- AI technology articles and product reviews
- Advanced Markdown editor with real-time preview
- Theme switching (light/dark mode)
- Access analytics and visitor statistics
- User management system (admin vs visitors)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: Prisma ORM with PlanetScale/Supabase
- **Authentication**: NextAuth.js
- **Editor**: @uiw/react-md-editor with enhanced features
- **Theme**: next-themes for light/dark mode
- **Analytics**: Custom analytics + Vercel Analytics
- **Deployment**: Vercel

## Project Architecture

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── admin/          # Admin dashboard
│   ├── blog/           # Blog pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── blog/          # Blog-specific components
│   ├── editor/        # Markdown editor
│   └── layout/        # Layout components
├── lib/               # Utilities and configs
├── types/             # TypeScript definitions
└── styles/            # Additional styles
```

## My Profile

- Nickname: louwill
- Occupation: Algorithm Engineer / AI Full Stack Developer
- Github: https://github.com/luwill
- Domain: https://www.louwill.com/

## Key Features to Implement

1. **Content Management**: Create, edit, publish articles
2. **Markdown Editor**: Real-time preview, code highlighting, math formulas
3. **Theme System**: Light/dark mode switching
4. **Analytics**: Page views, visitor stats (admin only)
5. **User System**: Admin authentication and permissions
6. **SEO Optimization**: Meta tags, sitemaps, performance
7. **Responsive Design**: Mobile-first approach