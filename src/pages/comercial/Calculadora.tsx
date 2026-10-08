import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { mesLabel, n0, n2, pc, rsc } from "@/lib/comercial/format";
import { BOX_S, Empty, ErrorBox, GR, HERO_S, IChev, Icon, LINE2, Loading, PU, Sec, Shell, SORA } from "@/components/comercial/kit";
import { Ini, Pop, PopItem, SearchBox, Tile3 } from "@/components/comercial/gestao/shared";
import { useDebounced } from "@/components/comercial/gestao/hooks";

type Prod = { cobranca_id: string; produto: string; tipo: string; peso: number; pts: number; qtd: number };
type Calc = {
  month: string; status: string; sem_vendedor?: boolean;
  months: { month: string; status: string }[]; sellers: { id: string; name: string }[]; seller: { id: string; name: string };
  meta: number; realizado: number; falta: number; gatilho: number; gatilho_pts: number; salario: number; peso_total: number; produtos: Prod[];
};
type Sim = { pontos: number; atingimento: number; fator: number; bonus: number; abaixo_gatilho: boolean };

const STATUS_LABEL: Record<string, string> = { em_vigor: "Em vigor", encerrado: "Encerrado", programado: "Previsto", sem_regras: "Sem regras" };
const REGRAS_LABEL: Record<string, string> = { em_vigor: "Regras em vigor", encerrado: "Regras encerradas", programado: "Regras previstas", sem_regras: "Sem regras" };
const fq = (v: number) => (v ? n2(v) : "0");
const parseQ = (t: string) => { const n = Number(t.replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };

/** Anel de atingimento (SVG transliterado do mockup); o traço claro marca o gatilho. */
const Ring = ({ pct, gat }: { pct: number | null; gat: number }) => {
  const r = 46, C = 2 * Math.PI * r, p = pct ?? 0, off = C * (1 - Math.min(p, 100) / 100);
  const ang = 2 * Math.PI * Math.min(Math.max(gat, 0), 1) - Math.PI / 2;
  const x1 = 58 + (r - 7) * Math.cos(ang), y1 = 58 + (r - 7) * Math.sin(ang), x2 = 58 + (r + 7) * Math.cos(ang), y2 = 58 + (r + 7) * Math.sin(ang);
  return (
    <div style={{ position: "relative", width: 116, height: 116, flex: "none" }}>
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="#e6dcf2" strokeWidth="9" />
        <circle cx="58" cy="58" r={r} fill="none" stroke={PU} strokeWidth="9" strokeLinecap="round" strokeDasharray={C.toFixed(2)} strokeDashoffset={off.toFixed(2)} transform="rotate(-90 58 58)" />
        <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#f8f4fc" strokeWidth="2.5" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 19, letterSpacing: "-0.04em" }}>{pct === null ? "—" : `${pct}%`}</div>
        <div style={{ fontSize: 11, color: GR, marginTop: 1 }}>Atingimento</div>
      </div>
    </div>
  );
};

const NavBtn = ({ dir, on, onClick }: { dir: "l" | "r"; on: boolean; onClick: () => void }) => (
  <div onClick={on ? onClick : undefined} style={{ width: 40, height: 40, margin: dir === "l" ? "0 -6px 0 -6px" : "0 -6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: on ? "pointer" : "default", flex: "none" }}>
    {on && (
      <div style={{ width: 28, height: 28, borderRadius: 14, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon w={15} d={<path d={dir === "l" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />} />
      </div>
    )}
  </div>
);

/** Corpo da simulação: reinicia (via key) a cada mês/vendedor para partir das quantidades sugeridas pelo banco. */
const Simulacao = ({ d, dim }: { d: Calc; dim: boolean }) => {
  const [qtd, setQtd] = useState<Record<string, number>>(() => Object.fromEntries(d.produtos.map((p) => [p.cobranca_id, p.qtd])));
  const dq = useDebounced(qtd);
  const sim = useQuery({
    queryKey: ["cm", "calc-sim", d.month, d.seller.id, dq],
    queryFn: () => cm<Sim>("cm_calc_sim", { p_month: d.month, p_seller: d.seller.id, p_qtds: dq }),
    placeholderData: keepPreviousData,
  });
  const s = sim.data;
  const futuro = d.status === "programado";
  const totalQ = Math.round(d.produtos.reduce((a, p) => a + (qtd[p.cobranca_id] ?? 0), 0) * 100) / 100;
  const set = (id: string, v: number) => setQtd((o) => ({ ...o, [id]: Math.max(0, Math.round(v * 100) / 100) }));
  const G = "minmax(0,1fr) 32px 40px 80px";

  return (
    <div style={{ opacity: dim ? 0.6 : 1 }}>
      <Sec t={futuro ? "Sua Meta do Mês" : "Sua Meta e Resultado Atual"} />
      <Tile3 cells={[{ v: n0(d.meta), l: "Meta de Pontos" }, { v: n0(d.realizado), l: "Já Realizado", pur: true }, { v: n0(d.falta), l: "Falta" }]} />
      <div style={{ marginTop: 10, ...BOX_S, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
        <span>Gatilho Mínimo</span><span style={{ color: PU, fontWeight: 600 }}>{pc(d.gatilho)} · {n0(d.gatilho_pts)} pts</span>
      </div>

      <Sec t="Seu Alcance Simulado" />
      <div style={{ ...HERO_S, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <Ring pct={s ? Math.round(s.atingimento * 100) : null} gat={d.gatilho} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ paddingBottom: 12, borderBottom: "1px solid #e6dcf2" }}>
            <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 22, letterSpacing: "-0.04em" }}>{s ? n0(s.pontos) : "—"}</div>
            <div style={{ marginTop: 2, fontSize: 11.5, color: GR }}>Pontos Ating.</div>
          </div>
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 22, letterSpacing: "-0.04em", color: PU }}>{s ? rsc(s.bonus) : "—"}</div>
            <div style={{ marginTop: 2, fontSize: 11.5, color: GR }}>Bônus Financeiro</div>
          </div>
        </div>
      </div>

      <Sec t="Produtos Que Venderei" />
      <div style={{ ...BOX_S, padding: "0 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: G, gap: 5, alignItems: "center", height: 32, borderBottom: `1px solid ${LINE2}`, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: GR }}>
          <div>PRODUTO · TIPO</div><div style={{ textAlign: "right" }}>PESO</div><div style={{ textAlign: "right" }}>PTS</div><div style={{ textAlign: "center" }}>QTD.</div>
        </div>
        {d.produtos.map((p) => (
          <div key={p.cobranca_id} style={{ display: "grid", gridTemplateColumns: G, gap: 5, alignItems: "center", height: 62, borderBottom: `1px solid ${LINE2}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{p.produto}</div>
              <div style={{ fontSize: 11, color: GR }}>{p.tipo}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12.5, color: PU, fontWeight: 600 }}>{pc(p.peso, 0)}</div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#5f5870" }}>{n0(p.pts)}</div>
            <Qtd v={qtd[p.cobranca_id] ?? 0} onChange={(v) => set(p.cobranca_id, v)} />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 48, fontSize: 13, fontWeight: 600 }}>
          <span>Total</span><span style={{ color: PU }}>{pc(d.peso_total, 0)} · {fq(totalQ)} vendas</span>
        </div>
      </div>
    </div>
  );
};

/** Quantidade de vendas: − / valor editável / + (passo de 1 venda), no estilo do mockup. */
const Qtd = ({ v, onChange }: { v: number; onChange: (v: number) => void }) => {
  const [txt, setTxt] = useState(fq(v));
  const [foc, setFoc] = useState(false);
  useEffect(() => { if (!foc) setTxt(fq(v)); }, [v, foc]);
  const b = (s: string, dlt: number) => <span onClick={() => onChange(v + dlt)} style={{ width: 18, height: 38, lineHeight: "38px", textAlign: "center", fontSize: 15, cursor: "pointer", userSelect: "none", flex: "none" }}>{s}</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40, boxSizing: "border-box", border: "1px solid #d2c5e3", borderRadius: 12, color: PU, fontWeight: 600, fontSize: 12.5, padding: "0 5px" }}>
      {b("−", -1)}
      <input inputMode="decimal" value={txt} onFocus={() => setFoc(true)} onChange={(e) => setTxt(e.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={() => { setFoc(false); const n = parseQ(txt); if (n !== null) onChange(n); else setTxt(fq(v)); }}
        style={{ width: "100%", minWidth: 0, border: "none", outline: "none", background: "transparent", textAlign: "center", font: "inherit", color: "inherit", padding: 0 }} />
      {b("+", 1)}
    </div>
  );
};

/** Calculadora de Meta: cm_calc (meta/realizado/produtos) + cm_calc_sim (alcance e bônus simulados pelo banco). */
export default function Calculadora() {
  const [month, setMonth] = useState<string | null>(null);
  const [seller, setSeller] = useState<string | null>(null);
  const [pop, setPop] = useState<"mes" | "vend" | null>(null);
  const [q, setQ] = useState("");
  const calc = useQuery({
    queryKey: ["cm", "calc", month, seller],
    queryFn: () => cm<Calc>("cm_calc", { p_month: month, p_seller: seller }),
    placeholderData: keepPreviousData,
  });
  const d = calc.data;
  const close = () => { setPop(null); setQ(""); };
  const meses = d?.months ?? [];
  const idx = d ? meses.findIndex((m) => m.month === d.month) : -1;
  const step = (n: number) => { const m = meses[idx + n]; if (m) setMonth(m.month); };
  const canPick = (d?.sellers.length ?? 0) > 1;

  return (
    <Shell title="Calculadora de Meta" back="/intranet/metas" nav="Calculadora" pad="16px 24px 0">
      {calc.isLoading ? <Loading /> : calc.error ? <ErrorBox e={calc.error} /> : d && (
        <>
          <div style={{ position: "relative", ...BOX_S, padding: "0 16px" }}>
            <div style={{ height: 64, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${LINE2}` }}>
              <NavBtn dir="l" on={idx > 0} onClick={() => step(-1)} />
              <div onClick={() => { setQ(""); setPop(pop === "mes" ? null : "mes"); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", minHeight: 40, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em" }}>{mesLabel(d.month)}</span>
                  {pop === "mes" ? <Icon d={<path d="M6 15l6-6 6 6" />} /> : <IChev />}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: PU }}>{REGRAS_LABEL[d.status] ?? ""}</div>
              </div>
              <NavBtn dir="r" on={idx >= 0 && idx < meses.length - 1} onClick={() => step(1)} />
            </div>
            <div onClick={canPick ? () => { setQ(""); setPop(pop === "vend" ? null : "vend"); } : undefined} style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, cursor: canPick ? "pointer" : "default" }}>
              Vendedor
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: PU, fontWeight: 600 }}>
                {d.sem_vendedor ? "—" : d.seller.name}
                {canPick && (pop === "vend" ? <Icon d={<path d="M6 15l6-6 6 6" />} /> : <IChev />)}
              </span>
            </div>

            {pop === "mes" && (
              <Pop top={68} onClose={close}>
                <SearchBox value={q} onChange={setQ} placeholder="Buscar mês" />
                <div style={{ padding: "6px 12px 4px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: GR }}>MESES COM META DEFINIDA</div>
                {meses.filter((m) => mesLabel(m.month).toLowerCase().includes(q.toLowerCase())).map((m) => {
                  const on = m.month === d.month;
                  return (
                    <div key={m.month} onClick={() => { setMonth(m.month); close(); }} style={{ height: 44, borderRadius: 12, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: on ? "#f2ecf8" : undefined }}>
                      <div style={{ flex: 1, fontSize: 14, ...(on ? { fontWeight: 600, color: PU } : {}) }}>{mesLabel(m.month)}</div>
                      <span style={{ fontSize: 11.5, color: GR }}>{STATUS_LABEL[m.status] ?? ""}</span>
                      {on ? <Icon d={<path d="M5 12l5 5L20 7" />} /> : <span style={{ width: 16 }} />}
                    </div>
                  );
                })}
              </Pop>
            )}
            {pop === "vend" && (
              <Pop top={122} onClose={close}>
                <SearchBox value={q} onChange={setQ} placeholder="Buscar vendedor" />
                {d.sellers.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).map((s) => {
                  const on = s.id === d.seller?.id;
                  return (
                    <PopItem key={s.id} on={on} onClick={() => { setSeller(s.id); close(); }} avatar={<Ini name={s.name} sz={30} fs={11} one={false} on={on} />}>{s.name}</PopItem>
                  );
                })}
              </Pop>
            )}
          </div>

          {d.sem_vendedor
            ? <Empty>Nenhum vendedor ativo neste mês.</Empty>
            : <Simulacao key={`${d.month}|${d.seller.id}`} d={d} dim={calc.isPlaceholderData} />}
          <div style={{ height: 28 }} />
        </>
      )}
    </Shell>
  );
}
