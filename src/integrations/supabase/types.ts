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
      actor_name: { Args: never; Returns: string }
      attach_invoice: {
        Args: { p_month: string; p_path: string }
        Returns: undefined
      }
      business_days: { Args: { a: string; b: string }; Returns: number }
      cancel_sale: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      check_duplicate: {
        Args: { p_date: string; p_doc: string; p_total: number }
        Returns: string
      }
      close_month: { Args: { p_month: string }; Returns: undefined }
      compute_month: {
        Args: { m: string }
        Returns: {
          attainment: number
          bonus: number
          caixa: number
          full_name: string
          goal: number
          multiplier: number
          nickname: string
          pending: number
          ramp: number
          salary: number
          total_pay: number
          user_id: string
          validated: number
        }[]
      }
      confirm_goal_lock: { Args: { p_month: string }; Returns: undefined }
      decide_access: {
        Args: {
          p_approve: boolean
          p_area: string
          p_note?: string
          p_user: string
        }
        Returns: undefined
      }
      decide_floor: {
        Args: { p_approve: boolean; p_id: string }
        Returns: undefined
      }
      digits: { Args: { v: string }; Returns: string }
      effective_month: { Args: { p_when: string }; Returns: string }
      generate_invoice: {
        Args: { p_month: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_area: { Args: { a: string }; Returns: boolean }
      individual_goal: { Args: { m: string; uid: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_ramped: { Args: { m: string; uid: string }; Returns: boolean }
      item_caixa_pct: { Args: { d: string; pid: string }; Returns: number }
      item_weight: { Args: { d: string; pid: string }; Returns: number }
      log_event: {
        Args: {
          p_action: string
          p_detail?: string
          p_device?: string
          p_location?: string
        }
        Returns: undefined
      }
      mask_text: { Args: { keep?: number; v: string }; Returns: string }
      meta_scale: { Args: { m: string; uid: string }; Returns: number }
      month_end: { Args: { d: string }; Returns: string }
      month_start: { Args: { d: string }; Returns: string }
      month_summary: {
        Args: { p_month: string }
        Returns: {
          attainment: number
          bonus: number
          caixa: number
          full_name: string
          goal: number
          multiplier: number
          nickname: string
          pending: number
          ramp: number
          salary: number
          total_pay: number
          user_id: string
          validated: number
        }[]
      }
      notify: {
        Args: {
          p_body: string
          p_kind: string
          p_ref?: string
          p_title: string
          p_user: string
        }
        Returns: undefined
      }
      param: { Args: { d?: string; k: string }; Returns: number }
      ramp_factor: { Args: { m: string; uid: string }; Returns: number }
      register_sale: {
        Args: {
          p_client: string
          p_date: string
          p_doc: string
          p_installments: number
          p_items: Json
          p_notes: string
          p_pay: string
          p_recurring: boolean
        }
        Returns: Json
      }
      request_access: { Args: { p_area: string }; Returns: string }
      run_validation: { Args: never; Returns: number }
      salary_at: { Args: { m: string; uid: string }; Returns: number }
      seller_caixa: { Args: { m: string; uid: string }; Returns: number }
      seller_points: {
        Args: { cut?: string; m: string; status_filter?: string; uid: string }
        Returns: number
      }
      sensitive_masked: {
        Args: { p_user: string }
        Returns: {
          account: string
          agency: string
          bank: string
          cnpj: string
          cpf: string
          filled: boolean
          pix_key: string
          rg: string
        }[]
      }
      set_invoice_status: {
        Args: { p_month: string; p_status: string; p_user: string }
        Returns: undefined
      }
      set_item_qty: {
        Args: { p_item: string; p_qty: number }
        Returns: undefined
      }
      set_meta_scale: {
        Args: {
          p_reason: string
          p_scale: number
          p_user: string
          p_when: string
        }
        Returns: undefined
      }
      set_multiplier: {
        Args: { p_month: string; p_value: number }
        Returns: undefined
      }
      set_product_version: {
        Args: {
          p_caixa: number
          p_min: number
          p_points: number
          p_product: string
          p_when: string
        }
        Returns: undefined
      }
      set_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      team_average: {
        Args: { p_month: string }
        Returns: {
          avg_attainment: number
          n: number
        }[]
      }
      team_multiplier: { Args: { m: string }; Returns: number }
      update_my_profile: { Args: { p: Json }; Returns: undefined }
      write_log: {
        Args: {
          p_action: string
          p_detail: string
          p_device?: string
          p_entity: string
          p_entity_id: string
          p_location?: string
        }
        Returns: undefined
      }
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
