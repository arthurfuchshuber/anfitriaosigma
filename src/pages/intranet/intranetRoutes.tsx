import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route } from "react-router-dom";
import { RequireArea, RequireAuth, RequireComplete, RequireManager } from "@/components/intranet/Guards";
import { GateLoading } from "@/components/intranet/ui";

const L = (f: () => Promise<{ default: React.ComponentType }>) => lazy(f);
const Login = L(() => import("./IntranetLogin"));
const Areas = L(() => import("./IntranetAreas"));
const Cadastro = L(() => import("./Cadastro"));
const Hub = L(() => import("../comercial/Hub"));
const Parametros = L(() => import("../comercial/Parametros"));
const Meses = L(() => import("../comercial/Meses"));
const Sugestao = L(() => import("../comercial/Sugestao"));
const Calculadora = L(() => import("../comercial/Calculadora"));
const Produtos = L(() => import("../comercial/Produtos"));
const ProdutoForm = L(() => import("../comercial/ProdutoForm"));
const Vendedores = L(() => import("../comercial/Vendedores"));
const Vendedor = L(() => import("../comercial/Vendedor"));
const Vendas = L(() => import("../comercial/Vendas"));
const RegistrarVenda = L(() => import("../comercial/RegistrarVenda"));
const Venda = L(() => import("../comercial/Venda"));
const CancelarVenda = L(() => import("../comercial/CancelarVenda"));
const Painel = L(() => import("../comercial/Painel"));

const S = ({ children }: { children: ReactNode }) => <Suspense fallback={<GateLoading />}>{children}</Suspense>;

/** Rotas da Intranet — inseridas em App.tsx acima do catch-all. */
export const intranetRoutes = (
  <>
    <Route path="/intranet" element={<S><Login /></S>} />
    <Route path="/intranet/cadastro" element={<S><RequireAuth><Cadastro /></RequireAuth></S>} />
    <Route path="/intranet/areas" element={<S><RequireAuth><RequireComplete><Areas /></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/metas" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Hub /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/parametros/:etapa" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Parametros /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/meses" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Meses /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/sugestao" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Sugestao /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/produtos" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Produtos /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/produtos/novo" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><ProdutoForm /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/produtos/:id" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><ProdutoForm /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendedores" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Vendedores /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendedores/novo" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Vendedor /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendedores/:id" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RequireManager><Vendedor /></RequireManager></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/calculadora" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Calculadora /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendas" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Vendas /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendas/nova" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><RegistrarVenda /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendas/:id" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Venda /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/vendas/:id/cancelar" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><CancelarVenda /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/painel" element={<S><RequireAuth><RequireComplete><RequireArea area="metas"><Painel /></RequireArea></RequireComplete></RequireAuth></S>} />
    <Route path="/intranet/metas/*" element={<Navigate to="/intranet/metas" replace />} />
  </>
);
