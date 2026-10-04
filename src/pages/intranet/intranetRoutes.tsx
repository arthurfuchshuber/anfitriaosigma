import { lazy, Suspense, type ReactNode } from "react";
import { Route } from "react-router-dom";
import { RequireArea, RequireAuth, RequireComplete, RequireManager } from "@/components/intranet/Guards";
import { GateLoading } from "@/components/intranet/ui";

const L = (f: () => Promise<{ default: React.ComponentType }>) => lazy(f);
const Login = L(() => import("./IntranetLogin"));
const Areas = L(() => import("./IntranetAreas"));
const Cadastro = L(() => import("./Cadastro"));
const Layout = L(() => import("./metas/MetasLayout"));
const Home = L(() => import("./metas/MetasHome"));
const closer = {
  Registrar: L(() => import("./metas/closer/Registrar")), Vendas: L(() => import("./metas/closer/Vendas")),
  SaleDetail: L(() => import("./metas/closer/SaleDetail")), Simulador: L(() => import("./metas/closer/Simulador")),
  Foco: L(() => import("./metas/closer/Foco")), Comparar: L(() => import("./metas/closer/Comparar")),
  Produtos: L(() => import("./metas/closer/Produtos")), Perfil: L(() => import("./metas/closer/Perfil")), Nota: L(() => import("./metas/closer/Nota")),
};
const manager = {
  Validacao: L(() => import("./metas/manager/Validacao")), Pessoas: L(() => import("./metas/manager/Pessoas")),
  Pessoa: L(() => import("./metas/manager/Pessoa")), Cadastros: L(() => import("./metas/manager/Cadastros")),
  Metas: L(() => import("./metas/manager/Metas")), Fechamento: L(() => import("./metas/manager/Fechamento")),
  Log: L(() => import("./metas/manager/Log")), Vendedor: L(() => import("./metas/manager/Vendedor")),
};

const S = ({ children }: { children: ReactNode }) => <Suspense fallback={<GateLoading />}>{children}</Suspense>;
const M = ({ children }: { children: ReactNode }) => <RequireManager>{children}</RequireManager>;

/** Rotas da Intranet — inseridas em App.tsx acima do catch-all. */
export const intranetRoutes = (
  <>
    <Route path="/intranet" element={<S><Login /></S>} />
    <Route path="/intranet/cadastro" element={<S><RequireAuth><Cadastro /></RequireAuth></S>} />
    <Route path="/intranet/areas" element={<S><RequireAuth><RequireComplete><Areas /></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/metas" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Layout /></RequireArea></RequireComplete></RequireAuth></S>}>
      <Route index element={<S><Home /></S>} />
      <Route path="registrar" element={<S><closer.Registrar /></S>} />
      <Route path="vendas" element={<S><closer.Vendas /></S>} />
      <Route path="vendas/:id" element={<S><closer.SaleDetail /></S>} />
      <Route path="simulador" element={<S><closer.Simulador /></S>} />
      <Route path="foco" element={<S><closer.Foco /></S>} />
      <Route path="comparar" element={<S><closer.Comparar /></S>} />
      <Route path="produtos" element={<S><closer.Produtos /></S>} />
      <Route path="perfil" element={<S><closer.Perfil /></S>} />
      <Route path="nota" element={<S><closer.Nota /></S>} />
      <Route path="validacao" element={<S><M><manager.Validacao /></M></S>} />
      <Route path="pessoas" element={<S><M><manager.Pessoas /></M></S>} />
      <Route path="pessoas/:id" element={<S><M><manager.Pessoa /></M></S>} />
      <Route path="cadastros" element={<S><M><manager.Cadastros /></M></S>} />
      <Route path="metas" element={<S><M><manager.Metas /></M></S>} />
      <Route path="fechamento" element={<S><M><manager.Fechamento /></M></S>} />
      <Route path="log" element={<S><M><manager.Log /></M></S>} />
      <Route path="vendedor/:id" element={<S><M><manager.Vendedor /></M></S>} />
    </Route>
  </>
);
