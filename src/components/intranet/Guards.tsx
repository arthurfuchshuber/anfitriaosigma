import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMyPending } from "@/lib/intranet/api";
import { GateLoading } from "./ui";
import { PENDING_KEY } from "./useCadastroForm";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { loading, session } = useAuth();
  const loc = useLocation();
  if (loading) return <GateLoading />;
  if (!session) return <Navigate to="/intranet" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
};

/** Só entra quem teve o acesso aprovado para a área (gestor/admin sempre entram). */
export const RequireArea = ({ area, children }: { area: string; children: ReactNode }) => {
  const { access, isManager } = useAuth();
  if (!isManager && access[area] !== "approved") return <Navigate to="/intranet/areas" replace />;
  return <>{children}</>;
};

export const RequireManager = ({ children }: { children: ReactNode }) => {
  const { isManager } = useAuth();
  if (!isManager) return <Navigate to="/intranet/vendas" replace />;
  return <>{children}</>;
};

/** BLOQUEIO: enquanto houver campo obrigatório vazio (colaborador; empresa para gestor/admin), só a tela de Cadastro abre.
 *  A lista de pendências vem do banco (my_pending). Se a consulta falhar (ex.: migration ainda não aplicada), NÃO bloqueia. */
export const RequireComplete = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const loc = useLocation();
  const q = useQuery({ queryKey: [PENDING_KEY, profile?.id], queryFn: getMyPending, enabled: !!profile?.id, retry: false, refetchOnMount: "always" });
  if (!profile) return <>{children}</>;
  const has = (q.data?.user?.length ?? 0) > 0 || (q.data?.company?.length ?? 0) > 0;
  if (q.isLoading || (q.isFetching && has)) return <GateLoading />;
  if (has) return <Navigate to="/intranet/cadastro" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
};
