import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { createClient } from '@/lib/supabase/client'
import {
  userAtom,
  sessionAtom,
  loadingAtom,
  userProfileAtom,
  setSessionAtom,
  setLoadingAtom,
  setUserProfileAtom
} from '@/lib/atoms/auth'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export function useAuth() {
  const [user] = useAtom(userAtom)
  const [session] = useAtom(sessionAtom)
  const [loading] = useAtom(loadingAtom)
  const [userProfile] = useAtom(userProfileAtom)
  const [, setSession] = useAtom(setSessionAtom)
  const [, setLoading] = useAtom(setLoadingAtom)
  const [, setUserProfile] = useAtom(setUserProfileAtom)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(session)
      setLoading(false)

      // If user is authenticated, fetch profile
      if (session?.user) {
        await syncUserProfile(session.user)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession, setLoading, setUserProfile, supabase.auth])

  const syncUserProfile = async (user: any) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError)
        return
      }

      if (existingProfile) {
        setUserProfile(existingProfile)
      } else {
        // Create new profile
        const newProfile: Database['public']['Tables']['user_profiles']['Insert'] = {
          user_id: user.id,
          provider: user.app_metadata.provider || 'unknown',
          provider_id: user.user_metadata.provider_id || user.id,
          username: user.user_metadata.user_name || user.user_metadata.preferred_username || user.email?.split('@')[0] || 'user',
          display_name: user.user_metadata.full_name || user.user_metadata.name,
          avatar_url: user.user_metadata.avatar_url,
          email: user.email,
          github_data: user.app_metadata.provider === 'github' ? user.user_metadata : null,
          gitlab_data: user.app_metadata.provider === 'gitlab' ? user.user_metadata : null,
          preferences: {}
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
        } else {
          setUserProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error('Error syncing user profile:', error)
    }
  }

  const signInWithGitHub = async () => {
    console.log('🔐 GitHub認証を開始します...')
    console.log('リダイレクトURL:', `${window.location.origin}/auth/callback`)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user user:email read:org repo',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ GitHub認証エラー:', error)
        throw new Error(`GitHub認証に失敗しました: ${error.message}`)
      }
      
      if (data?.url) {
        console.log('✅ 認証URLが生成されました:', data.url)
      }
      
      console.log('🚀 GitHub認証ページにリダイレクトします...')
    } catch (err) {
      console.error('❌ 予期しないエラー:', err)
      throw err
    }
  }

  const signInWithGitLab = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'gitlab',
      options: {
        scopes: 'read_user read_repository read_api write_repository',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Error signing in with GitLab:', error)
      throw new Error('GitLab認証に失敗しました')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw new Error('ログアウトに失敗しました')
    }
  }

  return {
    user,
    session,
    loading,
    userProfile,
    signInWithGitHub,
    signInWithGitLab,
    signOut
  }
}