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
        Relationships: [
          {
            foreignKeyName: "area_access_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      cm_adjustments: {
        Row: {
          bonus_antes: number | null
          bonus_depois: number | null
          decided_at: string
          decided_by: string | null
          decision: string
          id: string
          month: string
          motivo: string | null
          pontos_antes: number | null
          pontos_depois: number | null
          review_pending: boolean
          sale_id: string
          seller_id: string
        }
        Insert: {
          bonus_antes?: number | null
          bonus_depois?: number | null
          decided_at?: string
          decided_by?: string | null
          decision: string
          id?: string
          month: string
          motivo?: string | null
          pontos_antes?: number | null
          pontos_depois?: number | null
          review_pending?: boolean
          sale_id: string
          seller_id: string
        }
        Update: {
          bonus_antes?: number | null
          bonus_depois?: number | null
          decided_at?: string
          decided_by?: string | null
          decision?: string
          id?: string
          month?: string
          motivo?: string | null
          pontos_antes?: number | null
          pontos_depois?: number | null
          review_pending?: boolean
          sale_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_adjustments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "cm_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_adjustments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "cm_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_cobrancas: {
        Row: {
          bruto: number
          id: string
          kind: string
          liquido: number | null
          product_id: string
        }
        Insert: {
          bruto: number
          id?: string
          kind: string
          liquido?: number | null
          product_id: string
        }
        Update: {
          bruto?: number
          id?: string
          kind?: string
          liquido?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_cobrancas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cm_products"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_drafts: {
        Row: {
          month: string
          rules: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          month: string
          rules: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          month?: string
          rules?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cm_empresas: {
        Row: {
          id: string
          linha: string
          name: string
          peso: number
          sort: number
        }
        Insert: {
          id?: string
          linha: string
          name: string
          peso?: number
          sort?: number
        }
        Update: {
          id?: string
          linha?: string
          name?: string
          peso?: number
          sort?: number
        }
        Relationships: []
      }
      cm_freezes: {
        Row: {
          frozen_at: string
          month: string
          rows: Json
        }
        Insert: {
          frozen_at?: string
          month: string
          rows: Json
        }
        Update: {
          frozen_at?: string
          month?: string
          rows?: Json
        }
        Relationships: []
      }
      cm_months: {
        Row: {
          month: string
          published_at: string
          published_by: string | null
          rules: Json
          unlocked: boolean
        }
        Insert: {
          month: string
          published_at?: string
          published_by?: string | null
          rules: Json
          unlocked?: boolean
        }
        Update: {
          month?: string
          published_at?: string
          published_by?: string | null
          rules?: Json
          unlocked?: boolean
        }
        Relationships: []
      }
      cm_product_formas: {
        Row: {
          forma: string
          max_parcelas: number
          parcela: boolean
          product_id: string
          taxa: number
        }
        Insert: {
          forma: string
          max_parcelas?: number
          parcela?: boolean
          product_id: string
          taxa?: number
        }
        Update: {
          forma?: string
          max_parcelas?: number
          parcela?: boolean
          product_id?: string
          taxa?: number
        }
        Relationships: [
          {
            foreignKeyName: "cm_product_formas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cm_products"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_products: {
        Row: {
          active: boolean
          created_at: string
          empresa_id: string
          fidelidade: boolean
          gera_caixa: boolean
          id: string
          name: string
          periodo_min: number
          sort: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          empresa_id: string
          fidelidade?: boolean
          gera_caixa?: boolean
          id?: string
          name: string
          periodo_min?: number
          sort?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          empresa_id?: string
          fidelidade?: boolean
          gera_caixa?: boolean
          id?: string
          name?: string
          periodo_min?: number
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "cm_products_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "cm_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_sale_payments: {
        Row: {
          bruto: number
          first_date: string
          forma: string
          id: string
          liquido: number
          paid_at: string | null
          parcelas: number
          sale_id: string
          sort: number
        }
        Insert: {
          bruto: number
          first_date: string
          forma: string
          id?: string
          liquido: number
          paid_at?: string | null
          parcelas?: number
          sale_id: string
          sort?: number
        }
        Update: {
          bruto?: number
          first_date?: string
          forma?: string
          id?: string
          liquido?: number
          paid_at?: string | null
          parcelas?: number
          sale_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "cm_sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "cm_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_sales: {
        Row: {
          cancel_reason: string | null
          cancelavel_ate: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cliente: string
          cobranca_id: string
          comprovante: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          first_payment_at: string | null
          id: string
          month: string
          prazo_dias: number | null
          product_id: string
          registered_at: string
          seller_id: string
          status: string
          validada_em: string | null
        }
        Insert: {
          cancel_reason?: string | null
          cancelavel_ate?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cliente: string
          cobranca_id: string
          comprovante?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          first_payment_at?: string | null
          id?: string
          month: string
          prazo_dias?: number | null
          product_id: string
          registered_at?: string
          seller_id: string
          status?: string
          validada_em?: string | null
        }
        Update: {
          cancel_reason?: string | null
          cancelavel_ate?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cliente?: string
          cobranca_id?: string
          comprovante?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          first_payment_at?: string | null
          id?: string
          month?: string
          prazo_dias?: number | null
          product_id?: string
          registered_at?: string
          seller_id?: string
          status?: string
          validada_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_sales_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cm_cobrancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cm_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "cm_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_seller_log: {
        Row: {
          at: string
          by_user: string | null
          field: string
          id: number
          new_value: string | null
          old_value: string | null
          seller_id: string
        }
        Insert: {
          at?: string
          by_user?: string | null
          field: string
          id?: never
          new_value?: string | null
          old_value?: string | null
          seller_id: string
        }
        Update: {
          at?: string
          by_user?: string | null
          field?: string
          id?: never
          new_value?: string | null
          old_value?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_seller_log_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "cm_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_sellers: {
        Row: {
          active: boolean
          created_at: string
          effective_from: string
          end_date: string | null
          id: string
          name: string
          salary_override: number | null
          seniority_id: string
          start_date: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          effective_from: string
          end_date?: string | null
          id?: string
          name: string
          salary_override?: number | null
          seniority_id: string
          start_date: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          effective_from?: string
          end_date?: string | null
          id?: string
          name?: string
          salary_override?: number | null
          seniority_id?: string
          start_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_sellers_seniority_id_fkey"
            columns: ["seniority_id"]
            isOneToOne: false
            referencedRelation: "cm_seniorities"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_seniorities: {
        Row: {
          id: string
          name: string
          salary: number
          sort: number
          weight: number
        }
        Insert: {
          id?: string
          name: string
          salary: number
          sort?: number
          weight: number
        }
        Update: {
          id?: string
          name?: string
          salary?: number
          sort?: number
          weight?: number
        }
        Relationships: []
      }
      cm_unlock_requests: {
        Row: {
          decided_at: string | null
          decided_by: string | null
          id: string
          month: string
          requested_at: string
          requested_by: string
          status: string
        }
        Insert: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          month: string
          requested_at?: string
          requested_by: string
          status?: string
        }
        Update: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          month?: string
          requested_at?: string
          requested_by?: string
          status?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          account: string | null
          addr: Json
          address: string | null
          agency: string | null
          bank: string | null
          cnpj: string | null
          cnpj_checked_at: string | null
          cnpj_status: string | null
          email: string | null
          id: number
          legal_name: string | null
          municipal_reg: string | null
          nf_notes: string | null
          phone: string | null
          rep_birth: string | null
          rep_cpf: string | null
          rep_name: string | null
          rep_phone: string | null
          tax_regime: string | null
          trade_name: string | null
        }
        Insert: {
          account?: string | null
          addr?: Json
          address?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cnpj_checked_at?: string | null
          cnpj_status?: string | null
          email?: string | null
          id?: number
          legal_name?: string | null
          municipal_reg?: string | null
          nf_notes?: string | null
          phone?: string | null
          rep_birth?: string | null
          rep_cpf?: string | null
          rep_name?: string | null
          rep_phone?: string | null
          tax_regime?: string | null
          trade_name?: string | null
        }
        Update: {
          account?: string | null
          addr?: Json
          address?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cnpj_checked_at?: string | null
          cnpj_status?: string | null
          email?: string | null
          id?: number
          legal_name?: string | null
          municipal_reg?: string | null
          nf_notes?: string | null
          phone?: string | null
          rep_birth?: string | null
          rep_cpf?: string | null
          rep_name?: string | null
          rep_phone?: string | null
          tax_regime?: string | null
          trade_name?: string | null
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
          cnpj_checked_at: string | null
          cnpj_status: string | null
          company_name: string | null
          cpf: string | null
          doc_type: string | null
          municipal_reg: string | null
          pix_key: string | null
          pix_type: string | null
          rg: string | null
          trade_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cnpj_checked_at?: string | null
          cnpj_status?: string | null
          company_name?: string | null
          cpf?: string | null
          doc_type?: string | null
          municipal_reg?: string | null
          pix_key?: string | null
          pix_type?: string | null
          rg?: string | null
          trade_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          cnpj?: string | null
          cnpj_checked_at?: string | null
          cnpj_status?: string | null
          company_name?: string | null
          cpf?: string | null
          doc_type?: string | null
          municipal_reg?: string | null
          pix_key?: string | null
          pix_type?: string | null
          rg?: string | null
          trade_name?: string | null
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
          emergency_address: Json
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relation: string | null
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
          emergency_address?: Json
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relation?: string | null
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
          emergency_address?: Json
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relation?: string | null
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
      required_fields: {
        Row: {
          doc_type: string | null
          grp: string
          key: string
          label: string
          required: boolean
          scope: string
          since: string
          sort: number
        }
        Insert: {
          doc_type?: string | null
          grp: string
          key: string
          label: string
          required?: boolean
          scope: string
          since?: string
          sort?: number
        }
        Update: {
          doc_type?: string | null
          grp?: string
          key?: string
          label?: string
          required?: boolean
          scope?: string
          since?: string
          sort?: number
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "sales_seller_id_profiles_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      cm_apply_sugestao: {
        Args: { p_month: string; p_scenario: string }
        Returns: undefined
      }
      cm_assert_manager: { Args: never; Returns: undefined }
      cm_assert_sale_access: { Args: { p_seller: string }; Returns: undefined }
      cm_calc: { Args: { p_month?: string; p_seller?: string }; Returns: Json }
      cm_calc_sim: {
        Args: { p_month?: string; p_qtds?: Json; p_seller?: string }
        Returns: Json
      }
      cm_calendar: { Args: { m: string }; Returns: Json }
      cm_cancel_preview: { Args: { p_sale: string }; Returns: Json }
      cm_cancel_sale: {
        Args: { p_decision?: string; p_motivo?: string; p_sale: string }
        Returns: undefined
      }
      cm_cob_label: {
        Args: { gera_caixa: boolean; kind: string }
        Returns: string
      }
      cm_cobranca_liquido: {
        Args: { p_cob: string; p_valores?: Json }
        Returns: number
      }
      cm_confirm_payment: {
        Args: { p_date?: string; p_payment?: string; p_sale: string }
        Returns: undefined
      }
      cm_decide_unlock: {
        Args: { p_approve: boolean; p_month: string }
        Returns: undefined
      }
      cm_distribution: { Args: { m: string; p_rules?: Json }; Returns: Json }
      cm_draft_save: {
        Args: { p_months: string[]; p_rules: Json }
        Returns: undefined
      }
      cm_eff_start: {
        Args: { s: Database["public"]["Tables"]["cm_sellers"]["Row"] }
        Returns: string
      }
      cm_fator: {
        Args: { att: number; gat: number; rules: Json }
        Returns: number
      }
      cm_forma_label: {
        Args: { f: string; parcelado: boolean }
        Returns: string
      }
      cm_freeze_at: { Args: { m: string }; Returns: string }
      cm_gatilho: {
        Args: {
          m: string
          rules: Json
          s: Database["public"]["Tables"]["cm_sellers"]["Row"]
        }
        Returns: number
      }
      cm_house_label: { Args: { n: number }; Returns: string }
      cm_house_month: {
        Args: {
          m: string
          s: Database["public"]["Tables"]["cm_sellers"]["Row"]
        }
        Returns: number
      }
      cm_hub: { Args: never; Returns: Json }
      cm_lock_day: { Args: { m: string }; Returns: string }
      cm_locked: { Args: { m: string }; Returns: boolean }
      cm_me: { Args: never; Returns: Json }
      cm_month_status: { Args: { m: string }; Returns: string }
      cm_months_list: { Args: never; Returns: Json }
      cm_my_seller: { Args: never; Returns: string }
      cm_now: { Args: never; Returns: string }
      cm_pay_taxa: {
        Args: { p_forma: string; p_product: string }
        Returns: number
      }
      cm_payment_points: { Args: { p_pay: string }; Returns: Json }
      cm_preview: { Args: { p_month: string; p_rules: Json }; Returns: Json }
      cm_product_get: { Args: { p_id: string }; Returns: Json }
      cm_product_preview: { Args: { p: Json }; Returns: Json }
      cm_product_save: { Args: { p: Json }; Returns: string }
      cm_products_list: { Args: never; Returns: Json }
      cm_products_options: { Args: never; Returns: Json }
      cm_projecao: {
        Args: { p_months: string[]; p_rules?: Json }
        Returns: Json
      }
      cm_publish: { Args: { p_months: string[] }; Returns: undefined }
      cm_ref_taxa: { Args: { p_product: string }; Returns: number }
      cm_refresh_sale: { Args: { p_sale: string }; Returns: undefined }
      cm_register_sale: { Args: { p: Json }; Returns: string }
      cm_request_unlock: { Args: { p_month: string }; Returns: undefined }
      cm_role: { Args: never; Returns: string }
      cm_rules: { Args: { m: string }; Returns: Json }
      cm_rules_get: { Args: { p_months: string[] }; Returns: Json }
      cm_run_daily: { Args: never; Returns: undefined }
      cm_sale_get: { Args: { p_sale: string }; Returns: Json }
      cm_sale_points: { Args: { p_sale: string }; Returns: Json }
      cm_sale_preview: { Args: { p: Json }; Returns: Json }
      cm_sales_list: {
        Args: { p_month?: string; p_seller?: string; p_todos?: boolean }
        Returns: Json
      }
      cm_save_payments: {
        Args: {
          p_data: string
          p_formas: Json
          p_pago: boolean
          p_product: string
          p_sale: string
        }
        Returns: undefined
      }
      cm_seed_rules: { Args: never; Returns: Json }
      cm_seller_get: { Args: { p_id: string }; Returns: Json }
      cm_seller_history: { Args: { p_id: string }; Returns: Json }
      cm_seller_in_month: {
        Args: {
          m: string
          s: Database["public"]["Tables"]["cm_sellers"]["Row"]
        }
        Returns: boolean
      }
      cm_seller_month: { Args: { m: string; p_seller: string }; Returns: Json }
      cm_seller_salary: {
        Args: {
          rules: Json
          s: Database["public"]["Tables"]["cm_sellers"]["Row"]
        }
        Returns: number
      }
      cm_seller_save: { Args: { p: Json }; Returns: string }
      cm_seller_weight: {
        Args: {
          rules: Json
          s: Database["public"]["Tables"]["cm_sellers"]["Row"]
        }
        Returns: number
      }
      cm_sellers_list: { Args: { p_active?: boolean }; Returns: Json }
      cm_sugestao: { Args: { p_month?: string }; Returns: Json }
      cm_sugestao_pct: { Args: { m: string }; Returns: Json }
      cm_team_confirmed: { Args: { m: string }; Returns: number }
      cm_today: { Args: never; Returns: string }
      cm_update_sale: { Args: { p: Json; p_sale: string }; Returns: undefined }
      cm_validate_rules: { Args: { r: Json }; Returns: undefined }
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
      field_value: { Args: { p_key: string; p_user: string }; Returns: string }
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
      missing_company_fields: { Args: never; Returns: string[] }
      missing_user_fields: { Args: { p_user?: string }; Returns: string[] }
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
      my_pending: { Args: never; Returns: Json }
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
      pending_people: {
        Args: never
        Returns: {
          email: string
          full_name: string
          missing: number
          total: number
          user_id: string
        }[]
      }
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
      remind_pending: { Args: { p_user: string }; Returns: number }
      request_access: { Args: { p_area: string }; Returns: string }
      required_field_stats: {
        Args: never
        Returns: {
          doc_type: string
          filled_pct: number
          grp: string
          key: string
          label: string
          required: boolean
          scope: string
          since: string
          sort: number
        }[]
      }
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
          cnpj_status: string
          company_name: string
          cpf: string
          doc_type: string
          filled: boolean
          municipal_reg: string
          pix_key: string
          pix_type: string
          rg: string
          trade_name: string
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
      set_required_field: {
        Args: { p_key: string; p_required: boolean }
        Returns: undefined
      }
      set_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      sync_company_from_manager: {
        Args: { p_user: string }
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
      user_doc_type: { Args: { p_user: string }; Returns: string }
      valid_cnpj: { Args: { v: string }; Returns: boolean }
      valid_cpf: { Args: { v: string }; Returns: boolean }
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
