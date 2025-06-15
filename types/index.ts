// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'user_id'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'user_id'>>
      }
      line_comments: {
        Row: LineComment
        Insert: Omit<LineComment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LineComment, 'id'>>
      }
    }
  }
}

// User types
export interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  github_data: GitHubData | null
  gitlab_data: GitLabData | null
  created_at: string
  updated_at: string
}

export interface GitHubData {
  id: number
  login: string
  name: string | null
  email: string | null
  bio: string | null
  location: string | null
  company: string | null
  organizations?: GitHubOrganization[]
}

export interface GitHubOrganization {
  id: number
  login: string
  avatar_url: string
}

export interface GitLabData {
  id: number
  username: string
  name: string | null
  email: string | null
  bio: string | null
  location: string | null
  groups?: GitLabGroup[]
}

export interface GitLabGroup {
  id: number
  name: string
  path: string
  avatar_url: string | null
}

// Review types
export interface Review {
  id: string
  user_id: string
  pr_url: string
  title: string
  description: string | null
  status: ReviewStatus
  overall_score: number | null
  claude_summary: string | null
  claude_recommendations: string[] | null
  created_at: string
  updated_at: string
}

export type ReviewStatus = 'pending' | 'analyzing' | 'completed' | 'failed'

export interface LineComment {
  id: string
  review_id: string
  line_number: number
  severity: CommentSeverity
  category: string | null
  title: string | null
  description: string
  suggested_fix: string | null
  claude_confidence: number | null
  created_at: string
  updated_at: string
}

export type CommentSeverity = 'critical' | 'major' | 'minor' | 'info'

// API types
export interface PRData {
  pr: {
    id: number
    number: number
    title: string
    body: string | null
    state: string
    user: {
      login: string
      avatar_url: string
    }
    base: {
      ref: string
      sha: string
    }
    head: {
      ref: string
      sha: string
    }
    created_at: string
    updated_at: string
  }
  files: PRFile[]
  commits: PRCommit[]
}

export interface PRFile {
  filename: string
  status: 'added' | 'modified' | 'removed' | 'renamed'
  additions: number
  deletions: number
  changes: number
  patch?: string
  contents_url: string
}

export interface PRCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  url: string
}

// Analysis types
export interface AnalysisResult {
  overall_score: number
  summary: string
  recommendations: string[]
  issues: AnalysisIssue[]
  metadata: AnalysisMetadata
}

export interface AnalysisIssue {
  line_number: number
  column_start?: number
  column_end?: number
  severity: CommentSeverity
  category: string
  title: string
  description: string
  suggested_fix?: string
  confidence: number
  rule_applied?: string
}

export interface AnalysisMetadata {
  analysis_time: number
  tokens_used: number
  rules_applied: string[]
  language_detected?: string
}

// UI types
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

// Utility types
export type ApiResponse<T> = {
  data: T
  error?: never
} | {
  data?: never
  error: string
}