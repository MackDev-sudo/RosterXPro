import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (Basic schema)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          email: string;
          phone: string;
          profile_image_url: string | null;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          email: string;
          phone: string;
          profile_image_url?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          email?: string;
          phone?: string;
          profile_image_url?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          project_id: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          team_lead_name: string | null;
          team_lead_email: string | null;
          team_lead_phone: string | null;
          project_manager_name: string | null;
          project_manager_email: string | null;
          project_manager_phone: string | null;
          team_code: string | null;
          team_lead_id: string | null;
          manager_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          project_id: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          team_lead_name?: string | null;
          team_lead_email?: string | null;
          team_lead_phone?: string | null;
          project_manager_name?: string | null;
          project_manager_email?: string | null;
          project_manager_phone?: string | null;
          team_code?: string | null;
          team_lead_id?: string | null;
          manager_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          project_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          team_lead_name?: string | null;
          team_lead_email?: string | null;
          team_lead_phone?: string | null;
          project_manager_name?: string | null;
          project_manager_email?: string | null;
          project_manager_phone?: string | null;
          team_code?: string | null;
          team_lead_id?: string | null;
          manager_id?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      roster_entries: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          date: string;
          shift_type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          date: string;
          shift_type: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          date?: string;
          shift_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          start_date: string;
          end_date: string;
          leave_type: string;
          reason: string;
          status: string;
          applied_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          start_date: string;
          end_date: string;
          leave_type: string;
          reason: string;
          status: string;
          applied_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          start_date?: string;
          end_date?: string;
          leave_type?: string;
          reason?: string;
          status?: string;
          applied_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
      comp_off_carry_forward: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          year: number;
          month: number;
          carry_forward_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          year: number;
          month: number;
          carry_forward_balance: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          year?: number;
          month?: number;
          carry_forward_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      upcoming_leaves: {
        Row: {
          id: string;
          user_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          lrid: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          lrid?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          leave_type?: string;
          start_date?: string;
          end_date?: string;
          reason?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          lrid?: string | null;
        };
      };
      comp_off_monthly_balance: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          year: number;
          month: number;
          oc_days: number;
          cf_days: number;
          balance: number;
          carry_forward_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          year: number;
          month: number;
          oc_days: number;
          cf_days: number;
          balance: number;
          carry_forward_balance: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          year?: number;
          month?: number;
          oc_days?: number;
          cf_days?: number;
          balance?: number;
          carry_forward_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_organizations: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ...existing code...
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
