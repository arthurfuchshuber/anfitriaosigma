import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route } from "react-router-dom";
import { RequireArea, RequireAuth, RequireComplete } from "@/components/intranet/Guards";
import { GateLoading } from "@/components/intranet/ui";

const L = (f: () => Promise<{ default: React.ComponentType }>) => lazy(f);
const Login = L(() => import("./IntranetLogin"));
const Areas = L(() => import("./IntranetAreas"));
const Cadastro = L(() => import("./Cadastro"));
const Comercial = L(() => import("./ComercialEmConstrucao"));

const S = ({ children }: { children: ReactNode }) => <Suspense fallback={<GateLoading />}>{children}</Suspense>;

/** Rotas da Intranet — inseridas em App.tsx acima do catch-all. */
export const intranetRoutes = (
  <>
    <Route path="/intranet" element={<S><Login /></S>} />
    <Route path="/intranet/cadastro" element={<S><RequireAuth><Cadastro /></RequireAuth></S>} />
    <Route path="/intranet/areas" element={<S><RequireAuth><RequireComplete><Areas /></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/metas" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Comercial /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/metas/*" element={<Navigate to="/intranet/metas" replace />} />
  </>
);
