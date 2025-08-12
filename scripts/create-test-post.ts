import { db } from '../src/lib/db'

async function createTestPost() {
  try {
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!admin) {
      console.log('❌ No admin user found')
      return
    }

    console.log('👤 Found admin user:', admin.name || admin.email)

    const testPost = await db.post.create({
      data: {
        title: 'Welcome to My Tech Blog',
        slug: 'welcome-to-my-tech-blog',
        content: `# Welcome to My Tech Blog

This is my first blog post! I'll be sharing insights about AI, algorithms, and technology.

## What You Can Expect

- **Deep dives into AI algorithms**: Understanding the math and implementation behind popular AI models
- **Product reviews and analysis**: Honest reviews of tools, frameworks, and services
- **Technical tutorials**: Step-by-step guides for developers and engineers
- **Industry insights**: Thoughts on trends and developments in the tech world

## About Me

I'm an AI Algorithm Engineer with a passion for full-stack development. My focus areas include:

- Machine Learning and Deep Learning
- Algorithm optimization
- Web development with modern frameworks
- System architecture and design

Stay tuned for more content, and feel free to reach out if you have any questions or suggestions!

\`\`\`javascript
console.log('Welcome to the blog!');
\`\`\`

Happy coding! 🚀`,
        excerpt: 'Welcome to my tech blog where I share insights about AI, algorithms, and technology. Get ready for deep dives, tutorials, and industry insights.',
        published: true,
        featured: true,
        authorId: admin.id,
        readTime: 3,
        views: 123
      }
    })

    console.log('✅ Test post created successfully!')
    console.log('📝 Title:', testPost.title)
    console.log('🆔 Post ID:', testPost.id)
    console.log('🔗 Slug:', testPost.slug)
    console.log('📊 Views:', testPost.views)
  } catch (error) {
    console.error('❌ Error creating test post:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestPost()