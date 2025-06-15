# Claude Code SDK 活用コードレビューツール 設計書（正式版）

## 1. プロジェクト概要

### 1.1 目的

GitHub/GitLab の PR/MR に対して、Claude Code SDK を活用した AI-first のコードレビュー補助ツールを開発する。組織固有の開発ルール適用により、実用的で高品質なコードレビューを実現する。

### 1.2 開発方針

- **フレームワーク**: Next.js 15 + Supabase Auth
- **開発環境**: VS Code + Claude Code
- **開発手法**: MVP（Minimum Viable Product）による段階的開発
- **技術トレンド**: 2025 年のモダン Web 開発ベストプラクティス準拠

## 2. 主要機能

### 2.1 コア機能

1. **URL 入力機能**: GitHub/GitLab の PR/MR URL を入力して差分データを取得
2. **差分表示 UI**: GitHub/GitLab 風の高性能差分表示（SSR 対応）
3. **AI-first レビュー**: Claude Code SDK による包括的なコード分析
4. **インタラクティブレビュー**: 差分行クリックによる局所的なコード説明・改善提案
5. **統合保存**: レビュー結果を GitHub/GitLab に直接保存
6. **履歴管理**: レビュー結果の参照・分析機能

### 2.2 ルール機能（Claude Code SDK 統合）

7. **CLAUDE.md ベース**: Claude Code SDK の標準ルールファイル機能活用
8. **ファイルインポート**: `@rules/specific-rule.md`による詳細ルール分割
9. **自動認識**: プロジェクトの`CLAUDE.md`自動読み込み
10. **ルール適用**: AI レビュー時の組織固有ルール自動適用

## 3. 技術アーキテクチャ

### 3.1 技術スタック

#### フレームワーク・コア

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript（厳密モード）
- **状態管理**: Jotai（原子的状態管理）
- **スタイリング**: Tailwind CSS + shadcn/ui
- **認証**: Supabase Auth
- **データベース**: Supabase PostgreSQL

#### AI・開発ツール

- **メイン AI**: Claude Code SDK（ルール機能活用）
- **開発環境**: VS Code + Claude Code
- **ビルド**: Turbopack（Next.js 15 統合）
- **ランタイム**: Edge Runtime（高速レスポンス）

#### データ・API

- **認証・DB**: Supabase（Auth + PostgreSQL）
- **リアルタイム**: Supabase Realtime
- **ストレージ**: Supabase Storage（ルールファイル保存）
- **API**: Next.js API Routes (App Router)
- **外部 API**: GitHub API, GitLab API

### 3.2 システム構成図

```
Frontend (Next.js 15)
├── UI Components (Tailwind + shadcn/ui)
├── State Management (Jotai)
├── Authentication (Supabase Auth)
└── API Layer (Next.js API Routes)

Backend Services
├── Supabase (Auth + Database + Realtime)
├── Claude Code SDK (AI Analysis)
├── GitHub API (PR Data & Comments)
└── GitLab API (MR Data & Comments)

Data Flow
User Input → Auth → PR/MR Data → Claude Analysis → Results → Save/Display
```

## 4. 認証・セキュリティ設計

### 4.1 Supabase Auth 設計

#### OAuth 認証フロー

- **GitHub OAuth**

  - スコープ: `repo read:user read:org`
  - 用途: PR/MR アクセス、組織情報取得
  - トークン管理: Supabase 経由で自動リフレッシュ

- **GitLab OAuth**
  - スコープ: `read_user read_repository read_api`
  - 用途: MR アクセス、プロジェクト情報取得
  - トークン管理: Supabase 経由で自動リフレッシュ

#### Row Level Security（RLS）

- **個人レビュー**: 作成者のみアクセス可能
- **組織レビュー**: 組織メンバーのみアクセス可能
- **パブリックレビュー**: 公開リポジトリは読み取り専用公開

### 4.2 セキュリティ対策

- **認証**: OAuth 2.0 + JWT（Supabase 管理）
- **通信**: 全通信 HTTPS 化
- **データ保護**: RLS による自動アクセス制御
- **トークン管理**: プロバイダートークンの安全な保存・管理

## 5. データベース設計

### 5.1 テーブル構造

#### 認証関連

- **users**（Supabase 標準）: 基本ユーザー情報
- **user_profiles**（カスタム）: GitHub/GitLab プロファイル、組織情報、設定

#### レビューデータ

- **reviews**: レビューメタデータ、PR/MR 情報、Claude 分析結果
- **line_comments**: 行単位コメント、AI 信頼度、コメントタイプ

#### ルール管理

- **rule_sets**: CLAUDE.md ファイル、インポートルール、組織共有設定

### 5.2 データ関連図

```
users (Supabase Auth)
├── user_profiles (1:1)
├── reviews (1:N)
│   └── line_comments (1:N)
└── rule_sets (1:N)
```

## 6. アプリケーション設計

### 6.1 ディレクトリ構造

```
app/
├── (auth)/                      # 認証関連ページ
├── (dashboard)/                 # メインアプリケーション
├── api/                         # API Routes
├── layout.tsx                   # ルートレイアウト
└── page.tsx                     # ランディングページ

components/
├── auth/                        # 認証コンポーネント
├── ui/                          # UIコンポーネント
├── diff-viewer/                 # 差分表示
└── rules/                       # ルール管理

lib/
├── supabase/                    # Supabase設定
├── claude-sdk.ts               # Claude Code SDK
├── github-api.ts               # GitHub API
└── gitlab-api.ts               # GitLab API
```

### 6.2 状態管理（Jotai）

#### Atom 設計

- **認証系**: ユーザー情報、セッション、プロバイダートークン
- **PR データ系**: PR/MR 情報、ファイルリスト、選択状態
- **レビュー系**: 分析結果、コメント、履歴
- **ルール系**: ルールセット、適用設定

## 7. Claude Code SDK 統合

### 7.1 ルール管理システム

#### CLAUDE.md ファイル構造

```
project-root/
├── CLAUDE.md                    # メインルールファイル
└── rules/
    ├── coding-standards.md      # コーディング規約
    ├── security-guidelines.md   # セキュリティガイドライン
    ├── performance-rules.md     # パフォーマンス規約
    └── project-specific.md      # プロジェクト固有ルール
```

#### ルール適用プロセス

1. CLAUDE.md ファイル読み込み
2. `@rules/filename.md`形式のインポートファイル解析
3. 対象ファイルへの適用可能ルールフィルタリング
4. Claude Code SDK へのルール適用コード分析
5. ルール準拠性 + 一般品質分析結果の統合

### 7.2 AI 分析フロー

```
Code Input → Rule Loading → Context Building → Claude Analysis → Result Processing → Output
```

## 8. API 設計

### 8.1 外部 API 統合

#### GitHub API

- **認証**: Supabase OAuth トークン
- **機能**: PR 情報取得、ファイル差分、コメント投稿
- **レート制限**: 自動リトライ、キューイング

#### GitLab API

- **認証**: Supabase OAuth トークン
- **機能**: MR 情報取得、ファイル差分、ノート投稿
- **レート制限**: 自動リトライ、キューイング

### 8.2 内部 API（Next.js API Routes）

- `/api/github/*`: GitHub 関連処理
- `/api/gitlab/*`: GitLab 関連処理
- `/api/claude/*`: Claude 分析処理
- `/api/reviews/*`: レビュー管理

## 9. UI/UX 設計

### 9.1 画面構成

1. **ランディングページ**: サービス紹介、認証
2. **ダッシュボード**: レビュー履歴、統計
3. **レビュー画面**: 差分表示、AI 分析、結果表示
4. **ルール管理**: CLAUDE.md エディタ、設定
5. **設定画面**: ユーザー設定、組織管理

### 9.2 差分表示 UI

- **ライブラリ**: react-diff-viewer（カスタマイズ）
- **機能**: 行クリック、複数行選択、AI 分析トリガー
- **レスポンシブ**: モバイル/タブレット対応
- **テーマ**: ライト/ダーク切り替え

### 9.3 AI レビューパネル

- **リアルタイム分析**: 選択行の即座な分析
- **構造化表示**: 問題分類、重要度表示
- **アクション**: GitHub/GitLab への投稿機能

## 10. パフォーマンス・スケーラビリティ

### 10.1 パフォーマンス最適化

- **SSR/ISR**: 初期表示高速化
- **コード分割**: React.lazy + Suspense
- **仮想化**: 大きなファイルの効率的表示
- **キャッシュ**: Next.js Cache + Supabase Cache

### 10.2 スケーラビリティ対策

- **データベース**: Supabase 自動スケーリング
- **API**: Edge Runtime による分散処理
- **ストレージ**: Supabase Storage の容量管理
- **監視**: パフォーマンスメトリクス収集

## 11. 開発・運用計画

### 11.1 MVP 開発フェーズ

#### Phase 1: 基盤構築（1-2 日）

- Next.js プロジェクト初期化
- Supabase セットアップ
- 基本認証実装

#### Phase 2: GitHub 統合（2-3 日）

- GitHub API 統合
- PR 情報取得
- 基本 UI 実装

#### Phase 3: 差分表示（1-2 日）

- react-diff-viewer 統合
- ファイル表示・切り替え

#### Phase 4: Claude 統合（2-3 日）

- Claude Code SDK 統合
- 基本的なコード分析
- 結果表示 UI

#### Phase 5: 統合・テスト（1-2 日）

- エンドツーエンド統合
- エラーハンドリング
- 基本テスト

### 11.2 本格開発フェーズ

#### v1.1: 機能拡張

- GitLab 対応
- ルール管理システム
- GitHub/GitLab への結果投稿

#### v1.2: 高度機能

- リアルタイム機能
- 組織機能
- 詳細権限管理

#### v2.0: エンタープライズ

- SSO 連携
- API 提供
- 高度な分析機能

### 11.3 運用環境

- **Production**: Vercel + Supabase Pro
- **Staging**: Vercel Preview + Supabase Staging
- **Development**: Local + Supabase Local

## 12. 品質保証・監視

### 12.1 品質保証

- **型安全性**: TypeScript 厳密モード
- **コード品質**: ESLint + Prettier
- **テスト**: Vitest + Playwright
- **CI/CD**: GitHub Actions 自動化

### 12.2 監視・メトリクス

- **アプリケーション**: Vercel Analytics
- **データベース**: Supabase Analytics
- **エラー監視**: Sentry 統合
- **パフォーマンス**: Core Web Vitals

## 13. リスク管理・将来対応

### 13.1 技術リスク

- **Claude Code SDK**: API 制限・サービス変更への対応
- **外部 API**: GitHub/GitLab API 変更への対応
- **スケーリング**: 大量ユーザー・データへの対応

### 13.2 将来拡張性

- **マルチプラットフォーム**: 他の Git プラットフォーム対応
- **AI 多様化**: 複数 AI モデルサポート
- **エンタープライズ**: 大企業向け機能拡張
- **API 化**: サードパーティ統合対応

## 14. 成功指標・KPI

### 14.1 技術指標

- システム可用性: 99.9%以上
- レスポンス時間: 平均 3 秒以内
- エラー率: 1%以下

### 14.2 ユーザー指標

- レビュー完了時間: 平均 5 分以内
- ユーザー満足度: 4.0/5.0 以上
- 継続利用率: 70%以上

この設計書に基づいて、VS Code + Claude Code 環境で MVP から段階的に開発を進め、最終的に本格的なエンタープライズ対応のコードレビューツールを構築します。
