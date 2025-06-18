'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, Github, GitlabIcon as Gitlab, Zap, Shield, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // ユーザーがログイン済みの場合はダッシュボードにリダイレクト
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>ようこそ！</CardTitle>
            <CardDescription>
              ダッシュボードに移動しています...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">
                ダッシュボードへ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Claude Code Review</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#features">機能</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#about">について</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI駆動の
            <span className="text-primary">コードレビュー</span>
            で開発を加速
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Claude Code SDK を活用し、組織固有のルールに基づく包括的なコードレビューを自動化。
            開発効率を向上させ、コード品質を一貫して維持します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LandingAuthButton />
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">主要機能</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-first アプローチで、従来のコードレビューを革新します
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="AI-first レビュー"
            description="Claude Code SDK による包括的なコード分析と改善提案"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="組織ルール適用"
            description="CLAUDE.md による組織固有のルールの自動適用"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="チーム連携"
            description="GitHub/GitLab との統合によるシームレスなワークフロー"
          />
        </div>
      </section>

      {/* About セクション */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">開発チームの生産性を向上</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Claude Code Review Assistant は、現在MVP開発中のAI駆動コードレビューツールです。
            GitHub/GitLabのPR/MRに対して、組織固有のルールを適用した高品質なレビューを提供します。
          </p>
          <p className="text-sm text-muted-foreground">
            ※ 現在ベータ版として開発中です。フィードバックをお待ちしております。
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">Claude Code Review</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Claude Code Team. AI-powered code review assistant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LandingAuthButton() {
  const { signInWithGitHub, signInWithGitLab } = useAuth()

  return (
    <>
      <Button onClick={signInWithGitHub} size="lg" className="text-base px-8">
        <Github className="mr-2 h-5 w-5" />
        GitHubで始める
      </Button>
      <Button onClick={signInWithGitLab} size="lg" variant="outline" className="text-base px-8">
        <Gitlab className="mr-2 h-5 w-5" />
        GitLabで始める
      </Button>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}