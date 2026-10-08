/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

/** Todas as regras do Comercial vivem no banco (AGENTS.md, regra 3): o front só chama RPCs `cm_*`. */
export async function cm<T = any>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await (supabase as any).rpc(fn, args ?? {});
  if (error) throw new Error(error.message);
  return data as T;
}
