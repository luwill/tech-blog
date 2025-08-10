import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LouWill&apos;s Tech Blog</h1>
          <nav className="space-x-4">
            <a href="#" className="hover:text-primary">Home</a>
            <a href="#" className="hover:text-primary">Blog</a>
            <a href="#" className="hover:text-primary">About</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hello, I&apos;m LouWill
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            AI Algorithm Engineer & Full Stack Developer
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Welcome to my digital space where I share insights on AI technology, 
            algorithm optimization, and product reviews.
          </p>
          <Button size="lg">
            Explore My Blog
          </Button>
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">What I Share</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>AI Technology</CardTitle>
                <CardDescription>
                  Deep dives into machine learning algorithms, neural networks, 
                  and cutting-edge AI research
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product Reviews</CardTitle>
                <CardDescription>
                  Honest reviews of AI tools, frameworks, and platforms 
                  from an engineer&apos;s perspective
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Technical Insights</CardTitle>
                <CardDescription>
                  Practical tips, best practices, and lessons learned 
                  from real-world AI implementations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t p-8 text-center text-muted-foreground">
        <p>© 2024 LouWill. Built with Next.js and Tailwind CSS.</p>
      </footer>
    </div>
  )
}