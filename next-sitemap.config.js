/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.louwill.com',
  generateRobotsTxt: false, // We have custom robots.ts
  exclude: ['/admin', '/admin/*', '/auth/*', '/api/*'],
  additionalPaths: async (config) => {
    const paths = []
    
    try {
      // Add dynamic blog post paths
      const response = await fetch(`${config.siteUrl}/api/posts?published=true&limit=1000`)
      if (response.ok) {
        const { posts } = await response.json()
        posts.forEach((post) => {
          paths.push({
            loc: `/blog/${post.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: post.updatedAt
          })
        })
      }
      
      // Add category pages
      const categoryResponse = await fetch(`${config.siteUrl}/api/categories`)
      if (categoryResponse.ok) {
        const { categories } = await categoryResponse.json()
        categories.forEach((category) => {
          paths.push({
            loc: `/blog?category=${category.slug}`,
            changefreq: 'weekly',
            priority: 0.6
          })
        })
      }
    } catch (error) {
      console.warn('Could not fetch dynamic paths for sitemap:', error)
    }
    
    return paths
  },
  transform: async (config, path) => {
    // Custom priority and frequency based on path
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString()
      }
    }
    
    if (path === '/blog') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString()
      }
    }
    
    if (path === '/about') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      }
    }
    
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toISOString()
    }
  }
}