# MVP開発計画

## 1. MVP概要

### 1.1 MVP目標

- **期間**: 10-14日間での完成
- **スコープ**: GitHub PRの基本的なAIレビュー機能
- **技術**: Next.js 15 + Supabase + Claude Code SDK
- **成果物**: 実動するコードレビューツールのプロトタイプ

### 1.2 MVP機能範囲

#### 含む機能
- GitHub OAuth認証
- GitHub PR取得・表示
- Claude Code SDKによる基本分析
- 差分表示UI
- 分析結果表示
- 基本的なユーザープロファイル

#### 含まない機能（将来対応）
- GitLab対応
- 組織管理
- 高度なルール管理
- GitHub/GitLabへのコメント投稿
- リアルタイム機能

## 2. 開発フェーズ詳細

### Phase 1: 基盤構築（2-3日）

#### Day 1: プロジェクト初期化
```bash
# プロジェクト作成と基本セットアップ
npx create-next-app@latest claude-code-reviewer \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd claude-code-reviewer

# 依存関係インストール
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @anthropic-ai/claude-code-sdk
npm install @octokit/rest
npm install jotai
npm install @radix-ui/react-* lucide-react
npm install framer-motion
npm install zod
npm install react-diff-viewer-continued

# 開発用依存関係
npm install -D @types/node
npm install -D vitest @vitejs/plugin-react
npm install -D eslint-config-prettier prettier
```

**成果物**:
- Next.js 15プロジェクト初期化
- 基本的な依存関係設定
- ESLint/Prettier設定
- 基本的なフォルダ構造

#### Day 2: Supabaseセットアップ
```sql
-- データベーススキーマ（MVP版）
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  github_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pr_url TEXT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  overall_score INTEGER,
  claude_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.line_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  line_number INTEGER NOT NULL,
  severity VARCHAR(50) DEFAULT 'info',
  category VARCHAR(100),
  title VARCHAR(500),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS設定
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_comments ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view comments on own reviews" ON line_comments
  FOR SELECT USING (
    review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
  );
```

**成果物**:
- Supabase プロジェクト作成
- MVP用データベーススキーマ
- GitHub OAuth 設定
- 環境変数設定

#### Day 3: 基本認証実装
```tsx
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()

// components/auth/AuthButton.tsx
export function AuthButton() {
  const { user, loading } = useAuth()
  
  if (loading) return <Spinner />
  
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>{user.user_metadata.name?.[0]}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleSignOut}>
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <Button onClick={handleGitHubSignIn}>
      <Github className="mr-2 h-4 w-4" />
      GitHubでログイン
    </Button>
  )
}
```

**成果物**:
- GitHub OAuth認証フロー
- ユーザー状態管理（Jotai）
- 基本的なUI コンポーネント
- 認証ガード実装

### Phase 2: GitHub統合（2-3日）

#### Day 4: GitHub API統合
```tsx
// lib/github/api.ts
import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }
  
  async getPRData(prUrl: string) {
    const { owner, repo, prNumber } = this.parsePRUrl(prUrl)
    
    const [pr, files] = await Promise.all([
      this.octokit.rest.pulls.get({ owner, repo, pull_number: prNumber }),
      this.octokit.rest.pulls.listFiles({ owner, repo, pull_number: prNumber })
    ])
    
    return { pr: pr.data, files: files.data }
  }
  
  private parsePRUrl(url: string) {
    // GitHub PR URLパース
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/)
    if (!match) throw new Error('Invalid GitHub PR URL')
    
    return {
      owner: match[1],
      repo: match[2],
      prNumber: parseInt(match[3])
    }
  }
}

// app/api/github/pr/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(request.url)
  const prUrl = searchParams.get('url')
  
  if (!prUrl) {
    return NextResponse.json({ error: 'PR URL required' }, { status: 400 })
  }
  
  try {
    const token = user.user_metadata.provider_token
    const github = new GitHubService(token)
    const prData = await github.getPRData(prUrl)
    
    return NextResponse.json({ data: prData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch PR' }, { status: 500 })
  }
}
```

**成果物**:
- GitHub API クライアント
- PR情報取得API
- ファイル差分取得
- エラーハンドリング

#### Day 5: PR取得UI
```tsx
// components/reviews/CreateReviewForm.tsx
export function CreateReviewForm() {
  const [prUrl, setPrUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { createReview } = useReviews()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // PR情報取得
      const response = await fetch(`/api/github/pr?url=${encodeURIComponent(prUrl)}`)
      const { data } = await response.json()
      
      // レビュー作成
      await createReview({
        pr_url: prUrl,
        title: data.pr.title,
        description: data.pr.body,
        files: data.files
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast.error('PR の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>新しいレビューを開始</CardTitle>
        <CardDescription>
          GitHub PR の URL を入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pr-url">PR URL</Label>
            <Input
              id="pr-url"
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            レビューを開始
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**成果物**:
- PR URL入力フォーム
- PR情報プレビュー
- レビュー作成フロー
- 基本的なダッシュボード

#### Day 6: データ永続化
```tsx
// hooks/useReviews.ts
export function useReviews() {
  const [reviews, setReviews] = useAtom(reviewsAtom)
  const { user } = useAuth()
  
  const createReview = async (reviewData: CreateReviewData) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        pr_url: reviewData.pr_url,
        title: reviewData.title,
        description: reviewData.description,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    setReviews(prev => [data, ...prev])
    return data
  }
  
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setReviews(data)
  }
  
  return { reviews, createReview, fetchReviews }
}
```

**成果物**:
- レビューデータ永続化
- Jotaiによる状態管理
- レビュー一覧表示
- 基本的なCRUD操作

### Phase 3: 差分表示（1-2日）

#### Day 7: 差分UI実装
```tsx
// components/reviews/DiffViewer.tsx
import ReactDiffViewer from 'react-diff-viewer-continued'

export function DiffViewer({ file }: { file: PRFile }) {
  const [selectedLines, setSelectedLines] = useState<number[]>([])
  
  const renderGutter = (lineNumber: number) => (
    <div 
      className="cursor-pointer hover:bg-blue-100 px-2"
      onClick={() => handleLineClick(lineNumber)}
    >
      {selectedLines.includes(lineNumber) && (
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  )
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileIcon filename={file.filename} />
            <div>
              <h3 className="font-medium">{file.filename}</h3>
              <div className="text-sm text-muted-foreground">
                +{file.additions} -{file.deletions}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI分析
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ReactDiffViewer
          oldValue={file.old_content || ''}
          newValue={file.new_content || file.patch || ''}
          splitView
          hideLineNumbers={false}
          renderGutter={renderGutter}
          styles={{
            variables: {
              light: {
                diffViewerBackground: 'white',
                addedBackground: '#e6ffed',
                removedBackground: '#ffeef0'
              }
            }
          }}
        />
      </CardContent>
    </Card>
  )
}
```

**成果物**:
- GitHub風差分表示
- 行選択機能
- ファイルナビゲーション
- レスポンシブ対応

### Phase 4: Claude統合（2-3日）

#### Day 8-9: Claude Code SDK統合
```tsx
// lib/claude/analyzer.ts
import { ClaudeCodeSDK } from '@anthropic-ai/claude-code-sdk'

export class CodeAnalyzer {
  private claude: ClaudeCodeSDK
  
  constructor() {
    this.claude = new ClaudeCodeSDK({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022'
    })
  }
  
  async analyzeFile(file: PRFile): Promise<AnalysisResult> {
    const analysis = await this.claude.analyzeCode({
      code: file.new_content,
      filePath: file.filename,
      language: this.detectLanguage(file.filename),
      options: {
        includeLineNumbers: true,
        focusAreas: ['security', 'performance', 'maintainability'],
        confidenceThreshold: 0.7
      }
    })
    
    return {
      overall_score: analysis.overallScore,
      summary: analysis.summary,
      issues: analysis.issues.map(issue => ({
        line_number: issue.lineNumber,
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        suggested_fix: issue.suggestedFix
      }))
    }
  }
  
  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust'
    }
    return languageMap[ext || ''] || 'text'
  }
}

// app/api/claude/analyze/route.ts
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { reviewId, fileData } = await request.json()
  
  try {
    const analyzer = new CodeAnalyzer()
    const result = await analyzer.analyzeFile(fileData)
    
    // 結果をデータベースに保存
    await saveAnalysisResult(reviewId, result)
    
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

**成果物**:
- Claude Code SDK統合
- コード分析API
- 分析結果の永続化
- エラーハンドリング

#### Day 10: 分析結果表示
```tsx
// components/reviews/AnalysisResults.tsx
export function AnalysisResults({ review }: { review: Review }) {
  const { analysisResults, loading } = useAnalysisResults(review.id)
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p>AI分析中...</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 概要スコア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI分析結果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span>総合スコア</span>
                <span className="font-semibold">{review.overall_score}/100</span>
              </div>
              <Progress value={review.overall_score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* サマリー */}
      {review.claude_summary && (
        <Card>
          <CardHeader>
            <CardTitle>分析サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{review.claude_summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 詳細な問題 */}
      <Card>
        <CardHeader>
          <CardTitle>検出された問題</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResults.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IssueCard({ issue }: { issue: LineComment }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <SeverityBadge severity={issue.severity} />
          <span className="font-medium">{issue.title}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          行 {issue.line_number}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {issue.description}
      </p>
      {issue.suggested_fix && (
        <div className="bg-muted p-3 rounded text-sm">
          <strong>修正提案:</strong> {issue.suggested_fix}
        </div>
      )}
    </div>
  )
}
```

**成果物**:
- 分析結果表示UI
- 問題の可視化
- 修正提案表示
- インタラクティブな体験

### Phase 5: 統合・テスト・仕上げ（1-2日）

#### Day 11: 統合とバグ修正
```tsx
// 全体フローの統合
// components/reviews/ReviewWorkflow.tsx
export function ReviewWorkflow() {
  const [currentStep, setCurrentStep] = useState<'input' | 'loading' | 'analysis' | 'results'>('input')
  const [review, setReview] = useState<Review | null>(null)
  
  const handlePRSubmit = async (prUrl: string) => {
    setCurrentStep('loading')
    
    try {
      // 1. PR情報取得
      const prData = await fetchPRData(prUrl)
      
      // 2. レビュー作成
      const newReview = await createReview(prData)
      setReview(newReview)
      
      // 3. 分析開始
      setCurrentStep('analysis')
      await analyzeReview(newReview.id)
      
      // 4. 結果表示
      setCurrentStep('results')
    } catch (error) {
      toast.error('レビューの作成に失敗しました')
      setCurrentStep('input')
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {currentStep === 'input' && (
        <CreateReviewForm onSubmit={handlePRSubmit} />
      )}
      {currentStep === 'loading' && (
        <LoadingState message="PR情報を取得中..." />
      )}
      {currentStep === 'analysis' && (
        <LoadingState message="AI分析中..." />
      )}
      {currentStep === 'results' && review && (
        <ReviewResults review={review} />
      )}
    </div>
  )
}
```

**成果物**:
- エンドツーエンドフロー
- バグ修正
- パフォーマンス最適化
- ユーザビリティ改善

#### Day 12: テストとドキュメント
```typescript
// __tests__/components/CreateReviewForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateReviewForm } from '@/components/reviews/CreateReviewForm'

describe('CreateReviewForm', () => {
  it('should submit valid PR URL', async () => {
    const mockOnSubmit = jest.fn()
    render(<CreateReviewForm onSubmit={mockOnSubmit} />)
    
    const input = screen.getByLabelText('PR URL')
    const button = screen.getByText('レビューを開始')
    
    fireEvent.change(input, {
      target: { value: 'https://github.com/owner/repo/pull/123' }
    })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        'https://github.com/owner/repo/pull/123'
      )
    })
  })
  
  it('should show error for invalid URL', async () => {
    render(<CreateReviewForm onSubmit={jest.fn()} />)
    
    const input = screen.getByLabelText('PR URL')
    fireEvent.change(input, { target: { value: 'invalid-url' } })
    fireEvent.blur(input)
    
    expect(screen.getByText('有効なGitHub PR URLを入力してください'))
      .toBeInTheDocument()
  })
})

// README.md作成
# Claude Code Review Assistant MVP

## 概要
GitHub PRに対するAI駆動のコードレビューツール

## 機能
- GitHub OAuth認証
- PR情報取得・表示
- Claude AI による コード分析
- 分析結果可視化

## セットアップ
1. 環境変数設定（.env.local）
2. npm install
3. npm run dev

## 使用方法
1. GitHubでログイン
2. PR URLを入力
3. AI分析結果を確認
```

**成果物**:
- 基本テストカバレッジ
- README・ドキュメント
- デプロイ準備
- 最終動作確認

## 3. 技術的考慮事項

### 3.1 パフォーマンス

```tsx
// レスポンス最適化
export async function analyzeCodeOptimized(code: string) {
  // 大きなファイルは分割して分析
  if (code.length > 10000) {
    const chunks = splitCodeIntoChunks(code)
    const results = await Promise.all(
      chunks.map(chunk => analyzeCodeChunk(chunk))
    )
    return mergeAnalysisResults(results)
  }
  
  return analyzeCodeChunk(code)
}

// キャッシュ戦略
const analysisCache = new Map<string, AnalysisResult>()

export async function getCachedAnalysis(codeHash: string, code: string) {
  if (analysisCache.has(codeHash)) {
    return analysisCache.get(codeHash)
  }
  
  const result = await analyzeCode(code)
  analysisCache.set(codeHash, result)
  return result
}
```

### 3.2 エラーハンドリング

```tsx
// 段階的エラー回復
export class AnalysisService {
  async analyzeWithFallback(code: string) {
    try {
      return await this.fullAnalysis(code)
    } catch (error) {
      console.warn('Full analysis failed, falling back to basic analysis')
      try {
        return await this.basicAnalysis(code)
      } catch (fallbackError) {
        console.error('All analysis methods failed')
        return this.getEmptyAnalysis()
      }
    }
  }
}
```

### 3.3 スケーラビリティ

```tsx
// バックグラウンド処理
export async function queueAnalysis(reviewId: string) {
  await supabase.from('analysis_queue').insert({
    review_id: reviewId,
    status: 'queued',
    priority: 'normal'
  })
  
  // ワーカーで処理
  triggerBackgroundWorker(reviewId)
}
```

## 4. デプロイ戦略

### 4.1 Vercel デプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# プロジェクト初期化
vercel

# 環境変数設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ANTHROPIC_API_KEY

# デプロイ
vercel --prod
```

### 4.2 環境設定

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@anthropic-ai/claude-code-sdk']
  },
  images: {
    domains: ['avatars.githubusercontent.com']
  }
}

module.exports = nextConfig
```

## 5. 成功指標とテスト

### 5.1 MVP成功指標

- **技術指標**:
  - ページロード時間 < 3秒
  - 分析完了時間 < 30秒
  - エラー率 < 5%

- **機能指標**:
  - GitHub認証成功率 > 95%
  - PR取得成功率 > 90%
  - 分析完了率 > 85%

- **ユーザー指標**:
  - タスク完了率 > 80%
  - ユーザー満足度 > 3.5/5
  - リピート利用率 > 60%

### 5.2 ユーザーテスト

```typescript
// ユーザーテストシナリオ
const testScenarios = [
  {
    name: '基本フロー',
    steps: [
      'GitHubでログイン',
      'PR URLを入力',
      '分析結果を確認',
      'ダッシュボードでレビュー一覧を確認'
    ],
    expectedTime: '< 5分',
    successCriteria: 'エラーなくタスク完了'
  },
  {
    name: 'エラーハンドリング',
    steps: [
      '無効なPR URLを入力',
      'エラーメッセージを確認',
      '正しいURLで再試行'
    ],
    expectedTime: '< 2分',
    successCriteria: '適切なエラーメッセージとリカバリ'
  }
]
```

この包括的なMVP開発計画に従って、10-14日間で実動するコードレビューツールを構築します。各フェーズの成果物を確実に完成させることで、段階的に機能を積み上げていき、最終的に価値のあるMVPを完成させます。