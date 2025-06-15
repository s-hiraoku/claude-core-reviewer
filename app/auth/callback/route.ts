import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_code = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('🔄 認証コールバック処理を開始')

  // OAuth認証エラーの場合
  if (error_code) {
    console.error('❌ OAuth認証エラー:', { error_code, error_description })
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error_description || 'OAuth認証に失敗しました')}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      console.log('🔐 認証コードをセッションに交換中...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ セッション交換エラー:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        console.log('✅ 認証セッション作成成功:', data.session.user.email)

        // プロファイル確認（トリガーで自動作成されるが、念のため確認）
        const { error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          console.warn('プロファイルが見つかりません。トリガーによる自動作成を確認してください。')
        }
      }
    } catch (error) {
      console.error('❌ 認証コールバック処理エラー:', error instanceof Error ? error.message : String(error))
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('認証に失敗しました')}`)
    }
  } else {
    console.warn('⚠️ 認証コードが見つかりません')
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}