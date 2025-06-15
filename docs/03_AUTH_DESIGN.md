# 認証・セキュリティ設計

## 1. 認証アーキテクチャ概要

### 1.1 認証方式

- **OAuth 2.0**: GitHub/GitLab 認証
- **JWT**: Supabase による セッション管理
- **RLS**: Row Level Security による データアクセス制御
- **MFA**: 多要素認証対応（オプション）

### 1.2 セキュリティ原則

- **最小権限の原則**: 必要最小限のアクセス権限
- **防御の多層化**: 複数のセキュリティレイヤー
- **ゼロトラスト**: すべてのアクセスを検証
- **プライバシー保護**: GDPR/個人情報保護法準拠

## 2. Supabase Auth 設計

### 2.1 OAuth 認証フロー

#### GitHub OAuth

```typescript
// GitHub OAuth設定
const githubOAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  scope: [
    'read:user',        // ユーザー基本情報
    'user:email',       // メールアドレス
    'read:org',         // 組織情報
    'repo'              // リポジトリアクセス（プライベートも含む）
  ].join(' ')
}

// 認証フロー実装
async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: githubOAuthConfig.scope,
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) {
    console.error('GitHub OAuth error:', error)
    throw new Error('GitHub認証に失敗しました')
  }
  
  return data
}
```

#### GitLab OAuth

```typescript
// GitLab OAuth設定
const gitlabOAuthConfig = {
  clientId: process.env.GITLAB_CLIENT_ID,
  clientSecret: process.env.GITLAB_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  scope: [
    'read_user',        // ユーザー基本情報
    'read_repository',  // リポジトリ読み取り
    'read_api',         // API アクセス
    'write_repository'  // MR へのコメント投稿
  ].join(' ')
}

// 認証フロー実装
async function signInWithGitLab() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'gitlab',
    options: {
      scopes: gitlabOAuthConfig.scope,
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) {
    console.error('GitLab OAuth error:', error)
    throw new Error('GitLab認証に失敗しました')
  }
  
  return data
}
```

### 2.2 セッション管理

```typescript
// セッション管理設定
const supabaseAuthConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  storage: {
    getItem: (key: string) => {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key)
      }
      return null
    },
    setItem: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value)
      }
    },
    removeItem: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    }
  }
}

// セッション状態管理
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // セッション変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // セッション変更時の処理
        if (event === 'SIGNED_IN') {
          await syncUserProfile(session?.user)
        } else if (event === 'SIGNED_OUT') {
          // クリーンアップ処理
          clearUserData()
        }
      }
    )
    
    return () => subscription?.unsubscribe()
  }, [])
  
  return { user, session, loading }
}
```

## 3. ユーザープロファイル管理

### 3.1 プロファイル同期

```typescript
// ユーザープロファイル同期
async function syncUserProfile(user: User) {
  try {
    // GitHub プロバイダーの場合
    if (user.app_metadata.provider === 'github') {
      const githubProfile = await fetchGitHubProfile(user.user_metadata.provider_token)
      
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          provider: 'github',
          provider_id: githubProfile.id,
          username: githubProfile.login,
          display_name: githubProfile.name,
          avatar_url: githubProfile.avatar_url,
          email: githubProfile.email,
          github_data: {
            organizations: await fetchGitHubOrganizations(user.user_metadata.provider_token),
            repositories: await fetchGitHubRepositories(user.user_metadata.provider_token)
          },
          updated_at: new Date().toISOString()
        })
    }
    
    // GitLab プロバイダーの場合
    if (user.app_metadata.provider === 'gitlab') {
      const gitlabProfile = await fetchGitLabProfile(user.user_metadata.provider_token)
      
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          provider: 'gitlab',
          provider_id: gitlabProfile.id,
          username: gitlabProfile.username,
          display_name: gitlabProfile.name,
          avatar_url: gitlabProfile.avatar_url,
          email: gitlabProfile.email,
          gitlab_data: {
            groups: await fetchGitLabGroups(user.user_metadata.provider_token),
            projects: await fetchGitLabProjects(user.user_metadata.provider_token)
          },
          updated_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Profile sync error:', error)
    // エラーハンドリング（ユーザーには通知、システムには記録）
  }
}
```

### 3.2 プロバイダートークン管理

```typescript
// プロバイダートークンの安全な管理
class ProviderTokenManager {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async storeProviderToken(userId: string, provider: string, tokenData: any) {
    // トークンは暗号化して保存
    const encryptedToken = await this.encryptToken(tokenData)
    
    await this.supabase
      .from('provider_tokens')
      .upsert({
        user_id: userId,
        provider,
        encrypted_token: encryptedToken,
        expires_at: tokenData.expires_at,
        updated_at: new Date().toISOString()
      })
  }
  
  async getProviderToken(userId: string, provider: string) {
    const { data, error } = await this.supabase
      .from('provider_tokens')
      .select('encrypted_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single()
    
    if (error || !data) {
      throw new Error('Provider token not found')
    }
    
    // トークンの有効期限チェック
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await this.refreshProviderToken(userId, provider)
      return this.getProviderToken(userId, provider) // 再帰的に取得
    }
    
    return this.decryptToken(data.encrypted_token)
  }
  
  private async encryptToken(token: any): Promise<string> {
    // AES-256-GCM による暗号化
    const key = process.env.TOKEN_ENCRYPTION_KEY!
    // 暗号化ロジックの実装
    return 'encrypted_token_string'
  }
  
  private async decryptToken(encryptedToken: string): Promise<any> {
    // 復号化ロジックの実装
    const key = process.env.TOKEN_ENCRYPTION_KEY!
    // 復号化ロジックの実装
    return {}
  }
}
```

## 4. アクセス制御 (RLS)

### 4.1 Row Level Security 設計

```sql
-- users テーブル (Supabase Auth標準)
-- 追加のRLS設定は不要（Supabase Authが管理）

-- user_profiles テーブルのRLS
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reviews テーブルのRLS
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Organization members can view org reviews" ON reviews
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- line_comments テーブルのRLS
CREATE POLICY "Users can view comments on accessible reviews" ON line_comments
  FOR SELECT USING (
    review_id IN (
      SELECT id FROM reviews 
      WHERE auth.uid() = user_id 
        OR is_public = true 
        OR organization_id IN (
          SELECT organization_id FROM user_organizations 
          WHERE user_id = auth.uid()
        )
    )
  );

-- rule_sets テーブルのRLS
CREATE POLICY "Users can view own rule sets" ON rule_sets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view shared rule sets" ON rule_sets
  FOR SELECT USING (is_shared = true);

CREATE POLICY "Organization members can view org rule sets" ON rule_sets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );
```

### 4.2 権限管理システム

```typescript
// 権限管理クラス
class PermissionManager {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async canAccessReview(userId: string, reviewId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        user_id,
        is_public,
        organization_id,
        user_organizations!inner(user_id)
      `)
      .eq('id', reviewId)
      .or(`user_id.eq.${userId},is_public.eq.true,user_organizations.user_id.eq.${userId}`)
      .single()
    
    return !error && data !== null
  }
  
  async canModifyReview(userId: string, reviewId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single()
    
    return !error && data !== null
  }
  
  async canAccessRuleSet(userId: string, ruleSetId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('rule_sets')
      .select(`
        created_by,
        is_shared,
        organization_id,
        user_organizations!inner(user_id)
      `)
      .eq('id', ruleSetId)
      .or(`created_by.eq.${userId},is_shared.eq.true,user_organizations.user_id.eq.${userId}`)
      .single()
    
    return !error && data !== null
  }
}
```

## 5. 組織・チーム管理

### 5.1 組織データ構造

```typescript
// 組織関連の型定義
interface Organization {
  id: string
  name: string
  slug: string
  avatar_url?: string
  description?: string
  github_org_id?: number
  gitlab_group_id?: number
  created_at: string
  updated_at: string
}

interface UserOrganization {
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string
  expires_at: string
  accepted_at?: string
  created_at: string
}
```

### 5.2 組織権限管理

```typescript
// 組織権限チェック
class OrganizationPermissionManager {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async getUserRole(userId: string, organizationId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()
    
    return error ? null : data.role
  }
  
  async canManageOrganization(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId)
    return role === 'owner' || role === 'admin'
  }
  
  async canInviteMembers(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId)
    return role === 'owner' || role === 'admin'
  }
  
  async canAccessOrganizationData(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId)
    return role !== null
  }
}
```

## 6. セキュリティ対策

### 6.1 データ保護

```typescript
// データ暗号化
class DataEncryption {
  private algorithm = 'aes-256-gcm'
  private key: Buffer
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  }
  
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.key)
    cipher.setAAD(Buffer.from('authentication_data'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }
  
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key)
    decipher.setAAD(Buffer.from('authentication_data'))
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

### 6.2 レート制限

```typescript
// API レート制限
class RateLimiter {
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async checkRateLimit(
    userId: string, 
    action: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${userId}:${action}`
    const now = Date.now()
    const window = Math.floor(now / windowMs)
    const windowKey = `${key}:${window}`
    
    const current = await this.redis.incr(windowKey)
    
    if (current === 1) {
      await this.redis.expire(windowKey, Math.ceil(windowMs / 1000))
    }
    
    const remaining = Math.max(0, maxRequests - current)
    const resetTime = (window + 1) * windowMs
    
    return {
      allowed: current <= maxRequests,
      remaining,
      resetTime
    }
  }
}

// ミドルウェアでの使用例
export async function rateLimitMiddleware(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const rateLimiter = new RateLimiter(redis)
  const userId = context.params.userId
  
  const result = await rateLimiter.checkRateLimit(
    userId,
    'code_analysis',
    10, // 10リクエスト
    60 * 1000 // 1分間
  )
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
  }
  
  return NextResponse.next()
}
```

### 6.3 監査ログ

```typescript
// 監査ログシステム
interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address: string
  user_agent: string
  timestamp: string
}

class AuditLogger {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>,
    request: Request
  ) {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await this.supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      })
  }
}
```

## 7. プライバシー・コンプライアンス

### 7.1 データ保持ポリシー

```typescript
// データ保持ポリシー管理
class DataRetentionManager {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async cleanupExpiredData() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // 期限切れのセッションデータを削除
    await this.supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', thirtyDaysAgo.toISOString())
    
    // 古い監査ログを削除（1年保持）
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    await this.supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', oneYearAgo.toISOString())
  }
  
  async deleteUserData(userId: string) {
    // GDPR対応のユーザーデータ削除
    const tables = [
      'user_profiles',
      'reviews',
      'line_comments',
      'rule_sets',
      'user_organizations',
      'audit_logs'
    ]
    
    for (const table of tables) {
      await this.supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
    }
  }
}
```

### 7.2 GDPR対応

```typescript
// GDPR対応のデータエクスポート
class GDPRDataExporter {
  private supabase: SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  
  async exportUserData(userId: string): Promise<any> {
    const userData = {
      profile: null,
      reviews: [],
      comments: [],
      ruleSets: [],
      auditLogs: []
    }
    
    // ユーザープロファイル
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    userData.profile = profile
    
    // レビューデータ
    const { data: reviews } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
    userData.reviews = reviews || []
    
    // コメントデータ
    const { data: comments } = await this.supabase
      .from('line_comments')
      .select('*')
      .eq('user_id', userId)
    userData.comments = comments || []
    
    // ルールセット
    const { data: ruleSets } = await this.supabase
      .from('rule_sets')
      .select('*')
      .eq('created_by', userId)
    userData.ruleSets = ruleSets || []
    
    // 監査ログ
    const { data: auditLogs } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
    userData.auditLogs = auditLogs || []
    
    return userData
  }
}
```

この認証・セキュリティ設計により、エンタープライズレベルの安全性と、GDPR等のプライバシー法規制への準拠を実現します。