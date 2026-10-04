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
import { COMPANY_GROUPS, MIRRORED_COMPANY_KEYS, PULL_FROM_COMPANY, USER_GROUPS, titleFor, visibleFields, type DocType, type GroupDef } from "@/lib/intranet/cadastro";

const ICON = { id: User, phone: Phone, pin: MapPin, alert: AlertCircle, wallet: Wallet, building: Building2, user: UserCheck };
type Form = ReturnType<typeof useCadastroForm>;
interface Sec { g: GroupDef; form: Form; doc: DocType; title: string; sub: string; key: string }

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const ug = (id: string) => USER_GROUPS.find((g) => g.id === id)!;
const cg = (id: string) => COMPANY_GROUPS.find((g) => g.id === id)!;

/** Um item do acordeão: recolhido mostra "N pendentes"; aberto mostra os campos daquele item. */
const Item = ({ s, hide, count, open, onToggle, onSave, saving, done, pull }: {
  s: Sec; hide?: ReadonlySet<string>; count: number; open: boolean; onToggle: () => void; onSave: () => void; saving: boolean; done?: boolean;
  pull?: { on: boolean; toggle: () => void };
}) => {
  const { g, form } = s;
  const I = ICON[g.icon];
  const fields = visibleFields(g, s.doc, hide);
  return (
    <div className={`ix-acc-item ${open ? "open" : ""}`}>
      <button type="button" className="ix-acc-h" aria-expanded={open} aria-controls={`acc-${s.key}`} onClick={onToggle}>
        <span className="ix-icon">{done && !open ? <Check size={20} /> : <I size={20} />}</span>
        <span className="t">
          <b>{s.title}</b>
          {open || done ? <span className="s">{s.sub}</span> : <span className="ix-chip pending" style={{ marginTop: 6 }}>{plural(count, "pendente", "pendentes")}</span>}
        </span>
        <ChevronDown size={20} className="chev" />
      </button>
      {open && (
        <div className="ix-acc-b" id={`acc-${s.key}`}>
          {g.scope === "user" && g.id === "ident" && (
            <div className="ix-seg2" role="group" aria-label="Como você emite a nota">
              <button type="button" className={form.doc === "pf" ? "on" : ""} aria-pressed={form.doc === "pf"} onClick={() => form.setDoc("pf")}>Pessoa física<span className="sfx"> · CPF</span></button>
              <button type="button" className={form.doc === "pj" ? "on" : ""} aria-pressed={form.doc === "pj"} onClick={() => form.setDoc("pj")}>Pessoa jurídica<span className="sfx"> · CNPJ</span></button>
            </div>
          )}
          {pull && (
            <div className="ix-pull">
              <span className="t"><b>Usar os dados da empresa</b><span>{pull.on ? "Copiado da empresa — você pode ajustar." : "Puxa o que já foi preenchido na etapa da empresa."}</span></span>
              <button type="button" role="switch" aria-checked={pull.on} aria-label="Usar os dados da empresa" className={`ix-switch ${pull.on ? "on" : ""}`} onClick={pull.toggle} />
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

/** Página única de cadastro pendente: itens recolhidos, um aberto por vez, SEM abas.
 *  Colaborador vê só o dele; gestor/admin vê também a empresa — e, se for PJ, o banco espelha o que já foi dito (nada é perguntado duas vezes). */
const Cadastro = () => {
  const { profile, isManager } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();
  const U = useCadastroForm("user");
  const C = useCadastroForm("company", isManager);
  const notices = useQuery({ queryKey: ["ix-my-notices"], queryFn: listNotices, retry: false });
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const [showDone, setShowDone] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [pulled, setPulled] = useState<Record<string, boolean>>({});

  const pjMgr = isManager && U.doc === "pj";
  const hide = pjMgr ? MIRRORED_COMPANY_KEYS : undefined;

  const secs: Sec[] = useMemo(() => {
    const mk = (g: GroupDef, form: Form): Sec => {
      const doc: DocType = g.scope === "user" ? U.doc : "pf";
      let title = g.scope === "user" ? titleFor(g, U.doc) : g.title, sub = g.sub;
      if (isManager && g.scope === "company" && g.id === "endereco") title = "Empresa · endereço e contato";
      if (pjMgr && g.scope === "company" && g.id === "ident") { title = "Regime tributário"; sub = "O CNPJ e a razão social vêm do seu cadastro"; }
      return { g, form, doc, title, sub, key: `${g.scope}-${g.id}` };
    };
    const u = (id: string) => mk(ug(id), U), c = (id: string) => mk(cg(id), C);
    const order = !isManager ? USER_GROUPS.map((g) => mk(g, U))
      : pjMgr ? [u("ident"), c("ident"), c("endereco"), u("contato"), u("endereco"), u("emerg"), u("pay"), c("resp"), c("banc")]
        : [...USER_GROUPS.map((g) => mk(g, U)), ...COMPANY_GROUPS.map((g) => mk(g, C))];
    return order.filter((s) => visibleFields(s.g, s.doc, hide).length > 0);
  }, [U, C, isManager, pjMgr, hide]);

  const countOf = (s: Sec) => { const vis = visibleFields(s.g, s.doc, hide); return s.form.missing.filter((k) => vis.some((f) => f.key === k)).length; };
  const pending = secs.filter((s) => countOf(s) > 0);
  const done = secs.filter((s) => countOf(s) === 0);

  const ready = U.ready && (!isManager || C.ready || !!C.error) && !!U.pending;
  useEffect(() => { if (ready && open === undefined) setOpen(pending[0]?.key ?? null); }, [ready, open, pending]);

  const total = secs.reduce((n, s) => n + visibleFields(s.g, s.doc, hide).filter((f) => s.form.required.some((r) => r.key === f.key && r.required && (!r.doc_type || r.doc_type === s.doc))).length, 0);
  const remaining = pending.reduce((n, s) => n + countOf(s), 0);
  const filled = Math.max(total - remaining, 0);
  const pct = total ? Math.round((filled / total) * 100) : 100;

  const reminder = useMemo(() => (notices.data ?? []).find((n) => n.kind === "pending_fields"), [notices.data]);
  const from = (loc.state as { from?: string } | null)?.from;

  const save = async (s: Sec) => {
    setSaving(s.key);
    try {
      const st = await s.form.save([s.g]);
      const vis = visibleFields(s.g, s.doc, hide);
      const miss = (s.g.scope === "user" ? st.user : st.company ?? []).filter((k) => vis.some((f) => f.key === k)).length;
      qc.setQueryData([PENDING_KEY, profile?.id], (old: unknown) => ({ ...(old as object), ...st }));
      if (miss > 0) { toast.message(`Salvo. Ainda ${miss === 1 ? "falta 1 campo" : `faltam ${miss} campos`} neste item.`); }
      else {
        toast.success(`${s.title}: salvo`);
        if ((st.user?.length ?? 0) === 0 && (st.company?.length ?? 0) === 0) {
          (notices.data ?? []).filter((n) => n.kind === "pending_fields").forEach((n) => resolveNotice(n.id).catch(() => undefined));
          toast.success("Cadastro completo. Bem-vindo(a)!");
          nav(from && from.startsWith("/intranet") && from !== "/intranet/cadastro" ? from : "/intranet/areas", { replace: true });
          return;
        }
        const left = (x: Sec) => { const v = visibleFields(x.g, x.doc, hide); return (x.g.scope === "user" ? st.user : st.company ?? []).some((k) => v.some((f) => f.key === k)); };
        const idx = secs.findIndex((x) => x.key === s.key);
        const nx = [...secs.slice(idx + 1), ...secs.slice(0, idx)].find((x) => left(x));
        setOpen(nx?.key ?? null);
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar."); }
    setSaving(null);
  };

  /** Chavezinha: copia da empresa para o representante legal (contato / endereço). */
  const pullFor = (s: Sec) => {
    const map = s.g.scope === "user" ? PULL_FROM_COMPANY[s.g.id] : undefined;
    if (!map || !isManager || !C.ready) return undefined;
    const on = !!pulled[s.key];
    return {
      on,
      toggle: () => {
        if (on) { setPulled((p) => ({ ...p, [s.key]: false })); return; }
        const patch: Record<string, string> = {};
        for (const [uk, ck] of Object.entries(map)) if (C.values[ck]) patch[uk] = C.values[ck];
        if (!Object.keys(patch).length) { toast.message("Preencha antes esse dado na etapa da empresa."); return; }
        U.set(patch); setPulled((p) => ({ ...p, [s.key]: true }));
      },
    };
  };

  const renderItem = (s: Sec, isDone = false) => (
    <Item key={s.key} s={s} hide={hide} count={isDone ? 0 : countOf(s)} done={isDone} open={open === s.key}
      onToggle={() => setOpen(open === s.key ? null : s.key)} onSave={() => save(s)} saving={saving === s.key} pull={pullFor(s)} />
  );

  const err = U.error || (isManager ? C.error : null);
  return (
    <div className="sg ix">
      <Helmet><title>Cadastro pendente — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="ix-bg">
        <IntranetTop />
        <main className="ix-cad">
          <h1 className="ix-h1 hd" style={{ fontSize: "clamp(28px, 5vw, 40px)" }}>Complete seu <span className="gt">cadastro</span></h1>
          <p className="ix-sub" style={{ fontSize: 16 }}>
            {!ready ? "Carregando…" : remaining > 0 ? <>Toque em cada item para preencher. {remaining === 1 ? "Falta 1 informação." : `Faltam ${remaining} informações.`}</> : "Tudo preenchido. Toque em um item se quiser revisar."}
          </p>
          {reminder && <div style={{ marginTop: 16 }}><Banner>{reminder.body ?? reminder.title}</Banner></div>}
          {err ? <div style={{ marginTop: 24 }}><ErrorBox error={err} /></div> : !ready ? <div style={{ marginTop: 24 }}><Loading rows={4} /></div> : (
            <>
              <Card style={{ margin: "22px 0 18px" }}>
                <div className="ix-row ix-between"><b style={{ fontSize: 15 }}>{filled} de {total} concluídos</b><b className="ix-num" style={{ color: "#431171" }}>{pct}%</b></div>
                <div className="ix-prog" style={{ margin: 0 }}><div className="bar"><i style={{ width: `${pct}%` }} /></div></div>
              </Card>
              <div className="ix-acc">
                {pending.map((s) => renderItem(s))}
                {done.length > 0 && (
                  <div className="ix-acc-item ix-acc-done">
                    <button type="button" className="ix-acc-h" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}>
                      <span className="ix-icon" style={{ background: "#fff" }}><Check size={20} /></span>
                      <span className="t"><b>Concluídos · {done.length} de {secs.length}</b></span>
                      <ChevronDown size={20} className="chev" style={{ transform: showDone ? "rotate(180deg)" : undefined }} />
                    </button>
                    {showDone && <div style={{ padding: "0 12px 12px", display: "grid", gap: 10 }}>{done.map((s) => renderItem(s, true))}</div>}
                  </div>
                )}
              </div>
              {remaining === 0 && <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}><Btn arrow mfull style={{ minWidth: 320 }} onClick={() => nav("/intranet/areas")}>Ir para a página inicial</Btn></div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default Cadastro;
