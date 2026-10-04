import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import "@/styles/sigma.css";
import "@/styles/intranet.css";
import { SigmaLogo } from "@/components/sigma/SigmaLogo";
import { Banner } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { COMPANY_DOMAIN, supabaseConfigured } from "@/integrations/supabase/client";
import { useMediaQuery } from "@/hooks/use-media-query";

const Google = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.8-6.1z" />
    <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.8 2.3-7.7 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const IntranetLogin = () => {
  const { session, loading, signIn, domainError } = useAuth();
  const mobile = useMediaQuery("(max-width: 767px)");
  if (!loading && session) return <Navigate to="/intranet/areas" replace />;

  return (
    <div className="sg ix">
      <Helmet><title>Intranet — Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="ix-bg" style={{ display: "flex", flexDirection: "column" }}>
        <div className="ix-halo" style={{ width: 520, height: 520, background: "rgba(67,17,113,.22)", top: -160, left: "50%", marginLeft: -260 }} />
        <div className="ix-halo" style={{ width: 340, height: 340, background: "rgba(215,0,166,.10)", bottom: -90, right: -60 }} />
        <div className="ix-halo" style={{ width: 380, height: 380, background: "rgba(67,17,113,.12)", bottom: 40, left: -120 }} />

        <header className="ix-top" style={{ position: "relative", top: mobile ? 12 : 18 }}>
          <Link to="/" className="ix-row" style={{ gap: 11 }}>
            <SigmaLogo size={36} /><span className="hd" style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-.02em" }}>Anfitrião Sigma</span>
          </Link>
          <Link to="/" className="ix-btn secondary sm"><ArrowLeft size={14} />Voltar ao site</Link>
        </header>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
          <div style={{ width: "min(480px,100%)", background: "#fff", border: "1px solid #e7e2ee", borderRadius: 32, padding: mobile ? "36px 24px" : "48px 44px", boxShadow: "0 40px 90px -40px rgba(67,17,113,.35)" }}>
            <SigmaLogo size={52} radius={16} />
            <div className="ix-eyebrow" style={{ marginTop: 28 }}>Intranet</div>
            <h1 className="ix-h1 hd" style={{ fontSize: mobile ? 30 : 36 }}>Acesse sua <span className="gt">conta</span></h1>
            <p className="ix-sub" style={{ fontSize: 16 }}>
              {mobile ? `Entre com o e-mail Google vinculado ao domínio do grupo Anfitrião Sigma.` : "Entre com o e-mail Google da Anfitrião Sigma."}
            </p>

            {domainError && <div style={{ marginTop: 20 }}><Banner error>{domainError}</Banner></div>}
            {!supabaseConfigured && <div style={{ marginTop: 20 }}><Banner error>Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (veja INTRANET-SETUP.md).</Banner></div>}

            <button type="button" onClick={signIn} disabled={!supabaseConfigured} className="ix-btn secondary block" style={{ marginTop: 26, minHeight: 56, gap: 12 }}>
              <Google />Continuar com Google
            </button>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
              <span className="ix-chip"><Lock size={13} />Acesso restrito a @{COMPANY_DOMAIN}</span>
            </div>
            <p className="ix-faint ix-small" style={{ textAlign: "center", marginTop: 22 }}>Precisa de acesso? Fale com o gestor.</p>
          </div>
        </main>
        <footer className="ix-faint ix-small" style={{ textAlign: "center", padding: "0 20px 26px", position: "relative" }}>© Anfitrião Sigma · Área restrita</footer>
      </div>
    </div>
  );
};
export default IntranetLogin;
