import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default categories
  const categories = [
    {
      name: 'AI Technology',
      slug: 'ai-technology',
      description: 'Articles about artificial intelligence, machine learning, and neural networks'
    },
    {
      name: 'Product Reviews',
      slug: 'product-reviews',
      description: 'Reviews of AI tools, frameworks, and platforms'
    },
    {
      name: 'Technical Insights',
      slug: 'technical-insights',
      description: 'Deep technical articles and best practices'
    },
    {
      name: 'Algorithms',
      slug: 'algorithms',
      description: 'Algorithm analysis, optimization, and implementation'
    },
    {
      name: 'Tutorials',
      slug: 'tutorials',
      description: 'Step-by-step guides and tutorials'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
    console.log(`✅ Created category: ${category.name}`)
  }

  // Create default tags
  const tags = [
    'Machine Learning',
    'Deep Learning',
    'Neural Networks',
    'Python',
    'PyTorch',
    'TensorFlow',
    'NLP',
    'Computer Vision',
    'Data Science',
    'AI Ethics',
    'Transformers',
    'GPT',
    'Claude',
    'OpenAI',
    'Anthropic'
  ]

  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tagName,
        slug
      }
    })
    console.log(`🏷️  Created tag: ${tagName}`)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })