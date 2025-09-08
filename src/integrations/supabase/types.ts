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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dividend_transactions: {
        Row: {
          amount: number
          company_name: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          symbol: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          company_name?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          symbol?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          company_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          symbol?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividend_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      plaid_access_logs: {
        Row: {
          account_id: string | null
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plaid_accounts: {
        Row: {
          access_count: number | null
          access_token_encrypted: string | null
          account_id: string
          account_name: string | null
          account_type: string | null
          created_at: string
          encryption_version: number | null
          id: string
          institution_id: string | null
          institution_name: string | null
          is_active: boolean
          is_encrypted: boolean | null
          item_id: string
          token_expires_at: string | null
          token_last_rotated: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          access_token_encrypted?: string | null
          account_id: string
          account_name?: string | null
          account_type?: string | null
          created_at?: string
          encryption_version?: number | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_active?: boolean
          is_encrypted?: boolean | null
          item_id: string
          token_expires_at?: string | null
          token_last_rotated?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          access_token_encrypted?: string | null
          account_id?: string
          account_name?: string | null
          account_type?: string | null
          created_at?: string
          encryption_version?: number | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_active?: boolean
          is_encrypted?: boolean | null
          item_id?: string
          token_expires_at?: string | null
          token_last_rotated?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plaid_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stocks: {
        Row: {
          annual_dividend: number | null
          company_name: string | null
          created_at: string
          current_price: number | null
          dividend_date: string | null
          dividend_per_share: number | null
          dividend_yield: number | null
          ex_dividend_date: string | null
          id: string
          industry: string | null
          last_synced: string
          market_cap: number | null
          pe_ratio: number | null
          sector: string | null
          shares: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_dividend?: number | null
          company_name?: string | null
          created_at?: string
          current_price?: number | null
          dividend_date?: string | null
          dividend_per_share?: number | null
          dividend_yield?: number | null
          ex_dividend_date?: string | null
          id?: string
          industry?: string | null
          last_synced?: string
          market_cap?: number | null
          pe_ratio?: number | null
          sector?: string | null
          shares?: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_dividend?: number | null
          company_name?: string | null
          created_at?: string
          current_price?: number | null
          dividend_date?: string | null
          dividend_per_share?: number | null
          dividend_yield?: number | null
          ex_dividend_date?: string | null
          id?: string
          industry?: string | null
          last_synced?: string
          market_cap?: number | null
          pe_ratio?: number | null
          sector?: string | null
          shares?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_name?: string }
        Returns: string
      }
      detect_suspicious_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      emergency_lockdown_financial_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      encrypt_existing_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      encrypt_sensitive_data: {
        Args: { data: string; key_name?: string }
        Returns: string
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_decrypted_access_token: {
        Args: { p_account_id: string; p_user_id: string }
        Returns: string
      }
      is_emergency_lockdown: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_financial_access: {
        Args: {
          operation: string
          table_name: string
          user_id_accessed?: string
        }
        Returns: undefined
      }
      log_plaid_access: {
        Args: {
          p_account_id?: string
          p_action: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      mask_financial_data: {
        Args: { data: string }
        Returns: string
      }
      store_encrypted_access_token: {
        Args: {
          p_access_token: string
          p_account_id: string
          p_account_name?: string
          p_account_type?: string
          p_institution_id?: string
          p_institution_name?: string
          p_item_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      validate_user_stock_access: {
        Args: { stock_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
