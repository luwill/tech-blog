"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { useLocale } from "@/components/providers/locale-provider"
import { ArrowRight, Code, Zap, Users } from "lucide-react"

export default function Home() {
  const { t } = useLocale()
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {t.heroSubtitle}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg">
                <Link href="/blog">
                  {t.exploreBlog}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">{t.learnAboutMe}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t.whatIShare}</h2>
              <p className="text-muted-foreground">
                {t.whatIShareDescription}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Code className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{t.aiTechnology}</CardTitle>
                  <CardDescription>
                    {t.aiTechnologyDescription}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{t.productReviews}</CardTitle>
                  <CardDescription>
                    {t.productReviewsDescription}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{t.technicalInsights}</CardTitle>
                  <CardDescription>
                    {t.technicalInsightsDescription}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{t.readyToDiveIn}</h2>
            <p className="text-lg text-muted-foreground">
              {t.startExploring}
            </p>
            <Button asChild size="lg">
              <Link href="/blog">
                {t.readLatestPosts}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
