export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Claude Code Review
            <span className="text-primary"> Assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Claude Code SDK を活用した AI-first のコードレビュー補助ツール。
            GitHub/GitLab の PR/MR に対する包括的なコード分析を実現します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              GitHub で始める
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              GitLab で始める
            </button>
          </div>
        </div>
        
        {/* Features section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-background/50 backdrop-blur">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-First レビュー</h3>
            <p className="text-muted-foreground text-sm">
              Claude Code SDK による高度なコード分析と改善提案
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-background/50 backdrop-blur">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary text-xl">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">組織ルール適用</h3>
            <p className="text-muted-foreground text-sm">
              CLAUDE.md による組織固有のルールの自動適用
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-background/50 backdrop-blur">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary text-xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">チーム連携</h3>
            <p className="text-muted-foreground text-sm">
              GitHub/GitLab との統合によるシームレスなワークフロー
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}