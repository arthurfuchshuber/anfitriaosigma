import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Calculator, Home, LayoutDashboard, LogOut, Menu, Plus, Receipt, Target, Users, X } from "lucide-react";
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
const TABS_CLOSER = [
  { to: B, label: "Início", I: Home, end: true }, { to: `${B}/registrar`, label: "Registrar", I: Plus }, { to: `${B}/vendas`, label: "Vendas", I: Receipt },
  { to: `${B}/simulador`, label: "Simular", I: Calculator },
];
const TABS_MANAGER = [
  { to: B, label: "Painel", I: LayoutDashboard, end: true }, { to: `${B}/validacao`, label: "Vendas", I: Receipt }, { to: `${B}/pessoas`, label: "Pessoas", I: Users },
  { to: `${B}/metas`, label: "Metas", I: Target },
];

/** Moldura da área Comercial (id interno "metas"): closer = mobile-first (tab bar); gestor/admin = desktop (menu no topo). */
/** Celular: barra inferior flutuante (4 atalhos + Menu ☰) e folha com todos os itens, "Áreas" e "Sair". */
const MobileNav = ({ tabs, items }: { tabs: typeof TABS_CLOSER; items: NavItem[] }) => {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const go = useNavigate();
  return (
    <>
      <nav className="ix-tabbar" aria-label="Navegação">
        {tabs.map(({ to, label, I, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "on" : "")}><I size={20} />{label}</NavLink>)}
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}><Menu size={20} />Menu</button>
      </nav>
      {open && (
        <div className="ix-sheet-bg" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="ix-sheet">
            <div className="ix-row ix-between" style={{ marginBottom: 6 }}>
              <b className="hd" style={{ fontSize: 18 }}>Menu</b>
              <button type="button" className="ix-sheet-x" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18} /></button>
            </div>
            <div className="ix-sheet-list">
              {items.map((n) => <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? "on" : "")}>{n.label}</NavLink>)}
            </div>
            <div className="ix-sheet-foot">
              <Link to="/intranet/areas" onClick={() => setOpen(false)}>Áreas</Link>
              <button type="button" onClick={async () => { await signOut(); go("/intranet"); }}><LogOut size={15} />Sair</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MetasLayout = () => {
  const { isManager } = useAuth();
  const mobile = useMediaQuery("(max-width: 767px)");
  const loc = useLocation();
  return (
    <div className="sg ix">
      <Helmet><title>Comercial — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      {mobile
        ? <IntranetTop compact="Comercial" />
        : <IntranetTop nav={isManager ? MANAGER_NAV : CLOSER_NAV} back={{ to: "/intranet/areas", label: "Áreas" }} />}
      <main className={`ix-wrap ${mobile ? "ix-sticky-pad" : ""}`} style={{ paddingBottom: 64 }} key={loc.pathname.split("/").slice(0, 4).join("/")}>
        <Outlet />
      </main>
      {mobile && <MobileNav tabs={isManager ? TABS_MANAGER : TABS_CLOSER} items={isManager ? MANAGER_NAV : CLOSER_NAV} />}
    </div>
  );
};
export default MetasLayout;
