# Supabaseプロジェクトセットアップガイド

## 1. Supabaseプロジェクト作成

1. [Supabase Dashboard](https://app.supabase.io)にアクセス
2. "New project"をクリック
3. プロジェクト情報を入力：
   - **Project name**: `claude-code-reviewer`
   - **Database Password**: 強力なパスワードを設定（保存必須）
   - **Region**: Asia-Pacific (東京): `ap-northeast-1`
4. "Create new project"をクリック
5. プロジェクト作成完了まで約2分待機

## 2. 環境変数取得

プロジェクト作成後、Settings > API画面で以下の値を取得：

- **Project URL**: `https://xxxxxxxxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIs...`
- **service_role secret**: `eyJhbGciOiJIUzI1NiIs...` (管理用)

## 3. .env.localファイル作成

プロジェクトルートに`.env.local`ファイルを作成：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 本番環境でのみ必要
# SUPABASE_JWT_SECRET=your_jwt_secret
```

## 4. データベーステーブル作成

### 4.1 SQL Editorでテーブル作成

Supabase Dashboard > SQL Editor > "New query"で以下のSQLを実行：

```sql
-- sql/01_create_tables.sqlの内容を実行
```

### 4.2 RLS（Row Level Security）設定

```sql
-- sql/02_setup_rls.sqlの内容を実行
```

## 5. GitHub OAuth設定

### 5.1 GitHub OAuth Appの作成

1. GitHub Settings > Developer settings > OAuth Apps
2. "New OAuth App"をクリック
3. 以下の情報を入力：
   - **Application name**: `Claude Code Reviewer`
   - **Homepage URL**: `http://localhost:3000` (開発時)
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
4. "Register application"をクリック
5. **Client ID**と**Client Secret**を控える

### 5.2 Supabase OAuth設定

1. Supabase Dashboard > Authentication > Providers
2. GitHubプロバイダーを有効化
3. GitHub OAuth設定を入力：
   - **Client ID**: GitHubで取得したClient ID
   - **Client Secret**: GitHubで取得したClient Secret
4. "Save"をクリック

## 6. セットアップ確認

### 6.1 アプリケーション起動

```bash
npm install
npm run dev
```

### 6.2 認証テスト

1. `http://localhost:3000`にアクセス
2. "GitHubで始める"ボタンをクリック
3. GitHub OAuth画面でアプリケーションを承認
4. 正常にダッシュボードに遷移することを確認

## 7. トラブルシューティング

### 認証エラーの場合

1. `.env.local`の環境変数を確認
2. GitHub OAuth設定のCallback URLを確認
3. Supabaseプロジェクトの状態を確認

### データベース接続エラーの場合

1. Supabaseプロジェクトが正常に起動しているか確認
2. テーブルが正しく作成されているか確認
3. RLS設定が正しく適用されているか確認

## 次のステップ

セットアップ完了後、Phase 2のGitHub統合に進むことができます。