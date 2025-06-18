-- Claude Code Review Assistant - Database Tables
-- このファイルはSupabase SQL Editorで実行してください

-- 1. ユーザープロファイルテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  provider TEXT NOT NULL, -- 'github' or 'gitlab'
  provider_id TEXT NOT NULL,
  github_data JSONB,
  gitlab_data JSONB,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. レビューテーブル
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- PR/MR情報
  repository_url TEXT NOT NULL,
  pr_number INTEGER NOT NULL,
  pr_title TEXT NOT NULL,
  pr_url TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'github' or 'gitlab'
  
  -- レビュー情報
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  analysis_result JSONB,
  claude_analysis JSONB,
  
  -- メタデータ
  total_files INTEGER DEFAULT 0,
  total_additions INTEGER DEFAULT 0,
  total_deletions INTEGER DEFAULT 0,
  analysis_duration INTEGER, -- 秒
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 行コメントテーブル
CREATE TABLE IF NOT EXISTS line_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  
  -- ファイル情報
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  line_content TEXT,
  
  -- コメント情報
  comment_type TEXT NOT NULL CHECK (comment_type IN ('suggestion', 'issue', 'question', 'praise')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('error', 'warning', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggestion TEXT,
  
  -- AI情報
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  rule_matched TEXT,
  
  -- GitHub/GitLab統合
  posted_to_provider BOOLEAN DEFAULT FALSE,
  provider_comment_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ルールセットテーブル
CREATE TABLE IF NOT EXISTS rule_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- ルール情報
  name TEXT NOT NULL,
  description TEXT,
  claude_md_content TEXT NOT NULL,
  
  -- 設定
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- 統計
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider_id ON user_profiles(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_line_comments_review_id ON line_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_line_comments_file_path ON line_comments(file_path);
CREATE INDEX IF NOT EXISTS idx_rule_sets_user_id ON rule_sets(user_id);

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_line_comments_updated_at BEFORE UPDATE ON line_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rule_sets_updated_at BEFORE UPDATE ON rule_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();