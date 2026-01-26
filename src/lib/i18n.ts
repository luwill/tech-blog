// 国际化配置
export type Locale = 'en' | 'zh'

export const defaultLocale: Locale = 'en'

export const locales: Locale[] = ['en', 'zh']

export interface Translations {
  // Common
  home: string
  blog: string
  about: string
  search: string
  signIn: string
  signOut: string
  admin: string
  
  // Homepage
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  exploreBlog: string
  learnAboutMe: string
  whatIShare: string
  whatIShareDescription: string

  // Skills
  skillAIGC: string
  skillVibeCoding: string
  skillVibeResearching: string
  skillAIFullStack: string
  skillDeepLearning: string
  skillAIAgent: string

  // Features
  aiTechnology: string
  aiTechnologyDescription: string
  productReviews: string
  productReviewsDescription: string
  technicalInsights: string
  technicalInsightsDescription: string
  
  // CTA
  readyToDiveIn: string
  startExploring: string
  readLatestPosts: string
  
  // About Page
  aboutMe: string
  passionateEngineer: string
  professionalBackground: string
  aboutIntro: string
  aboutExperience: string
  aboutPhilosophy: string
  skillsExpertise: string
  machineLearning: string
  machineLearningDesc: string
  programming: string
  programmingDesc: string
  dataScience: string
  dataScienceDesc: string
  cloudDevOps: string
  cloudDevOpsDesc: string
  research: string
  researchDesc: string
  fullStackDev: string
  fullStackDevDesc: string
  letsConnect: string
  connectDescription: string
  emailMe: string
  remote: string
  aiEngineer: string
  
  // Blog Page
  myTechBlog: string
  blogDescription: string
  articles: string
  categories: string
  searchArticles: string
  allCategories: string
  newest: string
  oldest: string
  mostPopular: string
  readingTime: string
  featuredArticles: string
  featured: string
  allArticles: string
  latestArticles: string
  minRead: string
  readMore: string
  noArticlesFound: string
  noArticlesDescription: string
  tryAdjusting: string
  noPublished: string
  clearFilters: string
  browseByCategory: string
  
  // Language
  language: string
  english: string
  chinese: string
  
  // Theme
  theme: string
  light: string
  dark: string
  system: string
}

export const translations: Record<Locale, Translations> = {
  en: {
    // Common
    home: 'Home',
    blog: 'Blog',
    about: 'About',
    search: 'Search',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    admin: 'Admin',
    
    // Homepage
    heroTitle: "Hello, I'm LouWill",
    heroSubtitle: 'AI Algorithm Engineer & Full Stack Developer',
    heroDescription: "Hello, I'm LouWill, Algorithm Engineer / AI Full Stack Developer. Welcome to my personal homepage, where I focus on cutting-edge technology sharing and project practice in AI Programming & Vibe Coding.",
    exploreBlog: 'Explore My Blog',
    learnAboutMe: 'Learn About Me',
    whatIShare: 'What I Share',
    whatIShareDescription: 'Discover the latest in AI technology and algorithm engineering',

    // Skills
    skillAIGC: 'AIGC',
    skillVibeCoding: 'Vibe Coding',
    skillVibeResearching: 'Vibe Researching',
    skillAIFullStack: 'AI Full Stack',
    skillDeepLearning: 'Deep Learning',
    skillAIAgent: 'AI Agent',

    // Features
    aiTechnology: 'AI Technology',
    aiTechnologyDescription: 'Deep dives into machine learning algorithms, neural networks, and cutting-edge AI research',
    productReviews: 'Product Reviews',
    productReviewsDescription: "Honest reviews of AI tools, frameworks, and platforms from an engineer's perspective",
    technicalInsights: 'Technical Insights',
    technicalInsightsDescription: 'Practical tips, best practices, and lessons learned from real-world AI implementations',

    // CTA
    readyToDiveIn: 'Ready to dive in?',
    startExploring: 'Start exploring my latest articles and insights on AI technology',
    readLatestPosts: 'Read My Latest Posts',
    
    // About Page
    aboutMe: 'About Me',
    passionateEngineer: 'Passionate AI Algorithm Engineer dedicated to pushing the boundaries of artificial intelligence',
    professionalBackground: 'Professional Background',
    aboutIntro: "Hello! I'm LouWill, an AI Algorithm Engineer and Full Stack Developer with a passion for creating intelligent systems that solve real-world problems. My journey in technology began with a fascination for how machines could learn and adapt, leading me to specialize in machine learning algorithms and neural networks.",
    aboutExperience: 'I have extensive experience in developing and optimizing machine learning models, particularly in natural language processing, computer vision, and deep learning. My work involves not just implementing algorithms, but also understanding their theoretical foundations and practical applications in production environments.',
    aboutPhilosophy: "When I'm not coding or training models, you'll find me exploring the latest research papers, contributing to open-source projects, or sharing my knowledge through this blog. I believe in the power of community and continuous learning in the rapidly evolving field of AI.",
    skillsExpertise: 'Skills & Expertise',
    machineLearning: 'Machine Learning',
    machineLearningDesc: 'Deep learning, neural networks, transformer architectures, computer vision, and natural language processing',
    programming: 'Programming',
    programmingDesc: 'Python, PyTorch, TensorFlow, JavaScript, TypeScript, React, Next.js, and modern web technologies',
    dataScience: 'Data Science',
    dataScienceDesc: 'Statistical analysis, data visualization, feature engineering, and model optimization techniques',
    cloudDevOps: 'Cloud & DevOps',
    cloudDevOpsDesc: 'AWS, Google Cloud, Docker, Kubernetes, CI/CD pipelines, and MLOps best practices',
    research: 'Research',
    researchDesc: 'Algorithm design, performance optimization, technical writing, and keeping up with latest AI research',
    fullStackDev: 'Full Stack Development',
    fullStackDevDesc: 'End-to-end application development, API design, database management, and system architecture',
    letsConnect: "Let's Connect",
    connectDescription: "I'm always interested in discussing AI, technology, and potential collaborations",
    emailMe: 'Email Me',
    remote: 'Remote',
    aiEngineer: 'AI Algorithm Engineer',
    
    // Blog Page
    myTechBlog: 'My Tech Blog',
    blogDescription: 'Exploring AI, algorithms, and technology through practical insights and honest reviews',
    articles: 'articles',
    categories: 'categories',
    searchArticles: 'Search articles...',
    allCategories: 'All Categories',
    newest: 'Newest',
    oldest: 'Oldest',
    mostPopular: 'Most Popular',
    readingTime: 'Reading Time',
    featuredArticles: 'Featured Articles',
    featured: 'Featured',
    allArticles: 'All Articles',
    latestArticles: 'Latest Articles',
    minRead: 'min read',
    readMore: 'Read more',
    noArticlesFound: 'No articles found',
    noArticlesDescription: 'Try adjusting your search or filter criteria',
    tryAdjusting: 'Try adjusting your search or filter criteria',
    noPublished: 'No articles have been published yet',
    clearFilters: 'Clear filters',
    browseByCategory: 'Browse by Category',
    
    // Language
    language: 'Language',
    english: 'English',
    chinese: '中文',
    
    // Theme
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  },
  zh: {
    // Common
    home: '首页',
    blog: '博客',
    about: '关于',
    search: '搜索',
    signIn: '登录',
    signOut: '退出',
    admin: '管理',
    
    // Homepage
    heroTitle: '你好，我是LouWill',
    heroSubtitle: 'AI算法工程师 & 全栈开发者',
    heroDescription: '你好，我是LouWill，算法工程师/AI全栈开发。欢迎来到我的个人主页，我聚焦于AI编程与Vibe Coding的前沿技术分享与项目实践。',
    exploreBlog: '探索我的博客',
    learnAboutMe: '了解我',
    whatIShare: '我分享什么',
    whatIShareDescription: '发现AI技术和算法工程的最新进展',

    // Skills
    skillAIGC: 'AIGC',
    skillVibeCoding: 'Vibe Coding',
    skillVibeResearching: 'Vibe Researching',
    skillAIFullStack: 'AI Full Stack',
    skillDeepLearning: 'Deep Learning',
    skillAIAgent: 'AI Agent',

    // Features
    aiTechnology: 'AI技术',
    aiTechnologyDescription: '深入探讨机器学习算法、神经网络和前沿AI研究',
    productReviews: '产品评测',
    productReviewsDescription: '从工程师角度对AI工具、框架和平台进行诚实评测',
    technicalInsights: '技术洞察',
    technicalInsightsDescription: '来自真实AI实现的实用技巧、最佳实践和经验分享',

    // CTA
    readyToDiveIn: '准备好开始了吗？',
    startExploring: '开始探索我关于AI技术的最新文章和见解',
    readLatestPosts: '阅读我的最新文章',
    
    // About Page
    aboutMe: '关于我',
    passionateEngineer: '致力于推动人工智能边界的热情AI算法工程师',
    professionalBackground: '专业背景',
    aboutIntro: '你好！我是LouWill，一名AI算法工程师和全栈开发者，热衷于创建解决现实问题的智能系统。我的技术之旅始于对机器如何学习和适应的好奇，这让我专注于机器学习算法和神经网络领域。',
    aboutExperience: '我在开发和优化机器学习模型方面有丰富经验，特别是在自然语言处理、计算机视觉和深度学习领域。我的工作不仅仅是实现算法，还包括理解其理论基础和在生产环境中的实际应用。',
    aboutPhilosophy: '当我不在编程或训练模型时，你会发现我在探索最新研究论文、为开源项目贡献代码，或通过这个博客分享我的知识。我相信在AI这个快速发展的领域中，社区力量和持续学习的重要性。',
    skillsExpertise: '技能专长',
    machineLearning: '机器学习',
    machineLearningDesc: '深度学习、神经网络、Transformer架构、计算机视觉和自然语言处理',
    programming: '编程技术',
    programmingDesc: 'Python、PyTorch、TensorFlow、JavaScript、TypeScript、React、Next.js和现代Web技术',
    dataScience: '数据科学',
    dataScienceDesc: '统计分析、数据可视化、特征工程和模型优化技术',
    cloudDevOps: '云计算与DevOps',
    cloudDevOpsDesc: 'AWS、Google Cloud、Docker、Kubernetes、CI/CD管道和MLOps最佳实践',
    research: '研究能力',
    researchDesc: '算法设计、性能优化、技术写作，以及跟进最新AI研究',
    fullStackDev: '全栈开发',
    fullStackDevDesc: '端到端应用开发、API设计、数据库管理和系统架构',
    letsConnect: '让我们联系',
    connectDescription: '我总是乐于讨论AI、技术和潜在合作',
    emailMe: '发邮件给我',
    remote: '远程',
    aiEngineer: 'AI算法工程师',
    
    // Blog Page
    myTechBlog: '我的技术博客',
    blogDescription: '通过实用见解和诚实评测探索AI、算法和技术',
    articles: '篇文章',
    categories: '个分类',
    searchArticles: '搜索文章...',
    allCategories: '所有分类',
    newest: '最新',
    oldest: '最早',
    mostPopular: '最受欢迎',
    readingTime: '阅读时长',
    featuredArticles: '精选文章',
    featured: '精选',
    allArticles: '所有文章',
    latestArticles: '最新文章',
    minRead: '分钟阅读',
    readMore: '阅读更多',
    noArticlesFound: '未找到文章',
    noArticlesDescription: '尝试调整搜索或筛选条件',
    tryAdjusting: '尝试调整搜索或筛选条件',
    noPublished: '还没有发布任何文章',
    clearFilters: '清除筛选',
    browseByCategory: '按分类浏览',
    
    // Language
    language: '语言',
    english: 'English',
    chinese: '中文',
    
    // Theme
    theme: '主题',
    light: '浅色',
    dark: '深色',
    system: '系统'
  }
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale]
}