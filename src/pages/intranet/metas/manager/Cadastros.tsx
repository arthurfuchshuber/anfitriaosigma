import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TwoStepConfirm } from "@/components/intranet/TwoStepConfirm";
import { Btn, Card, Chip, Empty, ErrorBox, Field, Input, Loading, Modal, PageHeader, Select, Textarea } from "@/components/intranet/ui";
import {
  addHoliday, createProduct, getCompany, getParams, listHolidays, listNotices, listProducts, removeHoliday, resolveNotice, saveCompany, saveParam, saveProductVersion, setProductActive,
  type ProductRow,
} from "@/lib/intranet/api";
import { addMonths, brl, dmy, monthStart, toNumber } from "@/lib/intranet/format";

const TABS = [["produtos", "Produtos"], ["parametros", "Parâmetros"], ["feriados", "Feriados"], ["empresa", "Empresa"], ["avisos", "Avisos"]] as const;
type TabId = (typeof TABS)[number][0];
const err = (e: Error) => toast.error(e.message);
const fmtNum = (n: number) => String(Math.round(n * 10000) / 10000).replace(".", ",");

// ---------- Produtos ----------
interface PForm { name: string; recurring: boolean; points: string; min: string; caixa: string }
const ProdutosTab = () => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const [edit, setEdit] = useState<ProductRow | "new" | null>(null);
  const [f, setF] = useState<PForm>({ name: "", recurring: false, points: "", min: "", caixa: "" });
  const [confirm, setConfirm] = useState(false);
  const open = (p: ProductRow | "new") => {
    setEdit(p);
    setF(p === "new" ? { name: "", recurring: false, points: "", min: "", caixa: "" }
      : { name: p.name, recurring: p.recurring, points: fmtNum(p.version?.points ?? 0), min: fmtNum(p.version?.min_price ?? 0), caixa: fmtNum((p.version?.caixa_pct ?? 0) * 100) });
  };
  const toggle = useMutation({ mutationFn: (p: ProductRow) => setProductActive(p.id, !p.active), onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }), onError: err });
  const nums = { points: toNumber(f.points), min: toNumber(f.min), caixa: toNumber(f.caixa) / 100 };
  const valid = (edit !== "new" || f.name.trim().length > 1) && f.points !== "" && nums.caixa >= 0 && nums.caixa <= 1;
  const onConfirm = async (when: "now" | "next") => {
    if (edit === "new") await createProduct(f.name.trim(), f.recurring, nums.points, nums.min, nums.caixa, when);
    else if (edit) await saveProductVersion(edit.id, nums.points, nums.min, nums.caixa, when);
    toast.success("Produto salvo.");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };
  return (
    <>
      <div className="ix-row" style={{ justifyContent: "flex-end", marginBottom: 14 }}><Btn size="sm" onClick={() => open("new")}>Novo produto</Btn></div>
      {q.isLoading ? <Loading rows={4} /> : q.error ? <ErrorBox error={q.error} /> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Produto</th><th>Recorrente</th><th className="r">Valor (pontos)</th><th className="r">Piso</th><th className="r">Caixa</th><th>Status</th><th /></tr></thead>
            <tbody>
              {q.data!.map((p) => (
                <tr key={p.id} style={{ opacity: p.active ? 1 : 0.6 }}>
                  <td><b>{p.name}</b>{p.next && <div className="ix-faint ix-small">a partir de {dmy(p.next.valid_from)}: {brl(p.next.points)} · piso {brl(p.next.min_price)} · caixa {fmtNum(p.next.caixa_pct * 100)}%</div>}</td>
                  <td>{p.recurring ? "Sim" : "Não"}</td>
                  <td className="r">{brl(p.version?.points)}</td><td className="r">{brl(p.version?.min_price)}</td><td className="r">{fmtNum((p.version?.caixa_pct ?? 0) * 100)}%</td>
                  <td>{p.active ? <Chip>Ativo</Chip> : <Chip tone="muted">Inativo</Chip>}</td>
                  <td><div className="ix-row" style={{ gap: 6, justifyContent: "flex-end" }}><Btn kind="secondary" size="sm" onClick={() => open(p)}>Editar</Btn><Btn kind="ghost" size="sm" onClick={() => toggle.mutate(p)} disabled={toggle.isPending}>{p.active ? "Desativar" : "Ativar"}</Btn></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!edit && !confirm} onClose={() => setEdit(null)} title={edit === "new" ? "Novo produto" : "Editar produto"}
        footer={<><Btn kind="ghost" onClick={() => setEdit(null)}>Cancelar</Btn><Btn disabled={!valid} onClick={() => setConfirm(true)}>Continuar</Btn></>}>
        {edit === "new" ? (
          <>
            <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Nome do produto" /></Field>
            <label className="ix-row" style={{ gap: 8, marginBottom: 16 }}><input type="checkbox" checked={f.recurring} onChange={(e) => setF({ ...f, recurring: e.target.checked })} style={{ accentColor: "#431171" }} />Recorrente</label>
          </>
        ) : <p className="ix-muted" style={{ marginTop: 0 }}><b>{edit?.name}</b></p>}
        <div className="ix-grid c3">
          <Field label="Valor (pontos)"><Input inputMode="decimal" value={f.points} onChange={(e) => setF({ ...f, points: e.target.value })} aria-label="Valor em pontos" /></Field>
          <Field label="Piso"><Input inputMode="decimal" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} aria-label="Piso" /></Field>
          <Field label="Caixa (%)"><Input inputMode="decimal" value={f.caixa} onChange={(e) => setF({ ...f, caixa: e.target.value })} aria-label="Caixa em porcentagem" /></Field>
        </div>
      </Modal>
      <TwoStepConfirm open={confirm} onClose={() => setConfirm(false)} title="Confirmar produto"
        summary={<><b>{edit === "new" ? f.name : edit?.name}</b><div>Valor {brl(nums.points)} · piso {brl(nums.min)} · caixa {fmtNum(nums.caixa * 100)}%</div></>}
        onConfirm={onConfirm} />
    </>
  );
};

// ---------- Parâmetros ----------
const PARAMS: { key: string; label: string; kind?: "pct" | "bool" | "int" }[] = [
  { key: "multiplo", label: "Múltiplo base" }, { key: "fator_base", label: "Fator base (salário ×)" },
  { key: "ajuste_historico", label: "Ajuste pelo histórico", kind: "bool" }, { key: "ajuste_min", label: "Ajuste mínimo do múltiplo" }, { key: "ajuste_max", label: "Ajuste máximo do múltiplo" },
  { key: "dias_validar", label: "Dias para validar venda", kind: "int" }, { key: "dia_corte", label: "Dia de corte da meta", kind: "int" },
  { key: "limite_comissao", label: "Limite de comissão ÷ caixa", kind: "pct" },
  { key: "rampa_entrada", label: "Rampa — mês de entrada", kind: "pct" }, { key: "rampa_m1", label: "Rampa — 1º mês", kind: "pct" }, { key: "rampa_m2", label: "Rampa — 2º mês", kind: "pct" }, { key: "rampa_m3", label: "Rampa — 3º mês em diante", kind: "pct" },
  { key: "retroativo_dias", label: "Dias para lançar venda retroativa", kind: "int" },
];
const ParamsTab = () => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["params"], queryFn: getParams });
  const [sel, setSel] = useState<(typeof PARAMS)[number] | null>(null);
  const [val, setVal] = useState("");
  const [confirm, setConfirm] = useState(false);
  const shown = (p: (typeof PARAMS)[number], v: number | undefined) => v === undefined ? "—" : p.kind === "pct" ? `${fmtNum(v * 100)}%` : p.kind === "bool" ? (v === 1 ? "Sim" : "Não") : fmtNum(v);
  const parsed = sel?.kind === "pct" ? toNumber(val) / 100 : toNumber(val);
  const onConfirm = async (when: "now" | "next") => {
    const from = when === "next" ? addMonths(monthStart(), 1) : monthStart();
    await saveParam(sel!.key, parsed, from);
    toast.success("Parâmetro salvo.");
    setSel(null);
    qc.invalidateQueries({ queryKey: ["params"] });
  };
  return (
    <>
      {q.isLoading ? <Loading rows={4} /> : q.error ? <ErrorBox error={q.error} /> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Parâmetro</th><th className="r">Valor atual</th><th /></tr></thead>
            <tbody>{PARAMS.map((p) => (
              <tr key={p.key}><td><b>{p.label}</b></td><td className="r">{shown(p, q.data![p.key])}</td>
                <td style={{ textAlign: "right" }}><Btn kind="secondary" size="sm" onClick={() => { setSel(p); const v = q.data![p.key]; setVal(v === undefined ? "" : p.kind === "pct" ? fmtNum(v * 100) : fmtNum(v)); }}>Alterar</Btn></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Modal open={!!sel && !confirm} onClose={() => setSel(null)} title={sel?.label ?? ""}
        footer={<><Btn kind="ghost" onClick={() => setSel(null)}>Cancelar</Btn><Btn disabled={val === ""} onClick={() => setConfirm(true)}>Continuar</Btn></>}>
        {sel?.kind === "bool"
          ? <Field><Select value={val} onChange={(e) => setVal(e.target.value)} aria-label={sel.label}><option value="0">Não</option><option value="1">Sim</option></Select></Field>
          : <Field label={sel?.kind === "pct" ? "Valor (%)" : "Valor"}><Input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label={sel?.label} /></Field>}
      </Modal>
      <TwoStepConfirm open={confirm} onClose={() => setConfirm(false)} title="Confirmar parâmetro"
        summary={sel ? <><b>{sel.label}</b><div>{shown(sel, q.data?.[sel.key])} → {shown(sel, parsed)}</div></> : null} onConfirm={onConfirm} />
    </>
  );
};

// ---------- Feriados ----------
const FeriadosTab = () => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["holidays"], queryFn: listHolidays });
  const [d, setD] = useState(""); const [n, setN] = useState("");
  const done = () => qc.invalidateQueries({ queryKey: ["holidays"] });
  const add = useMutation({ mutationFn: () => addHoliday(d, n.trim()), onSuccess: () => { setD(""); setN(""); done(); }, onError: err });
  const del = useMutation({ mutationFn: removeHoliday, onSuccess: done, onError: err });
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div className="ix-row ix-wrapflex" style={{ alignItems: "flex-end" }}>
          <div style={{ width: 180 }}><Field label="Data"><Input type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Data do feriado" /></Field></div>
          <div style={{ flex: 1, minWidth: 200 }}><Field label="Nome"><Input value={n} onChange={(e) => setN(e.target.value)} aria-label="Nome do feriado" /></Field></div>
          <div style={{ marginBottom: 16 }}><Btn busy={add.isPending} disabled={!d || !n.trim()} onClick={() => add.mutate()}>Adicionar</Btn></div>
        </div>
      </Card>
      {q.isLoading ? <Loading rows={3} /> : q.error ? <ErrorBox error={q.error} /> : (q.data ?? []).length === 0 ? <Empty>Nenhum feriado.</Empty> : (
        <div className="ix-table-wrap"><table className="ix-table">
          <thead><tr><th>Data</th><th>Feriado</th><th /></tr></thead>
          <tbody>{q.data!.map((h) => <tr key={h.day}><td>{dmy(h.day)}</td><td>{h.name}</td><td style={{ textAlign: "right" }}><Btn kind="ghost" size="sm" onClick={() => del.mutate(h.day)} disabled={del.isPending} aria-label={`Remover ${h.name}`}>Remover</Btn></td></tr>)}</tbody>
        </table></div>
      )}
    </>
  );
};

// ---------- Empresa ----------
const EmpresaTab = () => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["company"], queryFn: getCompany });
  const [f, setF] = useState({ legal_name: "", cnpj: "", address: "", email: "", nf_notes: "" });
  useEffect(() => { if (q.data) setF({ legal_name: q.data.legal_name ?? "", cnpj: q.data.cnpj ?? "", address: q.data.address ?? "", email: q.data.email ?? "", nf_notes: q.data.nf_notes ?? "" }); }, [q.data]);
  const save = useMutation({ mutationFn: () => saveCompany(f), onSuccess: () => { toast.success("Dados da empresa salvos."); qc.invalidateQueries({ queryKey: ["company"] }); }, onError: err });
  if (q.isLoading) return <Loading rows={3} />;
  if (q.error) return <ErrorBox error={q.error} />;
  const row = (k: keyof typeof f, l: string) => <Field label={l}><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-label={l} /></Field>;
  return (
    <Card>
      <div className="ix-grid c2">{row("legal_name", "Razão social")}{row("cnpj", "CNPJ")}{row("email", "E-mail")}{row("address", "Endereço")}</div>
      <Field label="Descrição sugerida da nota"><Textarea value={f.nf_notes} onChange={(e) => setF({ ...f, nf_notes: e.target.value })} aria-label="Descrição sugerida da nota" /></Field>
      <div className="ix-row" style={{ justifyContent: "flex-end" }}><Btn busy={save.isPending} onClick={() => save.mutate()}>Salvar</Btn></div>
    </Card>
  );
};

// ---------- Avisos ----------
const AvisosTab = () => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notices"], queryFn: listNotices });
  const res = useMutation({ mutationFn: resolveNotice, onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }), onError: err });
  if (q.isLoading) return <Loading rows={3} />;
  if (q.error) return <ErrorBox error={q.error} />;
  if ((q.data ?? []).length === 0) return <Empty>Nenhum aviso pendente.</Empty>;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {q.data!.map((n) => (
        <Card key={n.id} style={{ padding: 16 }}>
          <div className="ix-row ix-between ix-wrapflex"><div><b>{n.title}</b>{n.body && <div className="ix-muted ix-small">{n.body}</div>}<div className="ix-faint ix-small">{dmy(n.created_at)}</div></div>
            <Btn kind="secondary" size="sm" onClick={() => res.mutate(n.id)} disabled={res.isPending}>Resolver</Btn></div>
        </Card>
      ))}
    </div>
  );
};

const Cadastros = () => {
  const [tab, setTab] = useState<TabId>("produtos");
  return (
    <>
      <PageHeader eyebrow="Gestor" title="Cadastros" />
      <div className="ix-tabs" role="tablist" style={{ marginBottom: 22 }}>
        {TABS.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={`ix-tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} style={{ background: "none", border: 0, borderBottomWidth: 2, borderBottomStyle: "solid", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}
      </div>
      {tab === "produtos" && <ProdutosTab />}{tab === "parametros" && <ParamsTab />}{tab === "feriados" && <FeriadosTab />}{tab === "empresa" && <EmpresaTab />}{tab === "avisos" && <AvisosTab />}
    </>
  );
};
export default Cadastros;
