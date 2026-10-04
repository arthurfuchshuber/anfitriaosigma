export type Role = "closer" | "gestor" | "admin";
export type AccessStatus = "pending" | "approved" | "denied";

export interface Profile {
  id: string; email: string; full_name: string | null; nickname: string | null; avatar_url: string | null;
  phone: string | null; whatsapp: string | null; birth_date: string | null; personal_email: string | null;
  address: Record<string, string>; job_title: string | null; seniority: string | null; manager_id: string | null;
  regime: "clt" | "pj" | null; start_date: string | null; end_date: string | null; active: boolean;
  google_login: boolean; emergency_name: string | null; emergency_phone: string | null; notes: string | null;
}

export interface Product { id: string; name: string; recurring: boolean; active: boolean; sort: number }
export interface ProductVersion { id: string; product_id: string; valid_from: string; points: number; min_price: number; caixa_pct: number }

export interface Sale {
  id: string; seller_id: string; client_name: string; client_doc: string | null; sale_date: string;
  status: "pending" | "validated" | "cancelled"; pay_method: "boleto" | "cartao" | "pix" | "transferencia";
  installments: number; recurring: boolean; notes: string | null;
  floor_status: "ok" | "needs_approval" | "approved" | "rejected"; dup_flag: boolean; total_value: number;
  cancel_reason: string | null; created_at: string; sale_items?: SaleItem[]; profiles?: { full_name: string | null; nickname: string | null } | null;
}
export interface SaleItem { id: string; sale_id: string; product_id: string; qty: number; qty_override: number | null; value: number }

export interface MonthRow {
  user_id: string; full_name: string | null; nickname: string | null; salary: number; ramp: number; multiplier: number;
  goal: number; validated: number; pending: number; attainment: number; bonus: number; total_pay: number; caixa: number;
}

export interface Invoice {
  id: string; user_id: string; month: string; number: string | null; amount: number; fixo: number; bonus: number;
  status: "pendente" | "enviada" | "aprovada" | "paga"; file_path: string | null; generated_at: string;
}

export interface AuditRow {
  id: number; at: string; actor_id: string | null; actor_name: string | null; actor_role: string | null; action: string;
  entity: string | null; entity_id: string | null; detail: string | null; location: string | null; device: string | null;
}

export interface Notice { id: string; user_id: string | null; kind: string; title: string; body: string | null; ref: string | null; created_at: string; resolved_at: string | null }
