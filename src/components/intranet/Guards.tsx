import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "./ui";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { loading, session } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="ix-wrap" style={{ paddingTop: 120 }}><Loading /></div>;
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
  if (!isManager) return <Navigate to="/intranet/metas" replace />;
  return <>{children}</>;
};
