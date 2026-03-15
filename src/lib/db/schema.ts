export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          url: string;
          source_name: string;
          source_domain: string;
          category: string;
          summary: string | null;
          image_url: string | null;
          published_at: string;
          language: string;
          relevance_score: number;
          signal_summary: string | null;
          dedupe_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          source_name: string;
          source_domain: string;
          category: string;
          summary?: string | null;
          image_url?: string | null;
          published_at: string;
          language?: string;
          relevance_score?: number;
          signal_summary?: string | null;
          dedupe_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };
      sync_runs: {
        Row: {
          id: string;
          provider: string;
          started_at: string;
          finished_at: string | null;
          status: "running" | "success" | "partial" | "failed";
          inserted_count: number;
          updated_count: number;
          error_log: string | null;
        };
        Insert: {
          id?: string;
          provider: string;
          started_at: string;
          finished_at?: string | null;
          status: "running" | "success" | "partial" | "failed";
          inserted_count?: number;
          updated_count?: number;
          error_log?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sync_runs"]["Insert"]>;
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          role: "viewer" | "editor" | "operator" | "admin";
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          disabled_at: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          role: "viewer" | "editor" | "operator" | "admin";
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          disabled_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
      };
      admin_sessions: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at: string;
          last_seen_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at?: string;
          last_seen_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_sessions"]["Insert"]>;
      };
      admin_login_attempts: {
        Row: {
          id: string;
          username: string;
          ip_address: string | null;
          attempted_at: string;
          success: boolean;
        };
        Insert: {
          id?: string;
          username: string;
          ip_address?: string | null;
          attempted_at?: string;
          success?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["admin_login_attempts"]["Insert"]>;
      };
      admin_audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource: string;
          ip_address: string | null;
          user_agent: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource: string;
          ip_address?: string | null;
          user_agent?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_audit_logs"]["Insert"]>;
      };
    };
  };
}
