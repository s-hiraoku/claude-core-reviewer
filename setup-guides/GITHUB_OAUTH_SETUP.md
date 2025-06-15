# GitHub OAuth Setup Guide

## GitHub 404 エラーの解決方法

### 問題
GitHubボタンをクリックすると404エラーが表示される

### 原因
GitHub OAuth Appの「Authorization callback URL」が正しく設定されていない

### 解決手順

#### 1. GitHub OAuth App設定にアクセス
1. [GitHub.com](https://github.com) にログイン
2. **Settings** → **Developer settings** → **OAuth Apps**
3. 該当のOAuth Appを選択（Client ID: `Ov23lixgl4HBoaujeyIq`）

#### 2. 必要な設定値

| 項目 | 設定値 |
|------|--------|
| **Application name** | `Claude Code Review Assistant` |
| **Homepage URL** | `http://localhost:3000` |
| **Authorization callback URL** | `https://aorriczktrvjucuusrzs.supabase.co/auth/v1/callback` |
| **Application description** | `AI-powered code review assistant using Claude Code SDK` |

#### 3. 重要な注意点

- **Authorization callback URL**は必ずSupabaseのURLを使用してください
- `https://aorriczktrvjucuusrzs.supabase.co/auth/v1/callback`
- ローカルホストのURLは使用しません

#### 4. 設定後の確認

設定完了後、以下のURLでテストできます：
```
http://localhost:3000
```

GitHubボタンをクリックして、正常にGitHubの認証画面にリダイレクトされることを確認してください。

### トラブルシューティング

#### まだ404エラーが出る場合
1. GitHub OAuth App設定を再確認
2. Supabase ダッシュボードで GitHub Provider が有効になっているか確認
3. ブラウザのキャッシュをクリア
4. 数分待ってから再試行（設定の反映に時間がかかる場合があります）

#### Supabase設定確認
Supabase Dashboard → Authentication → Providers → GitHub:
- **Enable GitHub provider**: オン
- **Client ID**: `Ov23lixgl4HBoaujeyIq`
- **Client Secret**: `fe8d8f8fae1deaff91ad523d791c49b13a1f23b6`

### 成功の確認方法

正常に設定されている場合：
1. GitHubボタンクリック
2. GitHubの認証画面に遷移
3. 「Authorize」ボタンが表示される
4. 認証後、アプリのダッシュボードにリダイレクト