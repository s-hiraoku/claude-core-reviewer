# 技術スタック詳細設計

## 1. 技術スタック概要

### 1.1 アーキテクチャ方針

- **モダン Web 開発**: 2025 年のベストプラクティス準拠
- **フルスタック TypeScript**: 型安全性を最優先
- **AI-First**: Claude Code SDK を中心とした設計
- **クラウドネイティブ**: Supabase + Vercel によるサーバーレス構成

### 1.2 技術選定基準

- **開発効率**: 高い開発生産性
- **スケーラビリティ**: 将来の成長に対応
- **保守性**: 長期的なメンテナンス性
- **セキュリティ**: エンタープライズレベルの安全性

## 2. フロントエンド技術スタック

### 2.1 フレームワーク・コア

#### Next.js 15 (App Router)

```typescript
// Next.js 15の主要機能
- App Router: 最新のルーティングシステム
- Server Components: サーバーサイドレンダリング最適化
- Turbopack: 高速ビルドシステム
- Edge Runtime: エッジでの高速処理
```

**選定理由**:
- React Server Components による最適化
- App Router による直感的なルーティング
- Turbopack による高速開発体験
- Vercel との最適化された統合

#### TypeScript (厳密モード)

```typescript
// tsconfig.json設定例
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**選定理由**:
- 型安全性による品質向上
- 大規模開発での保守性
- IDE サポートの充実
- チーム開発での一貫性

### 2.2 状態管理

#### Jotai (原子的状態管理)

```typescript
// Atom設計例
const userAtom = atom<User | null>(null)
const prDataAtom = atom<PRData | null>(null)
const reviewResultsAtom = atom<ReviewResult[]>([])

// Derived atoms
const isAuthenticatedAtom = atom(get => get(userAtom) !== null)
const selectedFilesAtom = atom(
  get => get(prDataAtom)?.files.filter(f => f.selected) ?? []
)
```

**選定理由**:
- React Concurrent Features との相性
- 原子的な状態管理による予測可能性
- React Server Components との統合
- 軽量で学習コストが低い

### 2.3 UI・スタイリング

#### Tailwind CSS + shadcn/ui

```typescript
// コンポーネント例
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ReviewCard = ({ review }: { review: Review }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>{review.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="outline" size="sm">
        View Details
      </Button>
    </CardContent>
  </Card>
)
```

**選定理由**:
- shadcn/ui による高品質なコンポーネント
- Tailwind CSS による効率的なスタイリング
- アクセシビリティの標準サポート
- カスタマイズ性の高さ

## 3. バックエンド技術スタック

### 3.1 Backend as a Service

#### Supabase (Auth + Database + Realtime)

```typescript
// Supabase設定例
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
```

**機能構成**:
- **Supabase Auth**: OAuth 2.0 認証
- **PostgreSQL**: メインデータベース
- **Realtime**: リアルタイム更新
- **Storage**: ファイル・ルール保存
- **Edge Functions**: サーバーレス処理

**選定理由**:
- フルマネージドサービス
- PostgreSQL の強力な機能
- Row Level Security (RLS)
- リアルタイム機能の標準サポート

### 3.2 API Layer

#### Next.js API Routes (App Router)

```typescript
// API Route例
// app/api/github/pr/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prUrl = searchParams.get('url')
  
  if (!prUrl) {
    return NextResponse.json({ error: 'PR URL required' }, { status: 400 })
  }
  
  try {
    const prData = await fetchPRData(prUrl)
    return NextResponse.json(prData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch PR' }, { status: 500 })
  }
}
```

**API 構成**:
- `/api/github/*`: GitHub 関連処理
- `/api/gitlab/*`: GitLab 関連処理
- `/api/claude/*`: Claude 分析処理
- `/api/reviews/*`: レビュー管理

## 4. AI・分析技術スタック

### 4.1 メイン AI エンジン

#### Claude Code SDK

```typescript
// Claude Code SDK統合例
import { ClaudeCodeSDK } from '@anthropic-ai/claude-code-sdk'

const claude = new ClaudeCodeSDK({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022'
})

async function analyzeCode(
  code: string, 
  rules: string[], 
  context: CodeContext
) {
  const result = await claude.analyzeCode({
    code,
    rules,
    context,
    options: {
      includeLineNumbers: true,
      focusAreas: ['security', 'performance', 'maintainability']
    }
  })
  
  return result
}
```

**主要機能**:
- **ルールベース分析**: CLAUDE.md による組織ルール適用
- **コンテキスト理解**: プロジェクト全体の理解
- **多角的分析**: セキュリティ、パフォーマンス、保守性
- **インタラクティブ分析**: 行単位での詳細分析

### 4.2 ルール管理システム

#### CLAUDE.md ファイル統合

```markdown
# プロジェクトルール例
@rules/coding-standards.md
@rules/security-guidelines.md
@rules/performance-rules.md

## TypeScript ルール
- 厳密な型定義を使用
- any型の使用を避ける
- 適切なエラーハンドリング

## セキュリティルール
- 入力値の検証を必須とする
- 機密情報のログ出力を禁止
- HTTPS通信を強制
```

## 5. 外部API・サービス統合

### 5.1 GitHub API

```typescript
// GitHub API統合
class GitHubService {
  private octokit: Octokit
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }
  
  async getPRData(owner: string, repo: string, prNumber: number) {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    })
    
    return data
  }
  
  async getPRDiff(owner: string, repo: string, prNumber: number) {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: 'diff' }
    })
    
    return data
  }
}
```

**機能**:
- PR 情報取得
- ファイル差分取得
- コメント投稿
- レート制限対応

### 5.2 GitLab API

```typescript
// GitLab API統合
class GitLabService {
  private gitlab: Gitlab
  
  constructor(token: string) {
    this.gitlab = new Gitlab({ token })
  }
  
  async getMRData(projectId: string, mrId: number) {
    const mr = await this.gitlab.MergeRequests.show(projectId, mrId)
    return mr
  }
  
  async getMRDiff(projectId: string, mrId: number) {
    const changes = await this.gitlab.MergeRequests.changes(projectId, mrId)
    return changes
  }
}
```

## 6. 開発・運用技術スタック

### 6.1 開発環境

#### VS Code + Claude Code

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**開発ツール**:
- **VS Code**: メインエディタ
- **Claude Code**: AI ペアプログラミング
- **ESLint + Prettier**: コード品質
- **Husky**: Git hooks

### 6.2 品質保証

#### テスト戦略

```typescript
// テスト例
// __tests__/components/ReviewCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ReviewCard } from '@/components/ReviewCard'

describe('ReviewCard', () => {
  it('renders review information correctly', () => {
    const mockReview = {
      id: '1',
      title: 'Test Review',
      status: 'completed'
    }
    
    render(<ReviewCard review={mockReview} />)
    
    expect(screen.getByText('Test Review')).toBeInTheDocument()
  })
})
```

**テストスタック**:
- **Vitest**: 単体テスト
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2E テスト
- **MSW**: API モック

### 6.3 CI/CD

#### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

## 7. デプロイ・インフラ

### 7.1 プロダクション環境

#### Vercel + Supabase Pro

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@anthropic-ai/claude-code-sdk']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

module.exports = nextConfig
```

**インフラ構成**:
- **Vercel**: フロントエンド・API デプロイ
- **Supabase Pro**: データベース・認証・ストレージ
- **Vercel Analytics**: パフォーマンス監視
- **Sentry**: エラー監視

### 7.2 環境管理

```bash
# 環境別設定
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

## 8. パフォーマンス・スケーラビリティ

### 8.1 パフォーマンス最適化

- **SSR/ISR**: Next.js による初期表示高速化
- **コード分割**: React.lazy + Suspense
- **仮想化**: 大きなファイルの効率的表示
- **キャッシュ**: Next.js Cache + Supabase Cache

### 8.2 スケーラビリティ対策

- **データベース**: Supabase 自動スケーリング
- **API**: Edge Runtime による分散処理
- **ストレージ**: Supabase Storage の容量管理
- **監視**: パフォーマンスメトリクス収集

## 9. セキュリティ

### 9.1 認証・認可

- **OAuth 2.0**: GitHub/GitLab 認証
- **JWT**: Supabase による トークン管理
- **RLS**: Row Level Security
- **HTTPS**: 全通信暗号化

### 9.2 データ保護

- **暗号化**: データベース暗号化
- **バックアップ**: 自動バックアップ
- **監査ログ**: アクセス履歴記録
- **コンプライアンス**: GDPR/SOC2 準拠

## 10. 監視・ログ

### 10.1 アプリケーション監視

- **Vercel Analytics**: Core Web Vitals
- **Supabase Analytics**: データベース監視
- **Sentry**: エラー監視・トラッキング
- **Custom Metrics**: ビジネスメトリクス

### 10.2 ログ管理

```typescript
// ログ設定例
import { logger } from '@/lib/logger'

export async function analyzeCodeHandler(req: Request) {
  const startTime = Date.now()
  
  try {
    logger.info('Code analysis started', { 
      userId: req.user.id,
      prUrl: req.body.prUrl 
    })
    
    const result = await analyzeCode(req.body)
    
    logger.info('Code analysis completed', {
      userId: req.user.id,
      duration: Date.now() - startTime,
      linesAnalyzed: result.totalLines
    })
    
    return result
  } catch (error) {
    logger.error('Code analysis failed', {
      userId: req.user.id,
      error: error.message,
      duration: Date.now() - startTime
    })
    
    throw error
  }
}
```

この技術スタックにより、モダンで拡張性があり、保守性の高いコードレビューツールを構築します。