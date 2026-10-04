import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { SigmaLogo } from "@/components/sigma/SigmaLogo";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/lib/intranet/areas";
import { firstName } from "@/lib/intranet/format";
import { Avatar } from "./ui";

export interface NavItem { to: string; label: string; end?: boolean }

export const IntranetTop = ({ nav, back }: { nav?: NavItem[]; back?: { to: string; label: string } }) => {
  const { profile, role, signOut } = useAuth();
  const go = useNavigate();
  const name = profile?.full_name || profile?.email || "";
  return (
    <header className="ix-top">
      <Link to="/intranet/areas" className="ix-row" style={{ gap: 11 }}>
        <SigmaLogo size={36} />
        <span className="hd hide-m" style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.02em" }}>Anfitrião Sigma</span>
        <span className="ix-chip muted" style={{ marginLeft: 4 }}>Intranet</span>
      </Link>
      {nav && <nav className="ix-nav" aria-label="Menu" style={{ flex: 1, justifyContent: "center" }}>{nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "on" : "")}>{n.label}</NavLink>)}</nav>}
      <div className="ix-row" style={{ gap: 10 }}>
        {back && <Link to={back.to} className="ix-btn ghost sm" style={{ gap: 6 }}><ArrowLeft size={15} />{back.label}</Link>}
        {profile && (
          <>
            <div style={{ textAlign: "right", lineHeight: 1.2 }} className="hide-m">
              <div style={{ fontWeight: 600, fontSize: 14 }}>{firstName(profile)}</div>
              <div className="ix-faint" style={{ fontSize: 12 }}>{ROLE_LABEL[role]}</div>
            </div>
            <Link to="/intranet/metas/perfil" aria-label="Meu perfil"><Avatar name={name} src={profile.avatar_url} /></Link>
          </>
        )}
        <button type="button" aria-label="Sair" className="ix-btn secondary sm" onClick={async () => { await signOut(); go("/intranet"); }}><LogOut size={14} /><span className="hide-m">Sair</span></button>
      </div>
    </header>
  );
};
