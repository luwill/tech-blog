import Link from "next/link"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { MarkdownImport } from "@/components/admin/markdown-import"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

export const metadata = {
  title: "Import Posts | Admin",
  description: "Import markdown files as blog posts",
}

export default async function ImportPostsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.ADMIN) {
    redirect('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-2">Import Markdown Files</h1>
          <p className="text-muted-foreground">
            Upload .md files with YAML frontmatter to import them as blog posts
          </p>
        </div>

        {/* Frontmatter format hint */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Expected Frontmatter Format</h3>
          <pre className="text-sm font-mono bg-background p-4 rounded overflow-x-auto">
{`---
title: "Your Post Title"
date: "2024-01-15"
category: "AI Technology"
tags: ["AI", "Machine Learning"]
excerpt: "A brief description of your post"
published: true
featured: false
slug: "custom-slug-optional"
---

Your markdown content here...`}
          </pre>
        </div>

        {/* Import Component */}
        <MarkdownImport />
      </main>

      <Footer />
    </div>
  )
}
