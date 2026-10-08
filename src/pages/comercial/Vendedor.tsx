import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { dmy, mesLabel, n0, pc, rs, rsc } from "@/lib/comercial/format";
import { BOX_S, Btn, EditValue, ErrorBox, GR, HERO_S, IChev, IChevR, ILock, LINE2, Loading, PU, Row, Sec, SORA, Shell, Toggle } from "@/components/comercial/kit";
import { FootBox, Ini, Pop, PopItem, SearchBox, Tile3 } from "@/components/comercial/gestao/shared";

type Senior = { id: string; name: string; salary: number };
type UserOpt = { id: string; name: string; email: string };
type SellerRow = {
  id: string; user_id: string | null; name: string; seniority_id: string; seniority: string; start_date: string; end_date: string | null; active: boolean;
  salary: number; salary_override: number | null; effective_from?: string; casa_label: string; gatilho: number; meta: number; total_100: number;
};
type Ficha = { month: string; is_admin: boolean; seniorities: Senior[]; users: UserOpt[]; seller: SellerRow | null };
type Hist = { at: string; field: string; old: string | null; new: string | null; by: string | null };

/* ---------- histórico de alterações ---------- */
const histVal = (field: string, v: string | null) => {
  if (v === null || v === "") return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return dmy(v);
  if (field === "Salário") return rsc(Number(v));
  if (field === "Status") return v === "true" ? "Ativo" : "Inativo";
  return v;
};
const stamp = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " ·");

const Historico = ({ id }: { id: string }) => {
  const h = useQuery({ queryKey: ["cm", "seller-hist", id], queryFn: () => cm<Hist[]>("cm_seller_history", { p_id: id }) });
  if (h.isLoading) return <div style={{ padding: "14px 0", fontSize: 13, color: GR }}>Carregando…</div>;
  if (h.error) return <ErrorBox e={h.error} />;
  if (!h.data?.length) return <div style={{ padding: "14px 0", fontSize: 13, color: GR }}>Nenhuma alteração registrada.</div>;
  return (
    <>
      {h.data.map((x, i) => (
        <div key={`${x.at}-${i}`} style={{ minHeight: 64, padding: "10px 0", display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${LINE2}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14 }}>{x.field === "cadastro" ? "Cadastro" : x.field}</div>
            <div style={{ fontSize: 11.5, color: GR }}>{stamp(x.at)}{x.by ? ` · ${x.by}` : ""}</div>
          </div>
          <div style={{ textAlign: "right", color: PU, fontWeight: 600, fontSize: 13.5 }}>
            {x.field === "cadastro" ? histVal(x.field, x.new) : <>{histVal(x.field, x.old)} → {histVal(x.field, x.new)}</>}
          </div>
        </div>
      ))}
    </>
  );
};

/* ---------- linhas de campo (54px) ---------- */
const F = ({ l, req, last, children, onClick, rel }: { l: string; req?: boolean; last?: boolean; children: ReactNode; onClick?: () => void; rel?: boolean }) => (
  <div onClick={onClick} style={{ position: rel ? "relative" : undefined, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: onClick ? "pointer" : undefined }}>
    <span>{l}{req ? " *" : ""}</span><span style={{ color: PU, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{children}</span>
  </div>
);

/** Data com calendário nativo: o texto do mockup fica visível e o input de data cobre a linha inteira. */
const DateRow = ({ l, req, value, onChange, optional, last }: { l: string; req?: boolean; value: string; onChange: (v: string) => void; optional?: boolean; last?: boolean }) => (
  <F l={l} req={req} last={last} rel>
    {optional && value && <span onClick={(e) => { e.stopPropagation(); onChange(""); }} style={{ position: "relative", zIndex: 2, fontSize: 12, color: GR, fontWeight: 400, padding: "10px 6px", cursor: "pointer" }}>Limpar</span>}
    {value ? dmy(value) : "—"}
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} aria-label={l}
      onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* navegador sem showPicker */ } }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 1 }} />
  </F>
);

const Form = ({ data, id }: { data: Ficha; id: string | null }) => {
  const go = useNavigate();
  const qc = useQueryClient();
  const s = data.seller;
  const [name, setName] = useState(s?.name ?? "");
  const [userId, setUserId] = useState<string | null>(s?.user_id ?? null);
  const [sen, setSen] = useState(s?.seniority_id ?? "");
  const [start, setStart] = useState(s?.start_date ?? "");
  const [end, setEnd] = useState(s?.end_date ?? "");
  const [active, setActive] = useState(s?.active ?? true);
  const [salary, setSalary] = useState<number | null>(s?.salary_override ?? null);
  const [pop, setPop] = useState<"nome" | "sen" | null>(null);
  const [q, setQ] = useState("");
  const [hist, setHist] = useState(false);
  const close = () => { setPop(null); setQ(""); };

  const senObj = data.seniorities.find((x) => x.id === sen);
  const defSalary = senObj?.salary ?? 0;
  const shownSalary = salary ?? (s && s.seniority_id === sen ? s.salary : defSalary);
  const valid = name.trim() !== "" && !!sen && !!start;

  const save = useMutation({
    mutationFn: () => cm("cm_seller_save", { p: { id, user_id: userId, name: name.trim(), seniority_id: sen, start_date: start, end_date: end || null, active, salary_override: data.is_admin && salary !== null && salary !== defSalary ? salary : null } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cm"] }); go("/intranet/vendedores"); },
  });

  return (
    <Shell title="Vendedor" back="/intranet/vendedores" nav="Menu" pad="4px 24px 0"
      footer={
        <FootBox>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn kind="outline" w={96} style={{ fontSize: 14 }} onClick={() => go("/intranet/vendedores")}>Voltar</Btn>
            <Btn disabled={!valid || save.isPending} onClick={() => save.mutate()}>Salvar Vendedor</Btn>
          </div>
        </FootBox>
      }>
      <div style={{ margin: "20px 0 0", ...HERO_S, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <Ini name={name || "?"} sz={56} fs={19} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 19, letterSpacing: "-0.03em" }}>{name || "Novo Vendedor"}</div>
          <div style={{ marginTop: 2, fontSize: 12.5, color: "#6b6379" }}>{senObj?.name ?? "Senioridade"} · Status: {active ? "Ativo" : "Inativo"}</div>
        </div>
      </div>

      <Sec t="Dados do Vendedor" />
      <div style={{ position: "relative", ...BOX_S, padding: "0 16px" }}>
        <F l="Nome" req onClick={() => { setQ(""); setPop(pop === "nome" ? null : "nome"); }}>{name || <span style={{ color: GR, fontWeight: 400 }}>Selecione</span>}<IChev /></F>
        <F l="Senioridade" req onClick={() => { setQ(""); setPop(pop === "sen" ? null : "sen"); }}>{senObj?.name ?? <span style={{ color: GR, fontWeight: 400 }}>Selecione</span>}<IChev /></F>
        <DateRow l="Data de Início" req value={start} onChange={setStart} />
        <DateRow l="Data de Saída" value={end} onChange={setEnd} optional />
        <F l="Salário Padrão">
          {data.is_admin
            ? <EditValue value={shownSalary} prefix="R$ " fs={14} w={118} h={36} r={10} align="right" onChange={setSalary} />
            : <><span>{rs(shownSalary)}</span><ILock c={GR} w={15} /></>}
        </F>
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}><span>Ativo</span><Toggle on={active} onChange={setActive} /></div>

        {pop === "nome" && (
          <Pop top={50} onClose={close}>
            <SearchBox value={q} onChange={setQ} placeholder="Buscar usuário" />
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {data.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())).map((u) => (
                <PopItem key={u.id} on={u.id === userId} sub={u.email} avatar={<Ini name={u.name} sz={30} fs={11} one={false} on={u.id === userId} />}
                  onClick={() => { setUserId(u.id); setName(u.name); close(); }}>{u.name}</PopItem>
              ))}
              {q.trim() !== "" && <PopItem onClick={() => { setName(q.trim()); close(); }}>Usar “{q.trim()}” sem usuário</PopItem>}
            </div>
          </Pop>
        )}
        {pop === "sen" && (
          <Pop top={104} onClose={close}>
            {data.seniorities.map((x) => <PopItem key={x.id} on={x.id === sen} onClick={() => { setSen(x.id); close(); }}>{x.name}</PopItem>)}
          </Pop>
        )}
      </div>
      <div style={{ margin: "8px 4px 0", fontSize: 12, color: GR }}>* Obrigatório</div>

      {s && (
        <>
          <Sec t={`Resultado em ${mesLabel(data.month)}`} />
          <Tile3 cells={[{ v: n0(s.meta), l: "Meta de Pontos" }, { v: pc(s.gatilho, 1), l: "Gatilho Mín.", pur: true }, { v: rs(s.total_100), l: "Total a 100%" }]} />
          <div style={{ marginTop: 10, ...BOX_S, padding: "0 16px" }}>
            <Row l="Mês de Casa" r={s.casa_label} />
            {s.effective_from && s.effective_from > s.start_date && <Row l="Vale a Partir de" r={dmy(s.effective_from)} />}
            <Row l="Histórico de Alterações" r={<span style={{ display: "inline-flex", transform: hist ? "rotate(90deg)" : undefined }}><IChevR /></span>} last={!hist} onClick={() => setHist(!hist)} />
            {hist && id && <Historico id={id} />}
          </div>
        </>
      )}
      <div style={{ height: 4 }} />
      {save.error && <ErrorBox e={save.error} />}
    </Shell>
  );
};

/** Ficha do vendedor (novo ou existente). RPCs: cm_seller_get, cm_seller_save, cm_seller_history. */
export default function Vendedor() {
  const { id: p } = useParams();
  const id = p && p !== "novo" ? p : null;
  const q = useQuery({ queryKey: ["cm", "seller", id], queryFn: () => cm<Ficha>("cm_seller_get", { p_id: id }) });
  if (q.isLoading) return <Shell title="Vendedor" back="/intranet/vendedores" nav="Menu"><Loading /></Shell>;
  if (q.error || !q.data) return <Shell title="Vendedor" back="/intranet/vendedores" nav="Menu"><ErrorBox e={q.error} /></Shell>;
  return <Form key={id ?? "novo"} data={q.data} id={id} />;
}
