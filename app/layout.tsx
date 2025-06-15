import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Claude Code Review Assistant',
  description: 'AI-powered code review assistant using Claude Code SDK',
  keywords: ['code review', 'AI', 'Claude', 'GitHub', 'GitLab', 'development'],
  authors: [{ name: 'Claude Code Team' }],
  openGraph: {
    title: 'Claude Code Review Assistant',
    description: 'AI-powered code review assistant using Claude Code SDK',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude Code Review Assistant',
    description: 'AI-powered code review assistant using Claude Code SDK',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}