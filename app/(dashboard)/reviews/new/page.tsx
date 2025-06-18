'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, GitlabIcon as Gitlab, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'

export default function NewReviewPage() {
  const [url, setUrl] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    provider?: 'github' | 'gitlab'
    repo?: string
    number?: string
    error?: string
  } | null>(null)

  const validateUrl = (inputUrl: string) => {
    setIsValidating(true)
    
    // GitHub PR URL の正規表現
    const githubPrRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)$/
    // GitLab MR URL の正規表現
    const gitlabMrRegex = /^https:\/\/gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/merge_requests\/(\d+)$/
    
    const githubMatch = inputUrl.match(githubPrRegex)
    const gitlabMatch = inputUrl.match(gitlabMrRegex)

    setTimeout(() => {
      if (githubMatch) {
        setValidationResult({
          isValid: true,
          provider: 'github',
          repo: `${githubMatch[1]}/${githubMatch[2]}`,
          number: githubMatch[3]
        })
      } else if (gitlabMatch) {
        setValidationResult({
          isValid: true,
          provider: 'gitlab',
          repo: `${gitlabMatch[1]}/${gitlabMatch[2]}`,
          number: gitlabMatch[3]
        })
      } else if (inputUrl) {
        setValidationResult({
          isValid: false,
          error: '有効なGitHub PR URLまたはGitLab MR URLを入力してください'
        })
      } else {
        setValidationResult(null)
      }
      setIsValidating(false)
    }, 500)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    
    if (newUrl.trim()) {
      validateUrl(newUrl.trim())
    } else {
      setValidationResult(null)
      setIsValidating(false)
    }
  }

  const handleStartReview = () => {
    if (validationResult?.isValid) {
      // TODO: レビュー開始処理を実装
      alert('レビュー機能はまだ実装中です。近日公開予定！')
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">新しいレビュー</h1>
        <p className="text-muted-foreground">
          GitHub PRまたはGitLab MRのURLを入力してAIレビューを開始
        </p>
      </div>

      {/* メインフォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            PR/MR URL入力
          </CardTitle>
          <CardDescription>
            レビューしたいPull RequestまたはMerge RequestのURLを貼り付けてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={url}
              onChange={handleUrlChange}
              className="text-sm"
            />
          </div>

          {/* バリデーション結果 */}
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              URLを検証中...
            </div>
          )}

          {validationResult && !isValidating && (
            <div className={`flex items-start gap-2 p-3 rounded-md ${
              validationResult.isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-1">
                {validationResult.isValid ? (
                  <>
                    <div className="font-medium flex items-center gap-2">
                      {validationResult.provider === 'github' ? (
                        <Github className="h-4 w-4" />
                      ) : (
                        <Gitlab className="h-4 w-4" />
                      )}
                      有効な{validationResult.provider === 'github' ? 'GitHub PR' : 'GitLab MR'}です
                    </div>
                    <div className="text-sm">
                      リポジトリ: {validationResult.repo}<br />
                      番号: #{validationResult.number}
                    </div>
                  </>
                ) : (
                  <div className="text-sm">{validationResult.error}</div>
                )}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleStartReview}
              disabled={!validationResult?.isValid}
              size="lg"
            >
              レビューを開始
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 使用例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">対応URL形式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="font-medium">GitHub Pull Request</span>
            </div>
            <code className="block p-2 bg-muted rounded text-sm">
              https://github.com/owner/repository/pull/123
            </code>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gitlab className="h-4 w-4" />
              <span className="font-medium">GitLab Merge Request</span>
            </div>
            <code className="block p-2 bg-muted rounded text-sm">
              https://gitlab.com/owner/repository/-/merge_requests/123
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
    </AuthGuard>
  )
}