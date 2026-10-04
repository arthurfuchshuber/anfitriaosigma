import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, GraduationCap, Home, Target, Wallet } from "lucide-react";
import { toast } from "sonner";
import "@/styles/sigma.css";
import "@/styles/intranet.css";
import { IntranetTop } from "@/components/intranet/IntranetTop";
import { Banner, Btn, Chip, IconBox, Modal } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { AREAS, ROLE_LABEL, type AreaDef } from "@/lib/intranet/areas";
import { listAccessRequests, requestAccess } from "@/lib/intranet/api";
import { firstName } from "@/lib/intranet/format";
import { useMediaQuery } from "@/hooks/use-media-query";

const ICONS = { target: Target, home: Home, wallet: Wallet, grad: GraduationCap, briefcase: Briefcase };

const IntranetAreas = () => {
  const { profile, role, isManager, access, refresh } = useAuth();
  const go = useNavigate();
  const mobile = useMediaQuery("(max-width: 767px)");
  const [ask, setAsk] = useState<AreaDef | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingReq = useQuery({ queryKey: ["access-req-count"], enabled: isManager, queryFn: async () => (await listAccessRequests()).filter((r: { status: string }) => r.status === "pending").length });

  const submit = async () => {
    if (!ask) return;
    setBusy(true);
    try {
      await requestAccess(ask.id);
      await refresh();
      toast.success("Pedido enviado. O gestor foi avisado por e-mail.");
      setAsk(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível enviar o pedido."); }
    setBusy(false);
  };

  const open = (a: AreaDef) => {
    if (!a.active) return;
    if (isManager || access[a.id] === "approved") return go(a.path);
    if (access[a.id] === "pending") return toast.message("Seu pedido está aguardando aprovação do gestor.");
    setAsk(a);
  };

  const footer = (a: AreaDef) => {
    if (!a.active) return <Chip tone="muted">em breve</Chip>;
    const st = isManager ? "approved" : access[a.id];
    if (st === "approved") return <><Chip>{ROLE_LABEL[role]}</Chip><span style={{ marginLeft: "auto", width: 44, height: 44, borderRadius: "50%", background: "#431171", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={18} /></span></>;
    if (st === "pending") return <Chip tone="pending">Aguardando aprovação</Chip>;
    if (st === "denied") return <><Chip tone="error">Acesso negado</Chip><span className="ix-small" style={{ marginLeft: "auto", fontWeight: 600, color: "#431171" }}>Solicitar novamente</span></>;
    return <span className="ix-btn secondary sm" style={{ marginLeft: "auto" }}>Solicitar acesso</span>;
  };

  return (
    <div className="sg ix">
      <Helmet><title>Escolha sua área — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="ix-bg">
        <div className="ix-halo" style={{ width: 460, height: 460, background: "rgba(67,17,113,.16)", top: -180, right: -80 }} />
        <IntranetTop />
        <main className="ix-wrap" style={{ position: "relative", paddingBottom: 64 }}>
          <div style={{ margin: mobile ? "36px 0 24px" : "56px 0 36px" }}>
            <span className="ix-eyebrow">Intranet</span>
            <h1 className="ix-h1 hd" style={mobile ? { fontSize: 26 } : undefined}>
              Olá, {firstName(profile)}{mobile ? <>!<br />Escolha a sua área.</> : <>. <span className="gt">Escolha</span> sua área.</>}
            </h1>
            <p className="ix-sub">Você vê só as áreas liberadas para o seu acesso.</p>
          </div>

          {isManager && (pendingReq.data ?? 0) > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Banner action={<Link to="/intranet/metas/pessoas?tab=solicitacoes" className="ix-btn primary sm noarrow">Revisar</Link>}>
                {pendingReq.data} pedido(s) de acesso aguardando sua decisão.
              </Banner>
            </div>
          )}

          <div className="ix-grid c3" style={{ gap: mobile ? 14 : 22 }}>
            {AREAS.map((a) => {
              const I = ICONS[a.icon];
              return (
                <button key={a.id} type="button" className={`ix-area ${a.active ? "" : "off"}`} onClick={() => open(a)} aria-disabled={!a.active}>
                  <IconBox><I size={22} /></IconBox>
                  <h2 className="hd" style={{ fontWeight: 600, fontSize: 22, letterSpacing: "-.02em", margin: "6px 0 0" }}>{a.title}</h2>
                  <p className="ix-muted" style={{ margin: 0, fontSize: 15.5, flex: 1 }}>{a.desc}</p>
                  <div className="ix-row" style={{ marginTop: 6 }}>{footer(a)}</div>
                </button>
              );
            })}
          </div>
          <p className="ix-faint ix-small" style={{ textAlign: "center", marginTop: 32 }}>Precisa de outra área? Fale com o gestor.</p>
        </main>
      </div>

      <Modal open={!!ask} onClose={() => setAsk(null)} title="Solicitar acesso"
        footer={<><Btn kind="secondary" onClick={() => setAsk(null)}>Cancelar</Btn><Btn busy={busy} arrow onClick={submit}>Enviar pedido</Btn></>}>
        <p className="ix-muted" style={{ marginTop: 0 }}>
          Este é o seu primeiro acesso a <b style={{ color: "#120a1c" }}>{ask?.title}</b>. Vamos avisar o gestor por e-mail para aprovar ou negar. Assim que ele decidir, a área aparece liberada aqui.
        </p>
      </Modal>
    </div>
  );
};
export default IntranetAreas;
