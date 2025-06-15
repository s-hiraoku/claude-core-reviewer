# UI/UX設計

## 1. UI/UX設計概要

### 1.1 設計原則

- **ユーザーファースト**: 直感的で使いやすいインターフェース
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **パフォーマンス**: 高速なレンダリングとスムーズなインタラクション

### 1.2 デザインシステム

- **カラーパレット**: 視認性と一貫性を重視
- **タイポグラフィ**: 読みやすさとヒエラルキー
- **コンポーネント**: shadcn/ui ベースのカスタマイズ
- **アニメーション**: Framer Motion による微細なアニメーション

## 2. デザインシステム詳細

### 2.1 カラーパレット

```css
/* プライマリーカラー */
:root {
  /* ブランドカラー */
  --primary: 214 100% 50%;      /* ブルー #0080ff */
  --primary-hover: 214 100% 45%; /* ダークブルー */
  --primary-light: 214 100% 95%; /* ライトブルー */
  
  /* セマンティックカラー */
  --success: 142 76% 36%;        /* グリーン #16a34a */
  --warning: 38 92% 50%;         /* オレンジ #f59e0b */
  --error: 0 84% 60%;            /* レッド #ef4444 */
  --info: 200 98% 39%;           /* シアン #0ea5e9 */
  
  /* ニュートラルカラー */
  --background: 0 0% 100%;       /* ホワイト */
  --foreground: 222.2 84% 4.9%;  /* ダークグレー */
  --muted: 210 40% 98%;          /* ライトグレー */
  --muted-foreground: 215.4 16.3% 46.9%; /* ミディアムグレー */
  --border: 214.3 31.8% 91.4%;  /* ボーダーグレー */
  
  /* コードレビュー固有カラー */
  --code-addition: 142 76% 95%;  /* 追加行背景 */
  --code-deletion: 0 84% 95%;    /* 削除行背景 */
  --code-modification: 38 92% 95%; /* 変更行背景 */
  --comment-critical: 0 84% 95%; /* 重要コメント */
  --comment-warning: 38 92% 95%; /* 警告コメント */
  --comment-info: 200 98% 95%;   /* 情報コメント */
}

/* ダークモード */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  
  --code-addition: 142 76% 15%;
  --code-deletion: 0 84% 15%;
  --code-modification: 38 92% 15%;
}
```

### 2.2 タイポグラフィ

```css
/* フォントファミリー */
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
}

/* タイポグラフィスケール */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */

/* 見出しスタイル */
.heading-1 { 
  font-size: 2.25rem; 
  font-weight: 700; 
  line-height: 1.2; 
  letter-spacing: -0.02em; 
}

.heading-2 { 
  font-size: 1.875rem; 
  font-weight: 600; 
  line-height: 1.25; 
  letter-spacing: -0.01em; 
}

.heading-3 { 
  font-size: 1.5rem; 
  font-weight: 600; 
  line-height: 1.3; 
}

/* コード表示用 */
.code-text {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.4;
  font-variant-ligatures: normal;
}
```

### 2.3 スペーシングシステム

```css
/* スペーシングスケール (Tailwind CSS準拠) */
:root {
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
}
```

## 3. 画面設計

### 3.1 ランディングページ

```tsx
// components/pages/LandingPage.tsx
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-semibold">Claude Code Review</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">機能</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">料金</a>
            <a href="#docs" className="text-muted-foreground hover:text-foreground">ドキュメント</a>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">ログイン</Button>
            <Button size="sm">無料で始める</Button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-1 mb-6">
            AI駆動の
            <span className="text-primary">コードレビュー</span>
            で開発を加速
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Claude Code SDK を活用し、組織固有のルールに基づく包括的なコードレビューを自動化。
            開発効率を向上させ、コード品質を一貫して維持します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8">
              <Github className="mr-2 h-5 w-5" />
              GitHubで始める
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8">
              <GitlabIcon className="mr-2 h-5 w-5" />
              GitLabで始める
            </Button>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="heading-2 mb-4">主要機能</h2>
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
    </div>
  )
}
```

### 3.2 ダッシュボード

```tsx
// components/pages/Dashboard.tsx
export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* サイドバー */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-muted/40 border-r">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-semibold">Claude Review</span>
          </div>
          
          <nav className="space-y-2">
            <NavItem icon={<Home />} label="ダッシュボード" active />
            <NavItem icon={<FileText />} label="レビュー履歴" />
            <NavItem icon={<Settings />} label="ルール管理" />
            <NavItem icon={<Users />} label="組織管理" />
            <NavItem icon={<BarChart />} label="分析レポート" />
          </nav>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="ml-64 p-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-2">ダッシュボード</h1>
            <p className="text-muted-foreground">コードレビューの状況を確認</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新しいレビュー
            </Button>
            <UserMenu />
          </div>
        </header>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="今月のレビュー"
            value="24"
            change="+12%"
            trend="up"
            icon={<FileText className="h-5 w-5" />}
          />
          <StatsCard
            title="修正提案"
            value="156"
            change="+8%"
            trend="up"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <StatsCard
            title="平均スコア"
            value="92"
            change="+5%"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="処理時間"
            value="3.2分"
            change="-15%"
            trend="down"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* 最近のレビュー */}
        <Card>
          <CardHeader>
            <CardTitle>最近のレビュー</CardTitle>
            <CardDescription>
              最新のコードレビュー結果を確認できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewList reviews={recentReviews} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

### 3.3 レビュー画面

```tsx
// components/pages/ReviewPage.tsx
export function ReviewPage({ reviewId }: { reviewId: string }) {
  const { review, files, loading } = useReview(reviewId)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{review?.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{review?.repository_url}</span>
                <span>•</span>
                <StatusBadge status={review?.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              共有
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              コメント投稿
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* ファイルリスト */}
          <aside className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">変更ファイル</CardTitle>
                <CardDescription>
                  {files?.length || 0} ファイル
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <FileList 
                  files={files || []}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                />
              </CardContent>
            </Card>
          </aside>

          {/* メインコンテンツ */}
          <main className="col-span-9">
            {selectedFile ? (
              <DiffViewer
                file={selectedFile}
                analysisResults={analysisResults}
                onLineClick={(lineNumber) => handleLineAnalysis(lineNumber)}
              />
            ) : (
              <div className="space-y-6">
                {/* 概要 */}
                <Card>
                  <CardHeader>
                    <CardTitle>レビュー概要</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">基本情報</h3>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">作成者</dt>
                            <dd>{review?.author_username}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">ブランチ</dt>
                            <dd>{review?.head_branch} → {review?.base_branch}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">ファイル数</dt>
                            <dd>{review?.total_files}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">分析結果</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              総合スコア
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${review?.overall_score || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {review?.overall_score || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">検出された問題</span>
                            <span className="font-medium">{review?.issues_found || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Claude の分析サマリー */}
                {review?.claude_summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-primary" />
                        AI 分析サマリー
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{review.claude_summary}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 推奨事項 */}
                {review?.claude_recommendations && review.claude_recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>推奨事項</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {review.claude_recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
```

### 3.4 差分表示コンポーネント

```tsx
// components/ui/DiffViewer.tsx
interface DiffViewerProps {
  file: ReviewFile
  analysisResults: AnalysisResult[]
  onLineClick: (lineNumber: number) => void
}

export function DiffViewer({ file, analysisResults, onLineClick }: DiffViewerProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([])
  const [showComments, setShowComments] = useState(true)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileIcon filename={file.file_name} />
            <div>
              <h3 className="font-medium">{file.file_path}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Plus className="h-3 w-3 mr-1 text-green-600" />
                  +{file.additions}
                </span>
                <span className="flex items-center">
                  <Minus className="h-3 w-3 mr-1 text-red-600" />
                  -{file.deletions}
                </span>
                <StatusBadge status={file.analysis_status} size="sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              コメント {showComments ? '非表示' : '表示'}
            </Button>
            <Button variant="ghost" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI分析
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {/* 差分表示 */}
          <div className="font-mono text-sm">
            {file.diff_lines?.map((line, index) => (
              <DiffLine
                key={index}
                line={line}
                lineNumber={index + 1}
                isSelected={selectedLines.includes(index + 1)}
                comments={analysisResults.filter(r => r.line_number === index + 1)}
                showComments={showComments}
                onClick={() => onLineClick(index + 1)}
              />
            ))}
          </div>
          
          {/* 行コメント表示 */}
          {showComments && (
            <div className="absolute right-0 top-0 w-80 bg-background border-l h-full overflow-y-auto">
              <div className="p-4">
                <h4 className="font-medium mb-3">コメント</h4>
                <div className="space-y-3">
                  {analysisResults.map((result, index) => (
                    <CommentCard key={index} comment={result} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 差分行コンポーネント
function DiffLine({ 
  line, 
  lineNumber, 
  isSelected, 
  comments, 
  showComments, 
  onClick 
}: DiffLineProps) {
  const lineType = line.startsWith('+') ? 'addition' : 
                   line.startsWith('-') ? 'deletion' : 'context'
  
  return (
    <div 
      className={cn(
        'flex hover:bg-muted/50 cursor-pointer transition-colors',
        {
          'bg-green-50 dark:bg-green-950/20': lineType === 'addition',
          'bg-red-50 dark:bg-red-950/20': lineType === 'deletion',
          'bg-primary/10': isSelected
        }
      )}
      onClick={onClick}
    >
      <div className="w-12 px-2 py-1 text-muted-foreground text-right border-r bg-muted/20">
        {lineNumber}
      </div>
      <div className="flex-1 px-3 py-1 overflow-x-auto">
        <code className="whitespace-pre">{line}</code>
      </div>
      {comments.length > 0 && (
        <div className="w-8 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        </div>
      )}
    </div>
  )
}
```

## 4. レスポンシブデザイン

### 4.1 ブレークポイント

```css
/* ブレークポイント定義 */
:root {
  --breakpoint-sm: 640px;   /* モバイル横 */
  --breakpoint-md: 768px;   /* タブレット */
  --breakpoint-lg: 1024px;  /* デスクトップ小 */
  --breakpoint-xl: 1280px;  /* デスクトップ大 */
  --breakpoint-2xl: 1536px; /* デスクトップ特大 */
}

/* レスポンシブユーティリティ */
@media (max-width: 767px) {
  .mobile-hidden { display: none; }
  .mobile-full { width: 100%; }
  .mobile-stack { flex-direction: column; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .tablet-hidden { display: none; }
  .tablet-sidebar-collapsed { width: 4rem; }
}

@media (min-width: 1024px) {
  .desktop-expanded { width: auto; }
  .desktop-grid { display: grid; }
}
```

### 4.2 モバイル最適化

```tsx
// components/mobile/MobileDashboard.tsx
export function MobileDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* モバイルヘッダー */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <MobileNavigation />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">Claude Review</h1>
          </div>
          <UserAvatar />
        </div>
      </header>

      {/* モバイルコンテンツ */}
      <main className="p-4 space-y-6">
        {/* クイックアクション */}
        <Card>
          <CardContent className="p-4">
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              新しいレビューを開始
            </Button>
          </CardContent>
        </Card>

        {/* 統計概要 */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="今月"
            value="24"
            subtitle="レビュー"
            compact
          />
          <StatsCard
            title="平均"
            value="92"
            subtitle="スコア"
            compact
          />
        </div>

        {/* 最近のレビュー */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近のレビュー</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MobileReviewList reviews={recentReviews} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

## 5. アクセシビリティ

### 5.1 ARIA実装

```tsx
// components/ui/AccessibleDiffViewer.tsx
export function AccessibleDiffViewer({ file }: { file: ReviewFile }) {
  return (
    <div 
      role="region"
      aria-labelledby="diff-title"
      aria-describedby="diff-description"
    >
      <h2 id="diff-title" className="sr-only">
        {file.file_path} の差分表示
      </h2>
      <p id="diff-description" className="sr-only">
        {file.additions} 行追加、{file.deletions} 行削除
      </p>
      
      <div 
        role="grid"
        aria-label="コード差分"
        className="border rounded-lg overflow-hidden"
      >
        {file.diff_lines?.map((line, index) => (
          <div
            key={index}
            role="row"
            aria-rowindex={index + 1}
            className={cn(
              'flex',
              {
                'bg-green-50': line.startsWith('+'),
                'bg-red-50': line.startsWith('-')
              }
            )}
          >
            <div 
              role="gridcell"
              aria-label={`行番号 ${index + 1}`}
              className="w-12 px-2 py-1 text-right border-r"
            >
              {index + 1}
            </div>
            <div 
              role="gridcell"
              aria-label={
                line.startsWith('+') ? '追加された行' :
                line.startsWith('-') ? '削除された行' : '変更なし'
              }
              className="flex-1 px-3 py-1"
            >
              <code>{line}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 キーボードナビゲーション

```tsx
// hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl/Cmd + K でクイック検索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // 検索モーダル開く
        openSearchModal()
      }
      
      // Esc でモーダル閉じる
      if (event.key === 'Escape') {
        closeCurrentModal()
      }
      
      // 矢印キーでファイル選択
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const direction = event.key === 'ArrowUp' ? -1 : 1
        navigateFiles(direction)
      }
      
      // Enter でファイル選択
      if (event.key === 'Enter') {
        selectCurrentFile()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

## 6. パフォーマンス最適化

### 6.1 遅延読み込み

```tsx
// components/optimization/LazyComponents.ts
import { lazy } from 'react'

// 重いコンポーネントの遅延読み込み
export const DiffViewer = lazy(() => import('../ui/DiffViewer'))
export const AnalysisChart = lazy(() => import('../charts/AnalysisChart'))
export const RuleEditor = lazy(() => import('../rules/RuleEditor'))

// 遅延読み込みラッパー
export function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
```

### 6.2 仮想スクロール

```tsx
// components/ui/VirtualizedFileList.tsx
import { FixedSizeList as List } from 'react-window'

interface VirtualizedFileListProps {
  files: ReviewFile[]
  onFileSelect: (file: ReviewFile) => void
}

export function VirtualizedFileList({ files, onFileSelect }: VirtualizedFileListProps) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style} className="px-2">
      <FileListItem 
        file={files[index]} 
        onClick={() => onFileSelect(files[index])}
      />
    </div>
  )
  
  return (
    <List
      height={400}
      itemCount={files.length}
      itemSize={60}
      className="border rounded-lg"
    >
      {Row}
    </List>
  )
}
```

## 7. アニメーション

### 7.1 マイクロインタラクション

```tsx
// components/ui/AnimatedComponents.tsx
import { motion } from 'framer-motion'

export function AnimatedCard({ children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="transform-gpu"
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  )
}

export function FadeInList({ children }: { children: React.ReactNode[] }) {
  return (
    <motion.div>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ローディングアニメーション
export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
    />
  )
}
```

### 7.2 ページ遷移

```tsx
// components/ui/PageTransition.tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="transform-gpu"
    >
      {children}
    </motion.div>
  )
}
```

この包括的なUI/UX設計により、直感的で使いやすく、アクセシブルなコードレビューツールのインターフェースを構築できます。