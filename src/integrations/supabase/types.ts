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
      area_access: {
        Row: {
          area: string
          decided_at: string | null
          decided_by: string | null
          id: string
          note: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          area: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          area?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          actor_role: string | null
          at: string
          detail: string | null
          device: string | null
          entity: string | null
          entity_id: string | null
          id: number
          location: string | null
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          at?: string
          detail?: string | null
          device?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: never
          location?: string | null
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          at?: string
          detail?: string | null
          device?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: never
          location?: string | null
          meta?: Json | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string | null
          cnpj: string | null
          email: string | null
          id: number
          legal_name: string | null
          nf_notes: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          email?: string | null
          id?: number
          legal_name?: string | null
          nf_notes?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          email?: string | null
          id?: number
          legal_name?: string | null
          nf_notes?: string | null
        }
        Relationships: []
      }
      goal_locks: {
        Row: {
          confirmed_at: string
          confirmed_by: string | null
          month: string
        }
        Insert: {
          confirmed_at?: string
          confirmed_by?: string | null
          month: string
        }
        Update: {
          confirmed_at?: string
          confirmed_by?: string | null
          month?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          day: string
          name: string
        }
        Insert: {
          day: string
          name: string
        }
        Update: {
          day?: string
          name?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          approved_by: string | null
          bonus: number
          file_path: string | null
          fixo: number
          generated_at: string
          id: string
          month: string
          number: string | null
          paid_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          bonus: number
          file_path?: string | null
          fixo: number
          generated_at?: string
          id?: string
          month: string
          number?: string | null
          paid_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          bonus?: number
          file_path?: string | null
          fixo?: number
          generated_at?: string
          id?: string
          month?: string
          number?: string | null
          paid_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      meta_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          effective_month: string
          id: string
          reason: string | null
          scale: number
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_month: string
          id?: string
          reason?: string | null
          scale: number
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_month?: string
          id?: string
          reason?: string | null
          scale?: number
          user_id?: string
        }
        Relationships: []
      }
      month_closures: {
        Row: {
          closed_at: string
          closed_by: string | null
          month: string
          rows: Json
        }
        Insert: {
          closed_at?: string
          closed_by?: string | null
          month: string
          rows: Json
        }
        Update: {
          closed_at?: string
          closed_by?: string | null
          month?: string
          rows?: Json
        }
        Relationships: []
      }
      month_goals: {
        Row: {
          goal: number
          month: string
          multiplier: number
          ramp: number
          salary: number
          scale: number
          user_id: string
        }
        Insert: {
          goal: number
          month: string
          multiplier: number
          ramp: number
          salary: number
          scale: number
          user_id: string
        }
        Update: {
          goal?: number
          month?: string
          multiplier?: number
          ramp?: number
          salary?: number
          scale?: number
          user_id?: string
        }
        Relationships: []
      }
      multiplier_fixed: {
        Row: {
          month: string
          set_at: string
          set_by: string | null
          value: number
        }
        Insert: {
          month: string
          set_at?: string
          set_by?: string | null
          value: number
        }
        Update: {
          month?: string
          set_at?: string
          set_by?: string | null
          value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          ref: string | null
          resolved_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          ref?: string | null
          resolved_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          ref?: string | null
          resolved_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      params: {
        Row: {
          key: string
          valid_from: string
          value: number
        }
        Insert: {
          key: string
          valid_from?: string
          value: number
        }
        Update: {
          key?: string
          valid_from?: string
          value?: number
        }
        Relationships: []
      }
      product_versions: {
        Row: {
          caixa_pct: number
          id: string
          min_price: number
          points: number
          product_id: string
          valid_from: string
        }
        Insert: {
          caixa_pct?: number
          id?: string
          min_price?: number
          points: number
          product_id: string
          valid_from: string
        }
        Update: {
          caixa_pct?: number
          id?: string
          min_price?: number
          points?: number
          product_id?: string
          valid_from?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          recurring: boolean
          sort: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          recurring?: boolean
          sort?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          recurring?: boolean
          sort?: number
        }
        Relationships: []
      }
      profile_sensitive: {
        Row: {
          account: string | null
          agency: string | null
          bank: string | null
          cnpj: string | null
          cpf: string | null
          pix_key: string | null
          rg: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cpf?: string | null
          pix_key?: string | null
          rg?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cpf?: string | null
          pix_key?: string | null
          rg?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          address: Json
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string
          emergency_name: string | null
          emergency_phone: string | null
          end_date: string | null
          full_name: string | null
          google_login: boolean
          id: string
          job_title: string | null
          manager_id: string | null
          nickname: string | null
          notes: string | null
          personal_email: string | null
          phone: string | null
          regime: string | null
          seniority: string | null
          start_date: string | null
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          address?: Json
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          emergency_name?: string | null
          emergency_phone?: string | null
          end_date?: string | null
          full_name?: string | null
          google_login?: boolean
          id: string
          job_title?: string | null
          manager_id?: string | null
          nickname?: string | null
          notes?: string | null
          personal_email?: string | null
          phone?: string | null
          regime?: string | null
          seniority?: string | null
          start_date?: string | null
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          address?: Json
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          emergency_name?: string | null
          emergency_phone?: string | null
          end_date?: string | null
          full_name?: string | null
          google_login?: boolean
          id?: string
          job_title?: string | null
          manager_id?: string | null
          nickname?: string | null
          notes?: string | null
          personal_email?: string | null
          phone?: string | null
          regime?: string | null
          seniority?: string | null
          start_date?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_history: {
        Row: {
          amount: number
          id: string
          user_id: string
          valid_from: string
        }
        Insert: {
          amount: number
          id?: string
          user_id: string
          valid_from: string
        }
        Update: {
          amount?: number
          id?: string
          user_id?: string
          valid_from?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          product_id: string
          qty: number
          qty_override: number | null
          sale_id: string
          value: number
        }
        Insert: {
          id?: string
          product_id: string
          qty?: number
          qty_override?: number | null
          sale_id: string
          value?: number
        }
        Update: {
          id?: string
          product_id?: string
          qty?: number
          qty_override?: number | null
          sale_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_doc: string | null
          client_name: string
          created_at: string
          dup_flag: boolean
          floor_status: string
          id: string
          installments: number
          notes: string | null
          pay_method: string
          recurring: boolean
          sale_date: string
          seller_id: string
          status: string
          total_value: number
          validated_at: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_doc?: string | null
          client_name: string
          created_at?: string
          dup_flag?: boolean
          floor_status?: string
          id?: string
          installments?: number
          notes?: string | null
          pay_method: string
          recurring?: boolean
          sale_date: string
          seller_id: string
          status?: string
          total_value?: number
          validated_at?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_doc?: string | null
          client_name?: string
          created_at?: string
          dup_flag?: boolean
          floor_status?: string
          id?: string
          installments?: number
          notes?: string | null
          pay_method?: string
          recurring?: boolean
          sale_date?: string
          seller_id?: string
          status?: string
          total_value?: number
          validated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_area: { Args: { a: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "closer" | "gestor" | "admin"
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
      app_role: ["closer", "gestor", "admin"],
    },
  },
} as const
