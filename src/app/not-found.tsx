import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1 container mx-auto px-4 py-24 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-4">
          $ cat requested-page.md
        </p>
        <h1 className="text-4xl font-bold mb-4">404 — Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          cat: requested-page.md: No such file or directory
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">Browse Articles</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
