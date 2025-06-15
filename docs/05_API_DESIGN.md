# API設計

## 1. API アーキテクチャ概要

### 1.1 API 設計原則

- **RESTful設計**: リソース指向の直感的なAPI
- **GraphQL対応**: 柔軟なデータ取得（将来対応）
- **型安全性**: TypeScript による厳密な型定義
- **セキュリティファースト**: 認証・認可・レート制限

### 1.2 技術構成

- **Next.js API Routes**: App Router による統合
- **tRPC**: 型安全なAPI通信（検討中）
- **Zod**: リクエスト・レスポンス検証
- **Edge Runtime**: 高速レスポンス

## 2. API エンドポイント設計

### 2.1 認証・ユーザー管理 API

#### `/api/auth/*`

```typescript
// app/api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code || !state) {
    return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 })
  }
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error`)
    }
    
    // プロファイル同期
    await syncUserProfile(data.user)
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error`)
  }
}
```

```typescript
// app/api/auth/profile/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  return NextResponse.json({ profile })
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const updateData = ProfileUpdateSchema.parse(body)
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
  
  return NextResponse.json({ profile: data })
}
```

### 2.2 GitHub API 統合

#### `/api/github/*`

```typescript
// app/api/github/pr/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const prUrl = searchParams.get('url')
  
  if (!prUrl) {
    return NextResponse.json({ error: 'PR URL is required' }, { status: 400 })
  }
  
  try {
    const prData = await fetchGitHubPRData(user.id, prUrl)
    return NextResponse.json({ data: prData })
  } catch (error) {
    console.error('GitHub PR fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch PR data' }, { status: 500 })
  }
}

// GitHub PR データ取得関数
async function fetchGitHubPRData(userId: string, prUrl: string) {
  const token = await getProviderToken(userId, 'github')
  const octokit = new Octokit({ auth: token })
  
  const { owner, repo, prNumber } = parseGitHubPRUrl(prUrl)
  
  // PR基本情報
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber
  })
  
  // ファイル変更情報
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber
  })
  
  // コミット情報
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: prNumber
  })
  
  return {
    pr: {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      user: pr.user,
      base: pr.base,
      head: pr.head,
      created_at: pr.created_at,
      updated_at: pr.updated_at
    },
    files: files.map(file => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      contents_url: file.contents_url
    })),
    commits: commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author,
      url: commit.html_url
    }))
  }
}
```

```typescript
// app/api/github/file/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const path = searchParams.get('path')
  const ref = searchParams.get('ref')
  
  if (!owner || !repo || !path) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  
  try {
    const token = await getProviderToken(user.id, 'github')
    const octokit = new Octokit({ auth: token })
    
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })
    
    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      return NextResponse.json({
        content,
        encoding: data.encoding,
        size: data.size,
        sha: data.sha
      })
    }
    
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  } catch (error) {
    console.error('GitHub file fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}
```

### 2.3 GitLab API 統合

#### `/api/gitlab/*`

```typescript
// app/api/gitlab/mr/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const mrUrl = searchParams.get('url')
  
  if (!mrUrl) {
    return NextResponse.json({ error: 'MR URL is required' }, { status: 400 })
  }
  
  try {
    const mrData = await fetchGitLabMRData(user.id, mrUrl)
    return NextResponse.json({ data: mrData })
  } catch (error) {
    console.error('GitLab MR fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch MR data' }, { status: 500 })
  }
}

// GitLab MR データ取得関数
async function fetchGitLabMRData(userId: string, mrUrl: string) {
  const token = await getProviderToken(userId, 'gitlab')
  const gitlab = new Gitlab({ token })
  
  const { projectId, mrIid } = parseGitLabMRUrl(mrUrl)
  
  // MR基本情報
  const mr = await gitlab.MergeRequests.show(projectId, mrIid)
  
  // 変更ファイル情報
  const changes = await gitlab.MergeRequests.changes(projectId, mrIid)
  
  // コミット情報
  const commits = await gitlab.MergeRequests.commits(projectId, mrIid)
  
  return {
    mr: {
      id: mr.id,
      iid: mr.iid,
      title: mr.title,
      description: mr.description,
      state: mr.state,
      author: mr.author,
      source_branch: mr.source_branch,
      target_branch: mr.target_branch,
      created_at: mr.created_at,
      updated_at: mr.updated_at
    },
    changes: changes.changes?.map(change => ({
      old_path: change.old_path,
      new_path: change.new_path,
      new_file: change.new_file,
      renamed_file: change.renamed_file,
      deleted_file: change.deleted_file,
      diff: change.diff
    })) || [],
    commits: commits.map(commit => ({
      id: commit.id,
      message: commit.message,
      author_name: commit.author_name,
      author_email: commit.author_email,
      created_at: commit.created_at
    }))
  }
}
```

### 2.4 Claude AI 分析 API

#### `/api/claude/*`

```typescript
// app/api/claude/analyze/route.ts
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // レート制限チェック
  const rateLimitResult = await checkRateLimit(user.id, 'code_analysis', 10, 60000)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    )
  }
  
  const body = await request.json()
  const { code, filePath, language, ruleSetIds, analysisType } = AnalysisRequestSchema.parse(body)
  
  try {
    const analysisResult = await analyzeCodeWithClaude({
      code,
      filePath,
      language,
      ruleSetIds,
      analysisType,
      userId: user.id
    })
    
    return NextResponse.json({ result: analysisResult })
  } catch (error) {
    console.error('Code analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

// Claude分析メイン関数
async function analyzeCodeWithClaude({
  code,
  filePath,
  language,
  ruleSetIds,
  analysisType,
  userId
}: AnalysisRequest): Promise<AnalysisResult> {
  // ルールセット読み込み
  const rules = await loadRuleSets(ruleSetIds, userId)
  
  // Claude Code SDK初期化
  const claude = new ClaudeCodeSDK({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-5-sonnet-20241022'
  })
  
  // 分析実行
  const result = await claude.analyzeCode({
    code,
    filePath,
    language,
    rules: rules.map(r => r.claude_md_content),
    analysisType,
    options: {
      includeLineNumbers: true,
      focusAreas: analysisType === 'comprehensive' 
        ? ['security', 'performance', 'maintainability', 'style']
        : [analysisType],
      confidenceThreshold: 0.7
    }
  })
  
  return {
    overall_score: result.overallScore,
    summary: result.summary,
    recommendations: result.recommendations,
    issues: result.issues.map(issue => ({
      line_number: issue.lineNumber,
      column_start: issue.columnStart,
      column_end: issue.columnEnd,
      severity: issue.severity,
      category: issue.category,
      title: issue.title,
      description: issue.description,
      suggested_fix: issue.suggestedFix,
      confidence: issue.confidence,
      rule_applied: issue.ruleApplied
    })),
    metadata: {
      analysis_time: result.metadata.analysisTime,
      tokens_used: result.metadata.tokensUsed,
      rules_applied: result.metadata.rulesApplied,
      language_detected: result.metadata.languageDetected
    }
  }
}
```

```typescript
// app/api/claude/batch-analyze/route.ts
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { reviewId, fileIds } = BatchAnalysisRequestSchema.parse(body)
  
  // アクセス権限確認
  const hasAccess = await canAccessReview(user.id, reviewId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  try {
    // バックグラウンドで分析開始
    const jobId = await startBatchAnalysis(reviewId, fileIds, user.id)
    
    return NextResponse.json({ 
      jobId,
      status: 'started',
      message: 'Batch analysis started'
    })
  } catch (error) {
    console.error('Batch analysis error:', error)
    return NextResponse.json({ error: 'Failed to start batch analysis' }, { status: 500 })
  }
}
```

### 2.5 レビュー管理 API

#### `/api/reviews/*`

```typescript
// app/api/reviews/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const status = searchParams.get('status')
  const organizationId = searchParams.get('organization_id')
  
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user_profiles!inner(username, display_name, avatar_url),
      organizations(name, slug)
    `)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }
  
  const { data: reviews, error } = await query
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
  
  return NextResponse.json({ reviews, page, limit })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const reviewData = CreateReviewSchema.parse(body)
  
  try {
    // PR/MRデータ取得
    const prData = reviewData.provider === 'github' 
      ? await fetchGitHubPRData(user.id, reviewData.pr_url)
      : await fetchGitLabMRData(user.id, reviewData.pr_url)
    
    // レビュー作成
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        user_id: user.id,
        title: prData.pr?.title || prData.mr?.title,
        description: prData.pr?.body || prData.mr?.description,
        author_username: prData.pr?.user?.login || prData.mr?.author?.username,
        base_branch: prData.pr?.base?.ref || prData.mr?.target_branch,
        head_branch: prData.pr?.head?.ref || prData.mr?.source_branch,
        total_files: prData.files?.length || prData.changes?.length || 0
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }
    
    // ファイル情報保存
    if (prData.files || prData.changes) {
      const files = (prData.files || prData.changes).map(file => ({
        review_id: review.id,
        file_path: file.filename || file.new_path,
        file_name: path.basename(file.filename || file.new_path),
        file_extension: path.extname(file.filename || file.new_path),
        status: file.status || (file.new_file ? 'added' : file.deleted_file ? 'deleted' : 'modified'),
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0
      }))
      
      await supabase.from('review_files').insert(files)
    }
    
    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
```

```typescript
// app/api/reviews/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const reviewId = params.id
  
  // アクセス権限確認
  const hasAccess = await canAccessReview(user.id, reviewId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  const { data: review, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user_profiles!inner(username, display_name, avatar_url),
      organizations(name, slug),
      review_files(*),
      line_comments(*)
    `)
    .eq('id', reviewId)
    .single()
  
  if (error) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }
  
  return NextResponse.json({ review })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const reviewId = params.id
  
  // 編集権限確認
  const canModify = await canModifyReview(user.id, reviewId)
  if (!canModify) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  const body = await request.json()
  const updateData = UpdateReviewSchema.parse(body)
  
  const { data: review, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
  
  return NextResponse.json({ review })
}
```

### 2.6 ルール管理 API

#### `/api/rules/*`

```typescript
// app/api/rules/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organization_id')
  const isPublic = searchParams.get('public') === 'true'
  
  let query = supabase
    .from('rule_sets')
    .select(`
      *,
      user_profiles!created_by(username, display_name),
      organizations(name, slug)
    `)
  
  if (isPublic) {
    query = query.eq('is_public', true)
  } else {
    query = query.or(`created_by.eq.${user.id},is_shared.eq.true,is_public.eq.true`)
  }
  
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }
  
  const { data: ruleSets, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rule sets' }, { status: 500 })
  }
  
  return NextResponse.json({ ruleSets })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const ruleSetData = CreateRuleSetSchema.parse(body)
  
  const { data: ruleSet, error } = await supabase
    .from('rule_sets')
    .insert({
      ...ruleSetData,
      created_by: user.id
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: 'Failed to create rule set' }, { status: 500 })
  }
  
  return NextResponse.json({ ruleSet }, { status: 201 })
}
```

## 3. スキーマ定義 (Zod)

### 3.1 リクエスト・レスポンス型定義

```typescript
// lib/schemas/api.ts
import { z } from 'zod'

// 認証関連
export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(255).optional(),
  website_url: z.string().url().optional(),
  preferences: z.record(z.any()).optional()
})

// レビュー関連
export const CreateReviewSchema = z.object({
  provider: z.enum(['github', 'gitlab']),
  pr_url: z.string().url(),
  organization_id: z.string().uuid().optional(),
  rule_set_ids: z.array(z.string().uuid()).optional(),
  analysis_config: z.record(z.any()).optional(),
  is_public: z.boolean().default(false),
  is_shared_with_org: z.boolean().default(false)
})

export const UpdateReviewSchema = z.object({
  status: z.enum(['pending', 'analyzing', 'completed', 'failed']).optional(),
  overall_score: z.number().min(0).max(100).optional(),
  claude_summary: z.string().optional(),
  claude_recommendations: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  is_shared_with_org: z.boolean().optional()
})

// 分析関連
export const AnalysisRequestSchema = z.object({
  code: z.string().min(1),
  filePath: z.string().min(1),
  language: z.string().optional(),
  ruleSetIds: z.array(z.string().uuid()).optional(),
  analysisType: z.enum(['security', 'performance', 'maintainability', 'style', 'comprehensive'])
})

export const BatchAnalysisRequestSchema = z.object({
  reviewId: z.string().uuid(),
  fileIds: z.array(z.string().uuid())
})

// ルール関連
export const CreateRuleSetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  organization_id: z.string().uuid().optional(),
  claude_md_content: z.string().min(1),
  language_filters: z.array(z.string()).optional(),
  file_pattern_filters: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
  is_shared: z.boolean().default(false),
  tags: z.array(z.string()).optional()
})

// レスポンス型
export const AnalysisResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  recommendations: z.array(z.string()),
  issues: z.array(z.object({
    line_number: z.number(),
    column_start: z.number().optional(),
    column_end: z.number().optional(),
    severity: z.enum(['critical', 'major', 'minor', 'info']),
    category: z.string(),
    title: z.string(),
    description: z.string(),
    suggested_fix: z.string().optional(),
    confidence: z.number().min(0).max(1),
    rule_applied: z.string().optional()
  })),
  metadata: z.object({
    analysis_time: z.number(),
    tokens_used: z.number(),
    rules_applied: z.array(z.string()),
    language_detected: z.string().optional()
  })
})

// 型エクスポート
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>
export type CreateReview = z.infer<typeof CreateReviewSchema>
export type UpdateReview = z.infer<typeof UpdateReviewSchema>
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type CreateRuleSet = z.infer<typeof CreateRuleSetSchema>
```

## 4. エラーハンドリング

### 4.1 統一エラーレスポンス

```typescript
// lib/api/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      },
      { status: 400 }
    )
  }
  
  // 予期しないエラー
  return NextResponse.json(
    { 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  )
}

// エラーハンドリングミドルウェア
export function withErrorHandling(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}
```

### 4.2 レート制限

```typescript
// lib/api/rate-limit.ts
interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `rate_limit:${userId}:${action}`
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const windowKey = `${key}:${window}`
  
  // Redis または Supabase での実装
  const current = await incrementCounter(windowKey, windowMs)
  
  const remaining = Math.max(0, maxRequests - current)
  const resetTime = (window + 1) * windowMs
  
  return {
    allowed: current <= maxRequests,
    remaining,
    resetTime
  }
}

// レート制限ミドルウェア
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000,
  action: string = 'api_call'
) {
  return function(handler: Function) {
    return async (request: NextRequest, context?: any) => {
      const user = await getAuthenticatedUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const rateLimitResult = await checkRateLimit(user.id, action, maxRequests, windowMs)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
            }
          }
        )
      }
      
      const response = await handler(request, context)
      
      // レート制限ヘッダーを追加
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
      
      return response
    }
  }
}
```

## 5. API ドキュメント生成

### 5.1 OpenAPI スキーマ

```typescript
// lib/api/openapi.ts
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Claude Code Review API',
    version: '1.0.0',
    description: 'AI-powered code review assistant API'
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL + '/api',
      description: 'Production server'
    }
  ],
  paths: {
    '/auth/profile': {
      get: {
        summary: 'Get user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' }
              }
            }
          }
        }
      }
    },
    '/reviews': {
      get: {
        summary: 'List reviews',
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 }
          }
        ],
        responses: {
          200: {
            description: 'List of reviews',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reviews: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Review' }
                    },
                    page: { type: 'integer' },
                    limit: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          display_name: { type: 'string' },
          avatar_url: { type: 'string', format: 'uri' }
        }
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          status: { 
            type: 'string', 
            enum: ['pending', 'analyzing', 'completed', 'failed'] 
          },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
}
```

この包括的なAPI設計により、型安全で拡張性があり、エラーハンドリングが適切なバックエンドシステムを構築できます。