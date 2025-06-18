#!/usr/bin/env node

/**
 * セットアップ確認スクリプト
 * 必要な環境変数とSupabase接続をチェックします
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Claude Code Review Assistant - セットアップ確認\n');

// 環境変数を格納する変数を初期化
let envVars = {};

// 1. 環境変数ファイルの確認
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('📁 環境変数ファイルの確認:');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local が見つかりません');
  console.log('   以下のコマンドでコピーしてください:');
  console.log('   cp .env.example .env.local\n');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 .env.example が存在します - 参考にしてください\n');
  }
} else {
  console.log('✅ .env.local が存在します\n');
  
  // 2. 必要な環境変数のチェック
  // .env.localファイルを読み込んでパース
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        envVars[key] = value;
      }
    }
  });
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  ];
  
  console.log('🔑 必須環境変数の確認:');
  let missingRequired = false;
  
  requiredEnvVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your-') || value.includes('your_')) {
      console.log(`❌ ${varName}: 未設定または仮の値`);
      missingRequired = true;
    } else {
      console.log(`✅ ${varName}: 設定済み`);
    }
  });
  
  console.log('\n🔧 オプション環境変数の確認:');
  optionalEnvVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your-') || value.includes('your_')) {
      console.log(`⚠️  ${varName}: 未設定（Phase 2以降で必要）`);
    } else {
      console.log(`✅ ${varName}: 設定済み`);
    }
  });
  
  if (missingRequired) {
    console.log('\n❌ 必須環境変数が不足しています');
    console.log('   setup-guides/SUPABASE_SETUP.md を参照してください\n');
  } else {
    console.log('\n✅ 必須環境変数は設定済みです\n');
  }
}

// 3. Supabase接続テスト（環境変数が設定されている場合のみ）
if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('🔗 Supabase接続テスト:');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // 簡単な接続テスト
    console.log('   接続設定: OK');
    console.log('   ※ 実際の接続確認は `npm run dev` でアプリケーションを起動してください\n');
    
  } catch (error) {
    console.log('❌ Supabase設定エラー:', error.message);
    console.log('   環境変数を確認してください\n');
  }
}

// 4. 必要なファイルの確認
console.log('📋 セットアップファイルの確認:');
const requiredFiles = [
  'setup-guides/SUPABASE_SETUP.md',
  'sql/01_create_tables.sql',
  'sql/02_setup_rls.sql'
];

requiredFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath}`);
  }
});

console.log('\n🚀 次のステップ:');
console.log('1. Supabaseプロジェクトを作成していない場合:');
console.log('   → setup-guides/SUPABASE_SETUP.md を参照');
console.log('2. 環境変数を設定していない場合:');
console.log('   → .env.local ファイルを作成・編集');
console.log('3. データベーステーブルを作成していない場合:');
console.log('   → SQL Editorで sql/*.sql を実行');
console.log('4. すべて完了している場合:');
console.log('   → npm run dev でアプリケーションを起動\n');

console.log('❓ 問題が発生した場合は setup-guides/SUPABASE_SETUP.md のトラブルシューティングを確認してください');

// 5. GitHubプロバイダー設定確認の注意点  
if (envVars.GITHUB_CLIENT_ID && envVars.GITHUB_CLIENT_SECRET) {
  console.log('\n⚠️  GitHubプロバイダー設定の確認:');
  console.log('環境変数にGitHub認証情報が設定されていますが、');
  console.log('SupabaseダッシュボードでGitHubプロバイダーを有効化する必要があります：');
  console.log('');
  console.log('1. https://app.supabase.io/project/aorriczktrvjucuusrzs にアクセス');
  console.log('2. Authentication > Providers に移動');
  console.log('3. GitHub プロバイダーを Enable にする');
  console.log('4. Client ID と Client Secret を入力');
  console.log('5. Save をクリック');
  console.log('');
  console.log('❌ この設定を行わないと認証時に以下のエラーが発生します:');
  console.log('   "Unsupported provider: provider is not enabled"');
}