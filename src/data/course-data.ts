export interface CourseTopic {
  id: string
  title: string
  titleEn: string
}

export interface CourseModule {
  id: number
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: string
  topics: CourseTopic[]
}

export const courseModules: CourseModule[] = [
  {
    id: 1,
    title: 'Claude Code导引',
    titleEn: 'Claude Code Introduction',
    description: '课程全景、设计理念、学习目标',
    descriptionEn: 'Course overview, design philosophy, and learning objectives',
    icon: '01-introduction/',
    topics: [
      { id: '1-1', title: '开场与课程导览', titleEn: 'Opening & Course Tour' },
      { id: '1-2', title: '为什么要学用Claude Code', titleEn: 'Why Learn Claude Code' },
      { id: '1-3', title: 'AI编程的本质是上下文工程', titleEn: 'AI Programming as Context Engineering' },
      { id: '1-4', title: '一套贯穿全课的Claude Code工作流', titleEn: 'A Course-wide Claude Code Workflow' },
      { id: '1-5', title: 'Claude Code的典型应用版图', titleEn: 'Typical Application Landscape' },
    ],
  },
  {
    id: 2,
    title: 'Claude Code安装与基础使用',
    titleEn: 'Installation & Basic Usage',
    description: 'Claude生态全景、安装配置、CLAUDE.md、会话管理、Git基础',
    descriptionEn: 'Claude ecosystem, setup, CLAUDE.md, session management, Git basics',
    icon: '02-basics/',
    topics: [
      { id: '2-1', title: 'Claude生态全景', titleEn: 'Claude Ecosystem Overview' },
      { id: '2-2', title: 'Claude Code安装与基础使用', titleEn: 'Installation & Basic Usage' },
      { id: '2-3', title: 'CLAUDE.md：核心配置文件', titleEn: 'CLAUDE.md: Core Configuration' },
      { id: '2-4', title: '会话管理与上下文策略', titleEn: 'Session Management & Context Strategy' },
      { id: '2-5', title: 'Slash命令', titleEn: 'Slash Commands' },
      { id: '2-6', title: 'Git最小必备知识', titleEn: 'Git Essentials' },
    ],
  },
  {
    id: 3,
    title: 'Claude Code进阶使用',
    titleEn: 'Advanced Usage',
    description: 'MCP外部工具、Skills可复用流程、Subagents多角色协作、Hooks流程约束',
    descriptionEn: 'MCP tools, Skills workflows, Subagents collaboration, Hooks constraints',
    icon: '03-advanced/',
    topics: [
      { id: '3-1', title: 'MCP：让Claude Code接入外部工具', titleEn: 'MCP: Connecting External Tools' },
      { id: '3-2', title: 'Skills：把经验沉淀成可复用流程', titleEn: 'Skills: Reusable Workflows' },
      { id: '3-3', title: 'Subagents：多角色协作', titleEn: 'Subagents: Multi-role Collaboration' },
      { id: '3-4', title: 'Hooks：流程约束与规则守卫', titleEn: 'Hooks: Process Guards' },
    ],
  },
  {
    id: 4,
    title: 'Vibe Coding：从0到1做一个AI SaaS',
    titleEn: 'Vibe Coding: Build an AI SaaS from Scratch',
    description: '项目定位、MVP开发、产品化、支付接入、部署交付',
    descriptionEn: 'Project setup, MVP development, productization, payments, deployment',
    icon: '04-vibe-coding/',
    topics: [
      { id: '4-1', title: '项目定位与案例拆解', titleEn: 'Project Positioning & Case Study' },
      { id: '4-2', title: '第一阶段：做出可演示的MVP', titleEn: 'Phase 1: Build a Demo MVP' },
      { id: '4-3', title: '第二阶段：把Demo变成可用产品', titleEn: 'Phase 2: Demo to Product' },
      { id: '4-4', title: '第三阶段：把产品变成可上线服务', titleEn: 'Phase 3: Product to Service' },
      { id: '4-5', title: '第四阶段：完成部署与交付', titleEn: 'Phase 4: Deploy & Deliver' },
      { id: '4-6', title: '模块复盘：如何迁移到别的产品', titleEn: 'Retrospective: Transferring to Other Products' },
    ],
  },
  {
    id: 5,
    title: 'Vibe Researching：撰写一篇SCI综述论文',
    titleEn: 'Vibe Researching: Write an SCI Review Paper',
    description: '文献准备、MCP扩展、写作配置、执行写作、事实核查',
    descriptionEn: 'Literature prep, MCP extensions, writing config, execution, fact-checking',
    icon: '05-vibe-researching/',
    topics: [
      { id: '5-1', title: '把Claude Code当作高质量信息加工器', titleEn: 'Claude Code as Information Processor' },
      { id: '5-2', title: '文献准备与资料组织', titleEn: 'Literature Preparation & Organization' },
      { id: '5-3', title: '用MCP扩展文献获取能力', titleEn: 'Extend with MCP for Literature' },
      { id: '5-4', title: '让Claude Code学会你的写作要求', titleEn: 'Teach Claude Code Your Writing Style' },
      { id: '5-5', title: '执行写作与人工Review', titleEn: 'Writing Execution & Human Review' },
      { id: '5-6', title: '事实核查与引用校验', titleEn: 'Fact-checking & Citation Verification' },
    ],
  },
  {
    id: 6,
    title: 'Vibe Presentation：制作高质量PPT',
    titleEn: 'Vibe Presentation: Create Quality Slides',
    description: 'AI PPT路线、Slidev入门、Claude Code + Slidev实战',
    descriptionEn: 'AI PPT approaches, Slidev intro, Claude Code + Slidev in practice',
    icon: '06-vibe-presentation/',
    topics: [
      { id: '6-1', title: 'AI PPT的三种主流路线', titleEn: 'Three AI PPT Approaches' },
      { id: '6-2', title: 'Slidev：为什么它适合Claude Code', titleEn: 'Slidev: Why It Fits Claude Code' },
      { id: '6-3', title: 'Claude Code + Slidev制作学术PPT', titleEn: 'Academic PPT with Claude Code + Slidev' },
      { id: '6-4', title: '用Skill提升PPT生成效率', titleEn: 'Boost Efficiency with Skills' },
    ],
  },
  {
    id: 7,
    title: 'Vibe Video：用写代码的方式制作视频',
    titleEn: 'Vibe Video: Code-driven Video Production',
    description: 'AI视频思路、Remotion入门、Claude Code + Remotion实战',
    descriptionEn: 'AI video approaches, Remotion intro, Claude Code + Remotion in practice',
    icon: '07-vibe-video/',
    topics: [
      { id: '7-1', title: 'AI视频与Vibe Video的基本思路', titleEn: 'AI Video & Vibe Video Basics' },
      { id: '7-2', title: 'Remotion快速入门', titleEn: 'Remotion Quick Start' },
      { id: '7-3', title: 'Claude Code + Remotion制作商业宣传片', titleEn: 'Commercial Video with Claude Code + Remotion' },
      { id: '7-4', title: '用Skill复用视频工作流', titleEn: 'Reuse Video Workflows with Skills' },
    ],
  },
  {
    id: 8,
    title: '课程总结与能力迁移',
    titleEn: 'Course Summary & Skill Transfer',
    description: '工作流回顾、能力迁移路径、FAQ、生态跟踪、结业挑战',
    descriptionEn: 'Workflow review, skill transfer paths, FAQ, ecosystem tracking, final challenge',
    icon: '08-summary/',
    topics: [
      { id: '8-1', title: '全课程工作流回顾', titleEn: 'Full Course Workflow Review' },
      { id: '8-2', title: '不同角色的能力迁移路径', titleEn: 'Skill Transfer Paths by Role' },
      { id: '8-3', title: '常见问题FAQ与排坑清单', titleEn: 'FAQ & Troubleshooting' },
      { id: '8-4', title: 'Claude Code生态跟踪与持续学习', titleEn: 'Ecosystem Tracking & Continuous Learning' },
      { id: '8-5', title: '结业挑战', titleEn: 'Final Challenge' },
    ],
  },
]

export const totalTopics = courseModules.reduce((sum, m) => sum + m.topics.length, 0)
