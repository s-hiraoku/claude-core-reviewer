import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * クライアントサイド専用 Supabase クライアント
 * React Hooks、Client Components で使用
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      'Supabase env vars missing: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'
    )
  }

  return createBrowserClient<Database>(url, anon)
}

/**
 * 汎用 Supabase クライアント（クライアントサイド）
 * 認証フロー、リアルタイム機能などで使用
 */
export const supabase = createClient()