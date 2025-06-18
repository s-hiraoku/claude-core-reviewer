import { atom } from 'jotai'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Authentication atoms
export const userAtom = atom<User | null>(null)
export const sessionAtom = atom<Session | null>(null)
export const loadingAtom = atom<boolean>(true)
export const userProfileAtom = atom<UserProfile | null>(null)

// Derived atoms
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)
export const isLoadingAtom = atom((get) => get(loadingAtom))

// Auth actions
export const setUserAtom = atom(
  null,
  (get, set, user: User | null) => {
    set(userAtom, user)
  }
)

export const setSessionAtom = atom(
  null,
  (get, set, session: Session | null) => {
    set(sessionAtom, session)
    set(userAtom, session?.user ?? null)
  }
)

export const setLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(loadingAtom, loading)
  }
)

export const setUserProfileAtom = atom(
  null,
  (get, set, profile: UserProfile | null) => {
    set(userProfileAtom, profile)
  }
)