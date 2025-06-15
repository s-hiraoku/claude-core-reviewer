# プロジェクト概要

このプロジェクトは、GitHub/GitLab の PR/MR に対して Claude Code SDK を活用した AI-first のコードレビュー補助ツールです。

## 設計ドキュメント

詳細な設計については以下を参照してください：
@docs/DESIGN.md

## 技術スタック

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- State: Jotai
- Styling: Tailwind CSS + shadcn/ui
- AI: Claude Code SDK

## 開発方針

- MVP 開発により段階的に構築
- VS Code + Claude Code 環境での協調開発
- 品質重視、テスト駆動開発

## 開発時の注意点

1. TypeScript 厳密モードを維持
2. コンポーネントは小さく、再利用可能に
3. エラーハンドリングを適切に実装
4. パフォーマンスを意識した実装
5. セキュリティを最優先に考慮

## 次のタスク

MVP の実装から開始し、以下の順序で開発：

1. プロジェクト初期化
2. Supabase 認証設定
3. GitHub API 統合
4. 基本 UI 実装
5. Claude SDK 統合
