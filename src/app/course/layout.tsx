import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claude Code实战课程',
  description: '涵盖8大模块，从基础入门到进阶实战，全面掌握Claude Code驱动的AI编程工作流。',
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
