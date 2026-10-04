import { Helmet } from "react-helmet-async";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Calculator, Home, Plus, Receipt, Scale } from "lucide-react";
import "@/styles/sigma.css";
import "@/styles/intranet.css";
import { IntranetTop, type NavItem } from "@/components/intranet/IntranetTop";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/use-media-query";

const B = "/intranet/metas";
export const CLOSER_NAV: NavItem[] = [
  { to: B, label: "Início", end: true }, { to: `${B}/registrar`, label: "Registrar" }, { to: `${B}/vendas`, label: "Vendas" },
  { to: `${B}/simulador`, label: "Simulador" }, { to: `${B}/foco`, label: "Foco" }, { to: `${B}/comparar`, label: "Comparar" },
  { to: `${B}/produtos`, label: "Produtos" }, { to: `${B}/nota`, label: "Nota" }, { to: `${B}/perfil`, label: "Perfil" },
];
export const MANAGER_NAV: NavItem[] = [
  { to: B, label: "Painel", end: true }, { to: `${B}/validacao`, label: "Vendas" }, { to: `${B}/pessoas`, label: "Pessoas" },
  { to: `${B}/metas`, label: "Metas" }, { to: `${B}/cadastros`, label: "Cadastros" }, { to: `${B}/fechamento`, label: "Fechamento" },
  { to: `${B}/log`, label: "Log" }, { to: `${B}/perfil`, label: "Perfil" },
];
const TABS = [
  { to: B, label: "Início", I: Home, end: true }, { to: `${B}/registrar`, label: "Registrar", I: Plus }, { to: `${B}/vendas`, label: "Vendas", I: Receipt },
  { to: `${B}/simulador`, label: "Simular", I: Calculator }, { to: `${B}/comparar`, label: "Comparar", I: Scale },
];

/** Moldura da área Metas e Vendas: closer = mobile-first (tab bar); gestor/admin = desktop (menu no topo). */
const MetasLayout = () => {
  const { isManager } = useAuth();
  const mobile = useMediaQuery("(max-width: 767px)");
  const loc = useLocation();
  return (
    <div className="sg ix">
      <Helmet><title>Metas e Vendas — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <IntranetTop nav={mobile && !isManager ? undefined : isManager ? MANAGER_NAV : CLOSER_NAV} back={{ to: "/intranet/areas", label: "Áreas" }} />
      <main className={`ix-wrap ${mobile && !isManager ? "ix-sticky-pad" : ""}`} style={{ paddingBottom: 64 }} key={loc.pathname.split("/").slice(0, 4).join("/")}>
        <Outlet />
      </main>
      {mobile && !isManager && (
        <nav className="ix-tabbar" aria-label="Navegação">
          {TABS.map(({ to, label, I, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "on" : "")}><I size={20} />{label}</NavLink>)}
        </nav>
      )}
      {mobile && !isManager && <Link to={`${B}/perfil`} aria-label="Perfil" style={{ position: "fixed", left: -9999 }}>Perfil</Link>}
    </div>
  );
};
export default MetasLayout;
