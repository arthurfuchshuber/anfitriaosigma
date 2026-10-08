import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { BOX_S, Btn, ErrorBox, GR, IChev, ICheck, LINE2, Loading, PU, Sec, Shell, Toggle } from "@/components/comercial/kit";
import { FootBox, Pop, PopItem } from "@/components/comercial/gestao/shared";
import { useDebounced } from "@/components/comercial/gestao/hooks";

type Kind = "integral" | "recorrencia";
type Forma = "cartao" | "pix" | "boleto";
type PGet = {
  empresas: { id: string; name: string }[];
  product: { id: string; empresa_id: string; name: string; gera_caixa: boolean; fidelidade: boolean; periodo_min: number; active: boolean } | null;
  cobrancas: { kind: Kind; bruto: number; liquido: number | null; liquido_calc: number }[];
  formas: { forma: Forma; parcela: boolean; max: number; taxa: number }[];
};
type Cob = { on: boolean; bruto: number | null; liquido: number | null };
type Fm = { on: boolean; parcela: boolean; max: number; taxa: number };

const KINDS: { k: Kind; l: string; cap: string }[] = [{ k: "integral", l: "Pagamento Integral", cap: "PAGAMENTO INTEGRAL" }, { k: "recorrencia", l: "Recorrência", cap: "RECORRÊNCIA" }];
const FORMAS: { k: Forma; l: string }[] = [{ k: "cartao", l: "Cartão de Crédito" }, { k: "pix", l: "PIX" }, { k: "boleto", l: "Boleto" }];
const PARCELAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24];
const PERIODOS = [3, 6, 12, 18, 24, 36, 48, 60];

const nfmt = (min: number, max: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });

const showN = (v: number | null, min: number, max: number, scale: number) => (v === null ? "" : nfmt(min, max).format(Math.round(v * scale * 1e6) / 1e6));

/** Número "em texto": mesma tipografia do mockup, mas toque-para-editar (sem moldura). */
const Plain = ({ value, onChange, prefix = "", suffix = "", min = 0, max = 2, scale = 1, ph }: { value: number | null; onChange: (v: number | null) => void; prefix?: string; suffix?: string; min?: number; max?: number; scale?: number; ph?: string }) => {
  const [txt, setTxt] = useState(showN(value, min, max, scale));
  const [foc, setFoc] = useState(false);
  useEffect(() => { if (!foc) setTxt(showN(value, min, max, scale)); }, [value, foc, min, max, scale]);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", minHeight: 40 }}>
      {prefix}
      <span style={{ position: "relative", display: "inline-block" }}><span aria-hidden style={{ visibility: "hidden", whiteSpace: "pre" }}>{txt || ph || " "}</span>
      <input inputMode="decimal" value={txt} placeholder={ph} onFocus={() => setFoc(true)} onChange={(e) => setTxt(e.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={() => { setFoc(false); const raw = txt.replace(/\./g, "").replace(",", "."); if (raw === "") { onChange(null); return; } const n = Number(raw); if (!Number.isNaN(n)) onChange(Math.round((n / scale) * 1e6) / 1e6); }}
        style={{ border: "none", outline: "none", background: "transparent", textAlign: "right", font: "inherit", color: "inherit", padding: 0, position: "absolute", inset: 0, width: "100%" }} /></span>
      {suffix}
    </span>
  );
};

const Check = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <div onClick={onClick} style={{ width: 40, height: 40, margin: "0 -9px 0 0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
    {on ? <div style={{ width: 22, height: 22, borderRadius: 11, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center" }}><ICheck /></div>
      : <div style={{ width: 22, height: 22, boxSizing: "border-box", borderRadius: 11, border: "1.5px solid #d2c5e3" }} />}
  </div>
);

const R = ({ l, children, last, h = 50, onClick, rel, style }: { l: ReactNode; children: ReactNode; last?: boolean; h?: number; onClick?: () => void; rel?: boolean; style?: CSSProperties }) => (
  <div onClick={onClick} style={{ position: rel ? "relative" : undefined, height: h, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: onClick ? "pointer" : undefined, ...style }}>
    <span>{l}</span><span style={{ display: "flex", alignItems: "center", gap: 6, color: PU, fontWeight: 600 }}>{children}</span>
  </div>
);
const Sub = ({ t }: { t: string }) => <div style={{ paddingTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: GR }}>{t}</div>;
const Pill = ({ children, onClick, outline }: { children: ReactNode; onClick?: () => void; outline?: boolean }) => (
  <span onClick={onClick} style={{ height: 20, lineHeight: outline ? "18px" : "20px", boxSizing: "border-box", padding: "0 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: outline ? "#fff" : "#f2ecf8", border: outline ? "1px solid #d2c5e3" : undefined, color: PU, cursor: onClick ? "pointer" : undefined }}>{children}</span>
);

const Form = ({ data, id }: { data: PGet; id: string | null }) => {
  const go = useNavigate();
  const qc = useQueryClient();
  const p = data.product;
  const [empresa, setEmpresa] = useState(p?.empresa_id ?? "");
  const [name, setName] = useState(p?.name ?? "");
  const [gera, setGera] = useState(p?.gera_caixa ?? true);
  const [active, setActive] = useState(p?.active ?? true);
  const [fid, setFid] = useState(p?.fidelidade ?? false);
  const [periodo, setPeriodo] = useState(p?.periodo_min ?? 12);
  const [cob, setCob] = useState<Record<Kind, Cob>>(() => {
    const o = (k: Kind): Cob => { const c = data.cobrancas.find((x) => x.kind === k); return c ? { on: true, bruto: c.bruto, liquido: c.liquido } : { on: !p && k === "integral", bruto: null, liquido: null }; };
    return { integral: o("integral"), recorrencia: o("recorrencia") };
  });
  const [fm, setFm] = useState<Record<Forma, Fm>>(() => {
    const o = (k: Forma): Fm => { const f = data.formas.find((x) => x.forma === k); return f ? { on: true, parcela: f.parcela, max: f.parcela ? f.max : 12, taxa: f.taxa } : { on: !p && k !== "boleto", parcela: false, max: 12, taxa: 0 }; };
    return { cartao: o("cartao"), pix: o("pix"), boleto: o("boleto") };
  });
  const [pop, setPop] = useState<string | null>(null);

  const cobOn = KINDS.filter((x) => cob[x.k].on);
  const fmOn = FORMAS.filter((x) => fm[x.k].on);
  const body = {
    gera_caixa: gera,
    cobrancas: cobOn.map((x) => ({ kind: x.k, bruto: cob[x.k].bruto ?? 0, liquido: cob[x.k].liquido })),
    formas: fmOn.map((x) => ({ forma: x.k, parcela: fm[x.k].parcela, max: fm[x.k].parcela ? fm[x.k].max : 1, taxa: fm[x.k].taxa })),
  };
  const dbody = useDebounced(body, 300);
  const prev = useQuery({
    queryKey: ["cm", "product-preview", dbody],
    queryFn: () => cm<{ kind: Kind; liquido: number }[]>("cm_product_preview", { p: dbody }),
    enabled: dbody.cobrancas.length > 0 && dbody.formas.length > 0,
    placeholderData: keepPreviousData,
  });
  const liq = (k: Kind) => prev.data?.find((x) => x.kind === k)?.liquido ?? null;

  const valid = name.trim() !== "" && !!empresa && cobOn.length > 0 && cobOn.every((x) => (cob[x.k].bruto ?? 0) > 0) && fmOn.length > 0;
  const save = useMutation({
    mutationFn: () => cm("cm_product_save", { p: { id, empresa_id: empresa, name: name.trim(), gera_caixa: gera, fidelidade: fid, periodo_min: periodo, active, cobrancas: body.cobrancas, formas: body.formas } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cm"] }); go("/intranet/produtos"); },
  });
  const setC = (k: Kind, v: Partial<Cob>) => setCob((o) => ({ ...o, [k]: { ...o[k], ...v } }));
  const setF = (k: Forma, v: Partial<Fm>) => setFm((o) => ({ ...o, [k]: { ...o[k], ...v } }));
  const close = () => setPop(null);
  const emp = data.empresas.find((e) => e.id === empresa);

  return (
    <Shell title={id ? "Produto" : "Novo Produto"} back="/intranet/produtos" nav="Menu" pad="4px 24px 0"
      footer={<FootBox><Btn w="100%" style={{ fontSize: 15 }} disabled={!valid || save.isPending} onClick={() => save.mutate()}>Salvar Produto</Btn></FootBox>}>
      <Sec t="Produto" />
      <div style={{ position: "relative", ...BOX_S, padding: "0 16px" }}>
        <R l="Empresa" onClick={() => setPop(pop === "emp" ? null : "emp")}>{emp?.name ?? <span style={{ color: GR, fontWeight: 400 }}>Selecione</span>}<IChev /></R>
        <R l="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do Produto" style={{ border: "none", outline: "none", background: "transparent", textAlign: "right", font: "inherit", color: "inherit", padding: 0, width: 220, minHeight: 40 }} />
        </R>
        <R l="Gera Caixa" last={!id}><Toggle on={gera} onChange={setGera} /></R>
        {id && <R l="Ativo" last><Toggle on={active} onChange={setActive} /></R>}
        {pop === "emp" && (
          <Pop top={46} onClose={close}>
            {data.empresas.map((e) => <PopItem key={e.id} on={e.id === empresa} onClick={() => { setEmpresa(e.id); close(); }}>{e.name}</PopItem>)}
          </Pop>
        )}
      </div>

      <Sec t="Cobrança" />
      <div style={{ ...BOX_S, padding: "0 16px" }}>
        {KINDS.map((x, i) => <R key={x.k} l={x.l} last={i === KINDS.length - 1}><Check on={cob[x.k].on} onClick={() => setC(x.k, { on: !cob[x.k].on })} /></R>)}
      </div>

      {cobOn.length > 0 && (
        <>
          <Sec t="Valores por Cobrança" r={<span style={{ fontSize: 12, color: GR, marginRight: 17 }}>Valor</span>} />
          <div style={{ ...BOX_S, padding: "0 16px" }}>
            {cobOn.map((x, i) => {
              const c = cob[x.k]; const last = i === cobOn.length - 1; const auto = c.liquido === null;
              return (
                <div key={x.k}>
                  <Sub t={x.cap} />
                  <R l="Valor Bruto"><Plain prefix="R$ " value={c.bruto} onChange={(v) => setC(x.k, { bruto: v })} ph="0" /></R>
                  <R l="Valor Líquido" last={last}>
                    {auto ? <Pill>{gera ? "Pelas Taxas" : "Igual ao Bruto"}</Pill> : <Pill outline onClick={() => setC(x.k, { liquido: null })}>Manual</Pill>}
                    <Plain prefix="R$ " value={auto ? liq(x.k) : c.liquido} onChange={(v) => setC(x.k, { liquido: v })} ph="0" />
                  </R>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Sec t="Formas de Pagamento Aceitas" />
      <div style={{ ...BOX_S, padding: "0 16px" }}>
        {FORMAS.map((x, i) => {
          const f = fm[x.k]; const last = i === FORMAS.length - 1;
          return (
            <div key={x.k}>
              <R l={x.l} last={last}><Check on={f.on} onClick={() => setF(x.k, { on: !f.on })} /></R>
              {f.on && (
                <div style={{ margin: "0 0 12px", background: "#faf8fc", borderRadius: 14, padding: "0 14px", borderLeft: "3px solid #d2c5e3" }}>
                  <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: f.parcela ? `1px solid ${LINE2}` : undefined, fontSize: 13.5, color: "#3b3347" }}>
                    <span>Permite Parcelar</span><Toggle on={f.parcela} onChange={(v) => setF(x.k, { parcela: v })} />
                  </div>
                  {f.parcela && (
                    <div onClick={() => setPop(pop === `p-${x.k}` ? null : `p-${x.k}`)} style={{ position: "relative", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5, color: "#3b3347", cursor: "pointer" }}>
                      <span>Até Quantas Vezes</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: PU, fontWeight: 600 }}>{f.max}×<IChev /></span>
                      {pop === `p-${x.k}` && (
                        <Pop top={42} onClose={close} style={{ maxHeight: 220, overflowY: "auto" }}>
                          {PARCELAS.map((n) => <PopItem key={n} on={n === f.max} onClick={() => { setF(x.k, { max: n }); close(); }}>{n}×</PopItem>)}
                        </Pop>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fmOn.length > 0 && (
        <>
          <Sec t="Taxas por Forma de Pagamento" r={<span style={{ fontSize: 12, color: GR, marginRight: 17 }}>Taxa</span>} />
          <div style={{ ...BOX_S, padding: "0 16px" }}>
            {fmOn.map((x, i) => (
              <R key={x.k} l={x.l} last={i === fmOn.length - 1}><Plain suffix="%" scale={100} min={1} max={1} value={fm[x.k].taxa} onChange={(v) => setF(x.k, { taxa: Math.min(Math.max(v ?? 0, 0), 0.99) })} /></R>
            ))}
          </div>
        </>
      )}

      <Sec t="Vigência do Serviço" />
      <div style={{ position: "relative", ...BOX_S, padding: "0 16px" }}>
        <R l="Fidelidade Obrigatória"><Toggle on={fid} onChange={setFid} /></R>
        <R l="Período Mínimo" last onClick={fid ? () => setPop(pop === "per" ? null : "per") : undefined} style={fid ? undefined : { color: GR }}>
          <span style={fid ? undefined : { color: GR }}>{periodo} meses</span>{fid && <IChev />}
        </R>
        {pop === "per" && (
          <Pop bottom={52} onClose={close} style={{ maxHeight: 240, overflowY: "auto" }}>
            {PERIODOS.map((n) => <PopItem key={n} on={n === periodo} onClick={() => { setPeriodo(n); close(); }}>{n} meses</PopItem>)}
          </Pop>
        )}
      </div>
      <div style={{ height: 4 }} />
      {save.error && <ErrorBox e={save.error} />}
    </Shell>
  );
};

/** Cadastro de produto (novo/edição). RPCs: cm_product_get, cm_product_preview, cm_product_save. */
export default function ProdutoForm() {
  const { id: p } = useParams();
  const id = p && p !== "novo" ? p : null;
  const q = useQuery({ queryKey: ["cm", "product", id], queryFn: () => cm<PGet>("cm_product_get", { p_id: id }) });
  if (q.isLoading) return <Shell title={id ? "Produto" : "Novo Produto"} back="/intranet/produtos" nav="Menu"><Loading /></Shell>;
  if (q.error || !q.data) return <Shell title="Produto" back="/intranet/produtos" nav="Menu"><ErrorBox e={q.error} /></Shell>;
  return <Form key={id ?? "novo"} data={q.data} id={id} />;
}
