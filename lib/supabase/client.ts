import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * クライアントサイド専用 Supabase クライアント
 * React Hooks、Client Components で使用
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * 汎用 Supabase クライアント（クライアントサイド）
 * 認証フロー、リアルタイム機能などで使用
 */
export const supabase = createClient()