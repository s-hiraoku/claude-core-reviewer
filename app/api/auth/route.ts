import { NextResponse } from 'next/server'

/**
 * 認証関連のヘルスチェックAPI
 * Supabase認証で参照される可能性のある基本エンドポイント
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Authentication API endpoint is available',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Authentication API endpoint accepts POST requests',
    timestamp: new Date().toISOString()
  })
}