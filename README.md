# Claude Code Review Assistant

> AI駆動のコードレビュー補助ツール - GitHub/GitLab PR/MRに対する包括的なコード分析

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com/)
[![Claude](https://img.shields.io/badge/Claude-AI-orange)](https://anthropic.com/)

## 🚀 概要

Claude Code Review Assistant は、Claude Code SDK を活用した次世代のコードレビューツールです。GitHub/GitLab の PR/MR に対して AI による包括的な分析を行い、組織固有のルールを適用した高品質なコードレビューを実現します。

### ✨ 主な特徴

- 🤖 **AI-First レビュー**: Claude Code SDK による高度なコード分析
- 📋 **組織ルール適用**: CLAUDE.md ファイルによるカスタマイズ可能なレビュー基準
- 🔍 **包括的分析**: セキュリティ、パフォーマンス、保守性の多角的評価
- 🎯 **インタラクティブ**: 行単位での詳細分析と改善提案
- 🔐 **エンタープライズ対応**: OAuth 2.0 + RLS による堅牢なセキュリティ
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応

## 🎯 対象ユーザー

- **開発チームリーダー**: コードレビューの品質向上と効率化
- **シニアエンジニア**: レビュー負荷軽減と一貫性のある指摘
- **ジュニア開発者**: AI による学習支援と即座のフィードバック
- **DevOps チーム**: CI/CD パイプラインへの統合

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (厳密モード)
- **State Management**: Jotai
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion

### バックエンド
- **BaaS**: Supabase (Auth + PostgreSQL + Realtime)
- **AI**: Claude Code SDK
- **APIs**: GitHub API, GitLab API
- **Runtime**: Edge Runtime

### 開発・運用
- **Development**: VS Code + Claude Code
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel + Supabase Pro
- **Monitoring**: Vercel Analytics + Sentry

## 📋 前提条件

- Node.js 18+ 
- npm または yarn
- GitHub/GitLab アカウント
- Supabase プロジェクト
- Anthropic API キー

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/claude-code-reviewer.git
cd claude-code-reviewer
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# GitHub OAuth (オプション)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# GitLab OAuth (オプション)
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret

# アプリケーション
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. データベースのセットアップ

Supabase ダッシュボードで以下のSQLを実行:

```sql
-- ユーザープロファイル
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  github_data JSONB,
  gitlab_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);
```

完全なスキーマは [`docs/04_DATABASE_DESIGN.md`](docs/04_DATABASE_DESIGN.md) を参照してください。

### 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

## 📖 使用方法

### 基本的な使い方

1. **ログイン**: GitHub または GitLab アカウントでログイン
2. **PR/MR URL入力**: レビューしたい PR/MR の URL を入力
3. **AI分析実行**: Claude による自動コード分析が開始
4. **結果確認**: 詳細な分析結果と改善提案を確認
5. **レビュー保存**: 結果をダッシュボードで管理

### 組織ルールの設定

プロジェクトルートに `CLAUDE.md` ファイルを作成:

```markdown
# プロジェクトコーディング規約

## TypeScript ルール
- 厳密な型定義を使用すること
- any型の使用を避けること
- 適切なエラーハンドリングを実装すること

## セキュリティルール
- 入力値の検証を必須とする
- 機密情報のログ出力を禁止
- HTTPS通信を強制

## パフォーマンスルール
- 無駄な再レンダリングを避ける
- 適切なメモ化を使用
- バンドルサイズを最適化

@rules/security-guidelines.md
@rules/performance-standards.md
```

詳細は [`docs/07_MVP_PLAN.md`](docs/07_MVP_PLAN.md) を参照してください。

## 🔧 開発

### プロジェクト構造

```
claude-code-reviewer/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # ダッシュボード
│   ├── api/               # API Routes
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── auth/             # 認証コンポーネント
│   ├── reviews/          # レビュー機能
│   └── diff-viewer/      # 差分表示
├── lib/                   # ユーティリティ・設定
│   ├── supabase/         # Supabase設定
│   ├── claude/           # Claude SDK設定
│   └── utils/            # 共通ユーティリティ
├── docs/                  # プロジェクトドキュメント
└── types/                # TypeScript型定義
```

### スクリプト

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リンター
npm run lint

# フォーマッター
npm run format

# 型チェック
npm run type-check

# テスト
npm run test

# E2Eテスト
npm run test:e2e
```

### テスト

```bash
# 単体テスト
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

## 📚 ドキュメント

詳細な設計書とドキュメントは `docs/` ディレクトリに含まれています:

- [`01_OVERVIEW.md`](docs/01_OVERVIEW.md) - プロジェクト概要
- [`02_TECH_STACK.md`](docs/02_TECH_STACK.md) - 技術スタック詳細
- [`03_AUTH_DESIGN.md`](docs/03_AUTH_DESIGN.md) - 認証・セキュリティ設計
- [`04_DATABASE_DESIGN.md`](docs/04_DATABASE_DESIGN.md) - データベース設計
- [`05_API_DESIGN.md`](docs/05_API_DESIGN.md) - API設計
- [`06_UI_DESIGN.md`](docs/06_UI_DESIGN.md) - UI/UX設計
- [`07_MVP_PLAN.md`](docs/07_MVP_PLAN.md) - MVP開発計画
- [`99_FULL_DESIGN.md`](docs/99_FULL_DESIGN.md) - 完全版設計書

## 🚀 デプロイ

### Vercel デプロイ

1. Vercel アカウントでリポジトリを接続
2. 環境変数を設定
3. 自動デプロイが開始

```bash
# Vercel CLI使用
npm install -g vercel
vercel --prod
```

### 環境変数設定

本番環境では以下の環境変数が必要です:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `GITHUB_CLIENT_ID` (GitHub統合用)
- `GITHUB_CLIENT_SECRET` (GitHub統合用)
- `GITLAB_CLIENT_ID` (GitLab統合用)
- `GITLAB_CLIENT_SECRET` (GitLab統合用)

詳細は [`docs/07_MVP_PLAN.md`](docs/07_MVP_PLAN.md) のデプロイセクションを参照してください。

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください:

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン

- TypeScript 厳密モードを維持
- ESLint + Prettier ルールに従う
- コンポーネントは小さく、再利用可能に
- 適切なテストを書く
- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/) に従う

## 📈 ロードマップ

### v1.0 (MVP) ✅
- [x] GitHub PR レビュー
- [x] Claude AI 分析
- [x] 基本UI/UX
- [x] 認証システム

### v1.1 (2024 Q2)
- [ ] GitLab MR 対応
- [ ] ルール管理システム
- [ ] 組織機能
- [ ] コメント投稿機能

### v1.2 (2024 Q3)
- [ ] リアルタイム協調
- [ ] Webhook 統合
- [ ] 高度な分析レポート
- [ ] モバイルアプリ

### v2.0 (2024 Q4)
- [ ] SSO 連携
- [ ] API 提供
- [ ] オンプレミス対応
- [ ] VS Code 拡張

## 📊 パフォーマンス

### 目標指標

- **ページロード時間**: < 3秒
- **AI分析時間**: < 30秒
- **可用性**: 99.9%
- **エラー率**: < 1%

### 最適化

- Next.js SSR/ISR 活用
- Edge Runtime による高速処理
- コード分割とレイジーローディング
- Supabase リアルタイム機能

## 🛡️ セキュリティ

- OAuth 2.0 認証
- Row Level Security (RLS)
- HTTPS 強制
- データ暗号化
- 定期的なセキュリティ監査

セキュリティ問題を発見した場合は、公開イシューではなく security@example.com に報告してください。

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 👥 チーム

- **プロジェクトリード**: [@your-username](https://github.com/your-username)
- **開発チーム**: Claude Code Assistant

## 🙏 謝辞

- [Anthropic](https://anthropic.com/) - Claude AI の提供
- [Supabase](https://supabase.com/) - BaaS プラットフォーム
- [Vercel](https://vercel.com/) - デプロイメントプラットフォーム
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント

## 📞 サポート

- 📧 Email: support@example.com
- 💬 Discord: [コミュニティサーバー](https://discord.gg/example)
- 📖 Documentation: [docs.example.com](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/claude-code-reviewer/issues)

---

<div align="center">
  <p>🚀 <strong>Claude Code Review Assistant</strong> で、より良いコードレビューを始めましょう！</p>
  <p>Made with ❤️ by the Claude Code Team</p>
</div>