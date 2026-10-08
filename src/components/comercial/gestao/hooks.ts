import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";

export type Me = { role: string; is_manager: boolean; is_admin: boolean; seller_id: string | null; name: string | null; today: string; sellers: { id: string; name: string }[] };
export const useMe = () => useQuery({ queryKey: ["cm", "me"], queryFn: () => cm<Me>("cm_me"), staleTime: 60_000 });

/** Valor com atraso (simulações que chamam o banco a cada toque). */
export const useDebounced = <T,>(v: T, ms = 250) => {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
};
