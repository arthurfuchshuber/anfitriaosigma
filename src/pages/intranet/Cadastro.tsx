import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Building2, Check, ChevronDown, Lock, MapPin, Phone, User, UserCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import "@/styles/sigma.css";
import "@/styles/intranet.css";
import { FieldGrid } from "@/components/intranet/CadastroFields";
import { IntranetTop } from "@/components/intranet/IntranetTop";
import { Banner, Btn, Card, ErrorBox, Loading } from "@/components/intranet/ui";
import { PENDING_KEY, useCadastroForm } from "@/components/intranet/useCadastroForm";
import { useAuth } from "@/contexts/AuthContext";
import { listNotices, resolveNotice } from "@/lib/intranet/api";
import { groupsOf, visibleFields, type GroupDef, type Scope } from "@/lib/intranet/cadastro";

const ICON = { id: User, phone: Phone, pin: MapPin, alert: AlertCircle, wallet: Wallet, building: Building2, user: UserCheck };
type Form = ReturnType<typeof useCadastroForm>;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Um item do acordeão: recolhido mostra "N pendentes"; aberto mostra os campos daquele item. */
const Item = ({ g, form, count, open, onToggle, onSave, saving, done }: {
  g: GroupDef; form: Form; count: number; open: boolean; onToggle: () => void; onSave: () => void; saving: boolean; done?: boolean;
}) => {
  const I = ICON[g.icon];
  const fields = visibleFields(g, form.doc);
  return (
    <div className={`ix-acc-item ${open ? "open" : ""}`}>
      <button type="button" className="ix-acc-h" aria-expanded={open} aria-controls={`acc-${g.scope}-${g.id}`} onClick={onToggle}>
        <span className="ix-icon">{done && !open ? <Check size={20} /> : <I size={20} />}</span>
        <span className="t">
          <b>{g.title}</b>
          {open || done ? <span className="s">{g.sub}</span> : <span className="ix-chip pending" style={{ marginTop: 6 }}>{plural(count, "pendente", "pendentes")}</span>}
        </span>
        <ChevronDown size={20} className="chev" />
      </button>
      {open && (
        <div className="ix-acc-b" id={`acc-${g.scope}-${g.id}`}>
          {g.scope === "user" && g.id === "ident" && (
            <div className="ix-seg2" role="group" aria-label="Como você emite a nota">
              <button type="button" className={form.doc === "pf" ? "on" : ""} aria-pressed={form.doc === "pf"} onClick={() => form.setDoc("pf")}>Pessoa física<span className="sfx"> · CPF</span></button>
              <button type="button" className={form.doc === "pj" ? "on" : ""} aria-pressed={form.doc === "pj"} onClick={() => form.setDoc("pj")}>Pessoa jurídica<span className="sfx"> · CNPJ</span></button>
            </div>
          )}
          <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <FieldGrid fields={fields} ctx={form.ctx} />
            <Btn type="submit" arrow mfull busy={saving} style={{ marginTop: 8 }}>Salvar e seguir</Btn>
          </form>
          {g.scope === "user" && ["ident", "pay"].includes(g.id) && <div className="ix-sens-note"><Lock size={14} />Dados sensíveis ficam protegidos; o gestor vê só mascarado.</div>}
        </div>
      )}
    </div>
  );
};

const Editor = ({ scope, form, onNext }: { scope: Scope; form: Form; onNext: (state: { user: string[]; company: string[] | null }, fromGroup: string) => void }) => {
  const groups = groupsOf(scope);
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const [showDone, setShowDone] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const countOf = (g: GroupDef) => form.missing.filter((k) => g.fields.some((f) => f.key === k)).length;
  const pending = groups.filter((g) => countOf(g) > 0);
  const done = groups.filter((g) => countOf(g) === 0);
  useEffect(() => { if (form.ready && open === undefined && form.pending) setOpen(pending[0]?.id ?? null); }, [form.ready, form.pending, open, pending]);

  const applicable = form.required.filter((r) => r.scope === scope && r.required && (!r.doc_type || r.doc_type === form.doc));
  const total = applicable.length || form.missing.length;
  const filled = Math.max(total - form.missing.length, 0);
  const pct = total ? Math.round((filled / total) * 100) : 100;

  const save = async (g: GroupDef) => {
    setSaving(g.id);
    try {
      const st = await form.save([g]);
      const rest = (scope === "user" ? st.user : st.company ?? []).filter((k) => g.fields.some((f) => f.key === k)).length;
      if (rest > 0) toast.message(`Salvo. Ainda ${rest === 1 ? "falta 1 campo" : `faltam ${rest} campos`} neste item.`);
      else { toast.success(`${g.title}: salvo`); onNext(st, g.id); }
      if (rest === 0) { const nx = groups.find((x) => x.id !== g.id && (scope === "user" ? st.user : st.company ?? []).some((k) => x.fields.some((f) => f.key === k))); setOpen(nx?.id ?? null); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar."); }
    setSaving(null);
  };

  if (form.error) return <ErrorBox error={form.error} />;
  if (!form.ready) return <Loading rows={4} />;
  return (
    <>
      <Card style={{ margin: "22px 0 18px" }}>
        <div className="ix-row ix-between"><b style={{ fontSize: 15 }}>{filled} de {total} concluídos</b><b className="ix-num" style={{ color: "#431171" }}>{pct}%</b></div>
        <div className="ix-prog" style={{ margin: 0 }}><div className="bar"><i style={{ width: `${pct}%` }} /></div></div>
      </Card>
      <div className="ix-acc">
        {pending.map((g) => <Item key={g.id} g={g} form={form} count={countOf(g)} open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} onSave={() => save(g)} saving={saving === g.id} />)}
        {done.length > 0 && (
          <div className="ix-acc-item ix-acc-done">
            <button type="button" className="ix-acc-h" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}>
              <span className="ix-icon" style={{ background: "#fff" }}><Check size={20} /></span>
              <span className="t"><b>Concluídos · {done.length} de {groups.length}</b></span>
              <ChevronDown size={20} className="chev" style={{ transform: showDone ? "rotate(180deg)" : undefined }} />
            </button>
            {showDone && (
              <div style={{ padding: "0 12px 12px", display: "grid", gap: 10 }}>
                {done.map((g) => <Item key={g.id} g={g} form={form} count={0} done open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} onSave={() => save(g)} saving={saving === g.id} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

/** Página única de cadastro pendente: itens recolhidos, um aberto por vez. Colaborador (e empresa, para gestor/admin). */
const Cadastro = () => {
  const { profile, isManager } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();
  const U = useCadastroForm("user");
  const C = useCadastroForm("company", isManager);
  const [tab, setTab] = useState<Scope | null>(null);
  const notices = useQuery({ queryKey: ["ix-my-notices"], queryFn: listNotices, retry: false });

  const uN = U.pending?.user?.length ?? 0, cN = U.pending?.company?.length ?? 0;
  const scope: Scope = tab ?? (uN > 0 || !isManager || cN === 0 ? "user" : "company");
  const form = scope === "user" ? U : C;
  const both = isManager && (uN > 0 && cN > 0);
  const remaining = scope === "user" ? uN : cN;
  const reminder = useMemo(() => (notices.data ?? []).find((n) => n.kind === "pending_fields"), [notices.data]);
  const from = (loc.state as { from?: string } | null)?.from;

  const onNext = (st: { user: string[]; company: string[] | null }) => {
    const u = st.user.length, c = st.company?.length ?? 0;
    qc.setQueryData([PENDING_KEY, profile?.id], (old: unknown) => ({ ...(old as object), ...st }));
    if (u === 0 && c === 0) {
      (notices.data ?? []).filter((n) => n.kind === "pending_fields").forEach((n) => resolveNotice(n.id).catch(() => undefined));
      toast.success("Cadastro completo. Bem-vindo(a)!");
      nav(from && from.startsWith("/intranet") && from !== "/intranet/cadastro" ? from : "/intranet/areas", { replace: true });
    } else if (scope === "user" && u === 0 && c > 0) { setTab("company"); toast.message("Agora complete os dados da empresa."); }
    else if (scope === "company" && c === 0 && u > 0) { setTab("user"); }
  };

  const title = scope === "user" ? <>Complete seu <span className="gt">cadastro</span></> : <>Dados da <span className="gt">empresa</span></>;
  return (
    <div className="sg ix">
      <Helmet><title>Cadastro pendente — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="ix-bg">
        <IntranetTop />
        <main className="ix-cad">
          <span className="ix-eyebrow">{scope === "user" ? "Cadastro" : "Cadastro da empresa"}</span>
          <h1 className="ix-h1 hd" style={{ fontSize: "clamp(28px, 5vw, 40px)" }}>{title}</h1>
          <p className="ix-sub" style={{ fontSize: 16 }}>
            {remaining > 0 ? <>Toque em cada item para preencher. {remaining === 1 ? "Falta 1 informação." : `Faltam ${remaining} informações.`}</> : "Tudo preenchido. Toque em um item se quiser revisar."}
          </p>
          {reminder && <div style={{ marginTop: 16 }}><Banner>{reminder.body ?? reminder.title}</Banner></div>}
          {both && (
            <div className="ix-cad-seg" role="tablist" aria-label="O que preencher">
              <button type="button" role="tab" aria-selected={scope === "user"} className={scope === "user" ? "on" : ""} onClick={() => setTab("user")}>Meus dados {uN > 0 && <span className="n">{uN}</span>}</button>
              <button type="button" role="tab" aria-selected={scope === "company"} className={scope === "company" ? "on" : ""} onClick={() => setTab("company")}>Empresa {cN > 0 && <span className="n">{cN}</span>}</button>
            </div>
          )}
          {U.pending === undefined && !U.error ? <div style={{ marginTop: 24 }}><Loading rows={4} /></div> : <Editor key={scope} scope={scope} form={form} onNext={onNext} />}
          {U.pending && uN === 0 && cN === 0 && <Btn arrow mfull style={{ marginTop: 20 }} onClick={() => nav("/intranet/areas")}>Continuar</Btn>}
        </main>
      </div>
    </div>
  );
};
export default Cadastro;
