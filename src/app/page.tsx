import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Code, Zap, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Hello, I&apos;m LouWill
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              AI Algorithm Engineer & Full Stack Developer
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to my digital space where I share insights on AI technology, 
              algorithm optimization, and product reviews. Join me on this journey 
              through the evolving landscape of artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg">
                <Link href="/blog">
                  Explore My Blog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn About Me</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What I Share</h2>
              <p className="text-muted-foreground">
                Discover the latest in AI technology and algorithm engineering
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Code className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>AI Technology</CardTitle>
                  <CardDescription>
                    Deep dives into machine learning algorithms, neural networks, 
                    and cutting-edge AI research
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Product Reviews</CardTitle>
                  <CardDescription>
                    Honest reviews of AI tools, frameworks, and platforms 
                    from an engineer&apos;s perspective
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Technical Insights</CardTitle>
                  <CardDescription>
                    Practical tips, best practices, and lessons learned 
                    from real-world AI implementations
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to dive in?</h2>
            <p className="text-lg text-muted-foreground">
              Start exploring my latest articles and insights on AI technology
            </p>
            <Button asChild size="lg">
              <Link href="/blog">
                Read My Latest Posts
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
