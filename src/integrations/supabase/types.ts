export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          eligibility_status: string
          explanation: string | null
          id: string
          match_percentage: number
          missing_criteria: string[] | null
          query_text: string | null
          scheme_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          eligibility_status?: string
          explanation?: string | null
          id?: string
          match_percentage?: number
          missing_criteria?: string[] | null
          query_text?: string | null
          scheme_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          eligibility_status?: string
          explanation?: string | null
          id?: string
          match_percentage?: number
          missing_criteria?: string[] | null
          query_text?: string | null
          scheme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_schemes: {
        Row: {
          created_at: string
          id: string
          match_percentage: number
          scheme_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_percentage?: number
          scheme_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_percentage?: number
          scheme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          benefits: string
          category: string
          created_at: string
          deadline: string | null
          description: string | null
          documents_required: string[] | null
          education_level: string | null
          gender: string | null
          id: string
          income_limit: number | null
          is_active: boolean | null
          max_age: number | null
          min_age: number | null
          occupation: string | null
          official_link: string | null
          scheme_name: string
          state: string | null
          target_group: string
          updated_at: string
        }
        Insert: {
          benefits: string
          category: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          documents_required?: string[] | null
          education_level?: string | null
          gender?: string | null
          id?: string
          income_limit?: number | null
          is_active?: boolean | null
          max_age?: number | null
          min_age?: number | null
          occupation?: string | null
          official_link?: string | null
          scheme_name: string
          state?: string | null
          target_group: string
          updated_at?: string
        }
        Update: {
          benefits?: string
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          documents_required?: string[] | null
          education_level?: string | null
          gender?: string | null
          id?: string
          income_limit?: number | null
          is_active?: boolean | null
          max_age?: number | null
          min_age?: number | null
          occupation?: string | null
          official_link?: string | null
          scheme_name?: string
          state?: string | null
          target_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          category: string | null
          created_at: string
          district: string | null
          education_level: string | null
          full_name: string | null
          gender: string | null
          goals: string[] | null
          id: string
          income: number | null
          occupation: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          category?: string | null
          created_at?: string
          district?: string | null
          education_level?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id?: string
          income?: number | null
          occupation?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          category?: string | null
          created_at?: string
          district?: string | null
          education_level?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id?: string
          income?: number | null
          occupation?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
