"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { useLocale } from "@/components/providers/locale-provider"
import { TerminalWindow } from "@/components/terminal"
import { ArrowRight } from "lucide-react"
import styles from "@/styles/pages/home.module.css"

export default function Home() {
  const { t } = useLocale()

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1">
        {/* Hero Section - Terminal Style */}
        <section className={`container mx-auto px-4 ${styles.hero}`}>
          <TerminalWindow
            title="louwill.com"
            elevated
            className={styles.heroTerminal}
          >
            <div className={styles.heroContent}>
              {/* whoami command */}
              <div className={styles.whoamiLine}>
                <span className={styles.prompt}>$</span>
                <span className={styles.command}>whoami</span>
              </div>
              <div className={styles.output}>
                <div className={styles.heroName}>LouWill@鲁工</div>
              </div>

              {/* cat intro.md */}
              <div className={styles.whoamiLine}>
                <span className={styles.prompt}>$</span>
                <span className={styles.command}>cat intro.md</span>
              </div>
              <div className={styles.output}>
                <p>{t.heroDescription}</p>
              </div>

              {/* ls skills */}
              <div className={styles.whoamiLine}>
                <span className={styles.prompt}>$</span>
                <span className={styles.command}>ls ./skills</span>
              </div>
              <div className={styles.expertiseGrid}>
                <div className={styles.expertiseItem}>{t.skillAIGC}</div>
                <div className={styles.expertiseItem}>{t.skillVibeCoding}</div>
                <div className={styles.expertiseItem}>{t.skillDeepLearning}</div>
                <div className={styles.expertiseItem}>{t.skillVibeResearching}</div>
                <div className={styles.expertiseItem}>{t.skillAIFullStack}</div>
                <div className={styles.expertiseItem}>{t.skillAIAgent}</div>
              </div>

              {/* Blinking cursor */}
              <div className={styles.whoamiLine}>
                <span className={styles.prompt}>$</span>
                <span className={styles.cursor}></span>
              </div>

              {/* CTA Buttons */}
              <div className={styles.ctaButtons}>
                <Button asChild size="lg" className="command-button">
                  <Link href="/blog">
                    {t.exploreBlog}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">{t.learnAboutMe}</Link>
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
