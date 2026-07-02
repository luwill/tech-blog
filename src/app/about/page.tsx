"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { useLocale } from "@/components/providers/locale-provider"
import { TerminalWindow } from "@/components/terminal"
import { ArrowRight } from "lucide-react"

export default function AboutPage() {
  const { t } = useLocale()

  return (
    <div className="flex flex-col min-h-screen isolate">
      <HeaderSimple />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
          <TerminalWindow title="about.md" elevated>
            <div className="space-y-6 p-2 md:p-4">
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <span className="text-primary">$</span>
                <span>cat about.md</span>
              </div>

              <h1 className="text-3xl font-bold">{t.aboutMe}</h1>

              <div className="space-y-4 leading-relaxed text-muted-foreground">
                <p>{t.aboutIntro}</p>
                <p>{t.aboutExperience}</p>
                <p>{t.aboutPhilosophy}</p>
              </div>

              <div className="pt-4">
                <Button asChild className="command-button">
                  <Link href="/blog">
                    {t.exploreBlog}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </TerminalWindow>
        </section>
      </main>

      <Footer />
    </div>
  )
}
