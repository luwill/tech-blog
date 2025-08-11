"use client"

import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/components/providers/locale-provider"
import Link from "next/link"
import { Github, Mail, MapPin, Briefcase } from "lucide-react"

export default function AboutPage() {
  const { t } = useLocale()
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">L</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{t.aboutMe}</h1>
            <p className="text-xl text-muted-foreground">
              {t.passionateEngineer}
            </p>
          </div>
        </section>

        {/* Bio Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>{t.professionalBackground}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {t.aboutIntro}
                </p>
                <p className="text-muted-foreground">
                  {t.aboutExperience}
                </p>
                <p className="text-muted-foreground">
                  {t.aboutPhilosophy}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Skills & Expertise */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t.skillsExpertise}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.machineLearning}</CardTitle>
                    <CardDescription>
                      {t.machineLearningDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t.programming}</CardTitle>
                    <CardDescription>
                      {t.programmingDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t.dataScience}</CardTitle>
                    <CardDescription>
                      {t.dataScienceDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t.cloudDevOps}</CardTitle>
                    <CardDescription>
                      {t.cloudDevOpsDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t.research}</CardTitle>
                    <CardDescription>
                      {t.researchDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t.fullStackDev}</CardTitle>
                    <CardDescription>
                      {t.fullStackDevDesc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Links */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">{t.letsConnect}</h2>
            <p className="text-muted-foreground">
              {t.connectDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link 
                  href="https://github.com/luwill" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="mailto:ygnjd2016@gmail.com">
                  <Mail className="mr-2 h-4 w-4" />
                  {t.emailMe}
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{t.remote}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>{t.aiEngineer}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}