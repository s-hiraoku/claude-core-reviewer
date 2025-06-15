'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ReviewsPage() {

  return (
    <AuthGuard>
      <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">レビュー履歴</h1>
          <p className="text-muted-foreground">
            過去のコードレビューを確認・管理できます
          </p>
        </div>
        <Button asChild>
          <Link href="/reviews/new">
            <Plus className="mr-2 h-4 w-4" />
            新しいレビュー
          </Link>
        </Button>
      </div>

      {/* フィルター・検索バー */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">検索</label>
              <input
                type="text"
                placeholder="リポジトリ名、PR番号で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium mb-2">ステータス</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option value="">すべて</option>
                <option value="completed">完了</option>
                <option value="pending">処理中</option>
                <option value="failed">失敗</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レビューリスト */}
      <Card>
        <CardHeader>
          <CardTitle>レビュー履歴</CardTitle>
          <CardDescription>
            これまでに実行したコードレビューの一覧です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">レビュー履歴がありません</h3>
            <p className="mt-2 text-muted-foreground">
              まだコードレビューを実行していません。<br />
              GitHub または GitLab の PR/MR URL を入力して最初のレビューを開始しましょう。
            </p>
            <div className="mt-6 space-y-3">
              <Button asChild size="lg">
                <Link href="/reviews/new">
                  <Plus className="mr-2 h-5 w-5" />
                  新しいレビューを開始
                </Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>サポート対象:</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    GitHub PR
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    GitLab MR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AuthGuard>
  )
}