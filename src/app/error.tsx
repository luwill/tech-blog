"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground mb-4">
        $ ./render-page
      </p>
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">
        segmentation fault (core dumped) — please try again
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
