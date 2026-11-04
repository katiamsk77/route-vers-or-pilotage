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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string
          cure_days: number | null
          decision: string | null
          email: string | null
          goals: string | null
          id: string
          kind: string
          name: string
          next_followup: string | null
          notes: string | null
          order_date: string | null
          phone: string | null
          products: string | null
          rank: string | null
          rank_goal: string | null
          rgpd_consent: boolean
          road_to_gold: Json
          scan_pdf_path: string | null
          stage: string
          user_id: string
          weekly_review: Json
        }
        Insert: {
          created_at?: string
          cure_days?: number | null
          decision?: string | null
          email?: string | null
          goals?: string | null
          id?: string
          kind?: string
          name: string
          next_followup?: string | null
          notes?: string | null
          order_date?: string | null
          phone?: string | null
          products?: string | null
          rank?: string | null
          rank_goal?: string | null
          rgpd_consent?: boolean
          road_to_gold?: Json
          scan_pdf_path?: string | null
          stage?: string
          user_id?: string
          weekly_review?: Json
        }
        Update: {
          created_at?: string
          cure_days?: number | null
          decision?: string | null
          email?: string | null
          goals?: string | null
          id?: string
          kind?: string
          name?: string
          next_followup?: string | null
          notes?: string | null
          order_date?: string | null
          phone?: string | null
          products?: string | null
          rank?: string | null
          rank_goal?: string | null
          rgpd_consent?: boolean
          road_to_gold?: Json
          scan_pdf_path?: string | null
          stage?: string
          user_id?: string
          weekly_review?: Json
        }
        Relationships: []
      }
      daily_actions: {
        Row: {
          created_at: string
          day: string
          done: boolean
          id: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day?: string
          done?: boolean
          id?: string
          label: string
          user_id?: string
        }
        Update: {
          created_at?: string
          day?: string
          done?: boolean
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          id: string
          kind: string
          link: string | null
          starts_at: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          starts_at: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          starts_at?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          created_at: string
          done: number
          id: string
          label: string
          month: string
          planned: number
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: number
          id?: string
          label: string
          month: string
          planned?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          done?: number
          id?: string
          label?: string
          month?: string
          planned?: number
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          benefits: string | null
          color: string
          created_at: string
          id: string
          image_url: string | null
          ingredients: string | null
          name: string
          public_price: number
          range: string
          sort: number
          tagline: string | null
          usage: string | null
          videos: string[]
        }
        Insert: {
          benefits?: string | null
          color?: string
          created_at?: string
          id?: string
          image_url?: string | null
          ingredients?: string | null
          name: string
          public_price?: number
          range: string
          sort?: number
          tagline?: string | null
          usage?: string | null
          videos?: string[]
        }
        Update: {
          benefits?: string | null
          color?: string
          created_at?: string
          id?: string
          image_url?: string | null
          ingredients?: string | null
          name?: string
          public_price?: number
          range?: string
          sort?: number
          tagline?: string | null
          usage?: string | null
          videos?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          first_name: string
          id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          first_name?: string
          id: string
        }
        Update: {
          created_at?: string
          currency?: string
          first_name?: string
          id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      scripts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          done: boolean
          id: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          label: string
          user_id?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          created_at: string
          step_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          step_key: string
          user_id?: string
        }
        Update: {
          created_at?: string
          step_key?: string
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
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
