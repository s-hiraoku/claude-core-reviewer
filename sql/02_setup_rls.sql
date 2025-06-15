-- Claude Code Review Assistant - Row Level Security (RLS) Setup
-- このファイルはSupabase SQL Editorで実行してください

-- RLS有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_sets ENABLE ROW LEVEL SECURITY;

-- 1. user_profiles テーブルのRLSポリシー
-- ユーザーは自分のプロファイルのみ読み書き可能
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. reviews テーブルのRLSポリシー
-- ユーザーは自分のレビューのみ読み書き可能
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 3. line_comments テーブルのRLSポリシー
-- ユーザーは自分のレビューのコメントのみ読み書き可能
CREATE POLICY "Users can view own review comments" ON line_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = line_comments.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own review comments" ON line_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = line_comments.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own review comments" ON line_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = line_comments.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own review comments" ON line_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = line_comments.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

-- 4. rule_sets テーブルのRLSポリシー
-- ユーザーは自分のルールセットと公開ルールセットを読み取り可能
CREATE POLICY "Users can view own rule sets" ON rule_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public rule sets" ON rule_sets
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own rule sets" ON rule_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rule sets" ON rule_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rule sets" ON rule_sets
  FOR DELETE USING (auth.uid() = user_id);

-- 5. プロファイル作成トリガー
-- 新規ユーザー登録時に自動でプロファイルを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  github_identity JSONB;
  user_name TEXT;
  display_name TEXT;
  avatar_url TEXT;
  provider_name TEXT;
  provider_id TEXT;
BEGIN
  -- GitHub identityデータを探す
  SELECT identity_data INTO github_identity
  FROM auth.identities 
  WHERE user_id = NEW.id AND provider = 'github'
  LIMIT 1;

  -- GitHubデータが見つかった場合
  IF github_identity IS NOT NULL THEN
    user_name := github_identity->>'user_name';
    display_name := github_identity->>'full_name';
    avatar_url := github_identity->>'avatar_url';
    provider_name := 'github';
    provider_id := github_identity->>'provider_id';
  ELSE
    -- GitHubデータが見つからない場合はemailから生成
    user_name := split_part(NEW.email, '@', 1);
    display_name := split_part(NEW.email, '@', 1);
    avatar_url := NULL;
    provider_name := 'unknown';
    provider_id := NEW.id::text;
  END IF;

  -- プロファイル作成
  INSERT INTO public.user_profiles (
    user_id,
    username,
    display_name,
    avatar_url,
    email,
    provider,
    provider_id,
    github_data,
    gitlab_data,
    preferences
  )
  VALUES (
    NEW.id,
    COALESCE(user_name, 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(display_name, 'User'),
    avatar_url,
    NEW.email,
    provider_name,
    provider_id,
    CASE WHEN provider_name = 'github' THEN github_identity ELSE NULL END,
    NULL,
    '{}'::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生してもユーザー作成は継続
    RAISE WARNING 'プロファイル作成に失敗しました。ユーザーID: %, エラー: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. デフォルトルールセット作成関数
CREATE OR REPLACE FUNCTION create_default_rule_set(user_id UUID)
RETURNS UUID AS $$
DECLARE
  rule_set_id UUID;
BEGIN
  INSERT INTO rule_sets (user_id, name, description, claude_md_content, is_default)
  VALUES (
    user_id,
    'デフォルトルール',
    'Claude Code Reviewのデフォルトコーディング規約',
    '# デフォルトコーディング規約

## 基本方針
- 読みやすいコードを書く
- 適切なコメントを記述する
- エラーハンドリングを適切に行う
- セキュリティを考慮する

## TypeScript / JavaScript
- TypeScript厳密モードを使用
- ESLint + Prettierでフォーマット
- 関数にはJSDocコメントを追加
- any型の使用を避ける

## React
- 関数コンポーネントを使用
- カスタムフックでロジックを分離
- propsの型定義を明確にする
- useEffectの依存配列を正しく設定

## セキュリティ
- 機密情報をコードに直接記述しない
- XSS対策を実装する
- 適切な認証・認可を実装する',
    true
  )
  RETURNING id INTO rule_set_id;
  
  RETURN rule_set_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;