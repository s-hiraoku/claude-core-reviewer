export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          email: string | null
          github_data: Json | null
          gitlab_data: Json | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          github_data?: Json | null
          gitlab_data?: Json | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          github_data?: Json | null
          gitlab_data?: Json | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          provider: string
          repository_url: string
          pr_number: number | null
          pr_url: string
          title: string
          description: string | null
          author_username: string | null
          author_avatar_url: string | null
          base_branch: string
          head_branch: string
          state: string
          status: string
          overall_score: number | null
          total_files: number
          analyzed_files: number
          total_lines: number
          analyzed_lines: number
          issues_found: number
          claude_summary: string | null
          claude_recommendations: string[] | null
          analysis_metadata: Json
          is_public: boolean
          is_shared_with_org: boolean
          analyzed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          provider: string
          repository_url: string
          pr_number?: number | null
          pr_url: string
          title: string
          description?: string | null
          author_username?: string | null
          author_avatar_url?: string | null
          base_branch: string
          head_branch: string
          state: string
          status?: string
          overall_score?: number | null
          total_files?: number
          analyzed_files?: number
          total_lines?: number
          analyzed_lines?: number
          issues_found?: number
          claude_summary?: string | null
          claude_recommendations?: string[] | null
          analysis_metadata?: Json
          is_public?: boolean
          is_shared_with_org?: boolean
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          provider?: string
          repository_url?: string
          pr_number?: number | null
          pr_url?: string
          title?: string
          description?: string | null
          author_username?: string | null
          author_avatar_url?: string | null
          base_branch?: string
          head_branch?: string
          state?: string
          status?: string
          overall_score?: number | null
          total_files?: number
          analyzed_files?: number
          total_lines?: number
          analyzed_lines?: number
          issues_found?: number
          claude_summary?: string | null
          claude_recommendations?: string[] | null
          analysis_metadata?: Json
          is_public?: boolean
          is_shared_with_org?: boolean
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      line_comments: {
        Row: {
          id: string
          review_id: string
          file_id: string | null
          user_id: string
          line_number: number
          column_start: number | null
          column_end: number | null
          comment_type: string
          severity: string
          category: string | null
          title: string | null
          description: string
          suggested_fix: string | null
          claude_confidence: number | null
          claude_reasoning: string | null
          rule_applied: string | null
          status: string
          resolved_by: string | null
          resolved_at: string | null
          resolution_comment: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          file_id?: string | null
          user_id: string
          line_number: number
          column_start?: number | null
          column_end?: number | null
          comment_type: string
          severity?: string
          category?: string | null
          title?: string | null
          description: string
          suggested_fix?: string | null
          claude_confidence?: number | null
          claude_reasoning?: string | null
          rule_applied?: string | null
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_comment?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          file_id?: string | null
          user_id?: string
          line_number?: number
          column_start?: number | null
          column_end?: number | null
          comment_type?: string
          severity?: string
          category?: string | null
          title?: string | null
          description?: string
          suggested_fix?: string | null
          claude_confidence?: number | null
          claude_reasoning?: string | null
          rule_applied?: string | null
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_comment?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]