import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Github, Mail, MapPin, Briefcase } from "lucide-react"

export default function AboutPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold">About Me</h1>
            <p className="text-xl text-muted-foreground">
              Passionate AI Algorithm Engineer dedicated to pushing the boundaries of artificial intelligence
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
                  <span>Professional Background</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Hello! I&apos;m <strong>LouWill</strong>, an AI Algorithm Engineer and Full Stack Developer 
                  with a passion for creating intelligent systems that solve real-world problems. 
                  My journey in technology began with a fascination for how machines could learn 
                  and adapt, leading me to specialize in machine learning algorithms and neural networks.
                </p>
                <p className="text-muted-foreground">
                  I have extensive experience in developing and optimizing machine learning models, 
                  particularly in natural language processing, computer vision, and deep learning. 
                  My work involves not just implementing algorithms, but also understanding their 
                  theoretical foundations and practical applications in production environments.
                </p>
                <p className="text-muted-foreground">
                  When I&apos;m not coding or training models, you&apos;ll find me exploring the latest research 
                  papers, contributing to open-source projects, or sharing my knowledge through this blog. 
                  I believe in the power of community and continuous learning in the rapidly evolving 
                  field of AI.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Skills & Expertise */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Skills & Expertise</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Machine Learning</CardTitle>
                    <CardDescription>
                      Deep learning, neural networks, transformer architectures, 
                      computer vision, and natural language processing
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Programming</CardTitle>
                    <CardDescription>
                      Python, PyTorch, TensorFlow, JavaScript, TypeScript, 
                      React, Next.js, and modern web technologies
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Data Science</CardTitle>
                    <CardDescription>
                      Statistical analysis, data visualization, feature engineering, 
                      and model optimization techniques
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Cloud & DevOps</CardTitle>
                    <CardDescription>
                      AWS, Google Cloud, Docker, Kubernetes, 
                      CI/CD pipelines, and MLOps best practices
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Research</CardTitle>
                    <CardDescription>
                      Algorithm design, performance optimization, 
                      technical writing, and keeping up with latest AI research
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Full Stack Development</CardTitle>
                    <CardDescription>
                      End-to-end application development, API design, 
                      database management, and system architecture
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
            <h2 className="text-3xl font-bold">Let&apos;s Connect</h2>
            <p className="text-muted-foreground">
              I&apos;m always interested in discussing AI, technology, and potential collaborations
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
                <Link href="mailto:contact@louwill.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Me
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>AI Algorithm Engineer</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}