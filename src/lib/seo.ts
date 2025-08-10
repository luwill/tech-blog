import type { Metadata } from 'next'

interface SEOConfig {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
}

const DEFAULT_SEO = {
  title: "LouWill's Tech Blog",
  description: "AI Algorithm Engineer & Full Stack Developer sharing insights on artificial intelligence, machine learning, and cutting-edge technology trends.",
  keywords: ["AI", "Machine Learning", "Deep Learning", "Algorithm", "Technology", "Blog", "LouWill"],
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.louwill.com',
  image: '/og-image.jpg',
  type: 'website' as const
}

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = DEFAULT_SEO.type,
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags
  } = config

  const fullTitle = title === DEFAULT_SEO.title ? title : `${title} | ${DEFAULT_SEO.title}`
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_SEO.url}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: authors ? authors.map(name => ({ name })) : [{ name: 'LouWill' }],
    creator: 'LouWill',
    publisher: 'LouWill',
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: DEFAULT_SEO.title,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'en_US',
      type: type === 'article' ? 'article' : 'website',
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: authors?.map(author => `${DEFAULT_SEO.url}/authors/${author.toLowerCase().replace(/\s+/g, '-')}`),
        section,
        tags
      })
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: '@louwill',
      site: '@louwill'
    },

    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
    }
  }

  return metadata
}

export function generateArticleStructuredData(article: {
  title: string
  description: string
  content: string
  publishedAt: string
  updatedAt: string
  slug: string
  author: string
  category?: string
  tags?: string[]
  image?: string
  readTime?: number
}) {
  const baseUrl = DEFAULT_SEO.url
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image ? `${baseUrl}${article.image}` : `${baseUrl}${DEFAULT_SEO.image}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author,
      url: `${baseUrl}/about`,
      sameAs: [
        'https://github.com/luwill',
        'https://twitter.com/louwill'
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: "LouWill's Tech Blog",
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`
    },
    articleSection: article.category,
    keywords: article.tags?.join(', '),
    wordCount: article.content.split(/\s+/).length,
    timeRequired: article.readTime ? `PT${article.readTime}M` : undefined,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/'
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = DEFAULT_SEO.url
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  }
}

export function generateWebsiteStructuredData() {
  const baseUrl = DEFAULT_SEO.url
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    author: {
      '@type': 'Person',
      name: 'LouWill',
      description: 'AI Algorithm Engineer & Full Stack Developer',
      url: `${baseUrl}/about`,
      sameAs: [
        'https://github.com/luwill',
        'https://twitter.com/louwill'
      ]
    }
  }
}