import { NextResponse } from 'next/server'

/**
 * アプリケーションヘルスチェックAPI
 */
export async function GET() {
  try {
    // 必要最小限の情報のみ返す
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'unhealthy', error: 'Internal server error' },
      { status: 500 }
    )
  }
}
