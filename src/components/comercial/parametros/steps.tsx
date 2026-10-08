import { useState } from "react";
import {
  Big, Box, Dot, Empty, GR, HERO_S, HRow, ICheck, IChevR, IPen, IPlus, ITrash, LINE, PU, ROSE, SORA, Sec, Seg, Stepper, Toggle,
} from "../kit";
import { mesNome, n0, n1, n2, pc, rs } from "@/lib/comercial/format";
import { Cap11, Num, Pill, numFmt } from "./ui";
import type { Projecao, Preview, Rules, RulesGet } from "./types";

export type StepProps = { rules: Rules; set: (fn: (r: Rules) => void) => void; ro: boolean };
const COLORS = [PU, "#7a4aa8", "#b69bd8", "#dccdee"];
const f1 = (v: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v);
const pcf = (v: number) => `${numFmt(v)}%`;

/* ------------------------------------------------------------------ META */
export const MetaStep = ({ rules, set, ro, prev }: StepProps & { prev?: Preview }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const G = "minmax(0,1fr) 36px 84px 60px";
  const count = (name: string) => prev?.sellers.filter((s) => s.seniority === name).length ?? 0;
  const gat = rules.gatilho;
  const cols: { n: string; k: "m1" | "m2" | "m3" | "m4" | null; c: string }[] = [
    { n: "Mês de Entrada", k: null, c: "#efe7f8" }, { n: "Mês 1", k: "m1", c: "#dccdee" }, { n: "Mês 2", k: "m2", c: "#b69bd8" }, { n: "Mês 3", k: "m3", c: "#7a4aa8" }, { n: "Mês 4 em diante", k: "m4", c: PU },
  ];
  return (
    <>
      <Sec t="Objetivo de Caixa" />
      <div style={{ ...HERO_S, padding: "18px 18px 0" }}>
        <Cap11>META DE CAIXA DO MÊS</Cap11>
        <div style={{ marginTop: 6 }}><Big sz={34}>{prev ? rs(prev.objetivo) : "—"}</Big></div>
        <div style={{ marginTop: 14, borderTop: "1px solid #e6dcf2" }}>
          <HRow l="Custo Atual da Área" r={<Num value={rules.custo} fmt={(v) => rs(v)} w={130} h={40} disabled={ro} onChange={(v) => v !== null && set((r) => { r.custo = v; })} />} />
          <HRow l="Objetivo de Caixa sobre o Custo" last r={<Num value={rules.pct * 100} fmt={pcf} w={90} h={40} disabled={ro} onChange={(v) => v !== null && set((r) => { r.pct = v / 100; })} />} />
        </div>
      </div>

      <Sec t="Senioridades" />
      <Box style={{ padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: G, gap: 6, alignItems: "center", height: 32, borderBottom: "1px solid #ece7f2", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: GR }}>
          <div>SENIORIDADE</div><div style={{ textAlign: "right" }}>PESO</div><div style={{ textAlign: "right" }}>SALÁRIO</div><div />
        </div>
        {rules.seniorities.map((s, i) => {
          const q = count(s.name);
          const canDel = !ro && q === 0 && rules.seniorities.length > 1;
          return (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: G, gap: 6, alignItems: "center", height: 60, borderBottom: "1px solid #ece7f2" }}>
              <div style={{ minWidth: 0 }}>
                {editing === s.id
                  ? <input autoFocus value={s.name} onChange={(e) => set((r) => { r.seniorities[i].name = e.target.value; })} onBlur={() => setEditing(null)} onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
                      style={{ width: "100%", height: 32, boxSizing: "border-box", border: "1px solid #d2c5e3", borderRadius: 8, padding: "0 8px", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  : <div style={{ fontSize: 14 }}>{s.name}</div>}
                <div style={{ fontSize: 11.5, color: GR }}>{q} {q === 1 ? "vendedor" : "vendedores"}</div>
              </div>
              <Num value={s.weight} fmt={f1} disabled={ro} fs={13} weight={600} color={PU} onChange={(v) => v !== null && set((r) => { r.seniorities[i].weight = v; })} />
              <Num value={s.salary} fmt={(v) => rs(v)} disabled={ro} fs={13} weight={600} color={PU} onChange={(v) => v !== null && set((r) => { r.seniorities[i].salary = v; })} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginRight: -7 }}>
                <div onClick={() => !ro && setEditing(s.id)} style={{ width: 30, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: ro ? "default" : "pointer" }}><IPen /></div>
                <div onClick={() => canDel && set((r) => { r.seniorities.splice(i, 1); })} style={{ width: 30, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: canDel ? "pointer" : "default" }}><ITrash c={canDel ? "#6b6379" : "#d2c5e3"} /></div>
              </div>
            </div>
          );
        })}
        <div onClick={() => { if (ro) return; const id = crypto.randomUUID(); set((r) => { r.seniorities.push({ id, name: "Nova Senioridade", weight: 1, salary: 0 }); }); setEditing(id); }}
          style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: PU, fontSize: 13.5, fontWeight: 600, cursor: ro ? "default" : "pointer" }}>
          <IPlus />Adicionar Senioridade
        </div>
      </Box>

      <Sec t="Gatilho por Mês de Casa" />
      <Box style={{ padding: "16px 12px 6px" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {cols.map((c) => {
            const v = c.k ? Math.round(gat[c.k] * 100) : null;
            const h = Math.round((v ?? 70) * 1.1);
            return (
              <div key={c.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <div style={{ position: "relative", width: "100%", height: 17, marginBottom: 6, fontFamily: SORA, fontWeight: 600, fontSize: 13, color: PU, textAlign: "center" }}>
                  {c.k === null ? "Prop." : (
                    <div style={{ position: "absolute", left: 0, right: 0, top: -12, height: 40 }}>
                      <Num value={v} fmt={pcf} align="center" disabled={ro} font={SORA} fs={13} weight={600} color={PU}
                        onChange={(x) => x !== null && set((r) => { r.gatilho[c.k as "m1"] = x / 100; })} />
                    </div>
                  )}
                </div>
                <div style={{ width: "100%", maxWidth: 56, height: h, borderRadius: 10, background: c.c, ...(c.k === null ? { border: "1.5px dashed #b69bd8", boxSizing: "border-box" } : {}) }} />
                <div style={{ marginTop: 8, height: 28, fontSize: 11.5, lineHeight: "14px", color: "#6b6379", textAlign: "center" }}>{c.n}</div>
              </div>
            );
          })}
        </div>
      </Box>
      <div style={{ height: 4 }} />
    </>
  );
};

/* ----------------------------------------------------------------- PESOS */
export const PesosStep = ({ rules, set, ro, prev, rg, onVariacoes }: StepProps & { prev?: Preview; rg: RulesGet; onVariacoes?: () => void }) => {
  const soma = Object.values(rules.pesos).reduce((a, b) => a + b, 0);
  const ok = Math.abs(soma - 1) < 0.0001;
  const GT = "minmax(0,1fr) 52px 52px 40px";
  const pts = (id: string) => prev?.cobrancas.find((c) => c.id === id)?.pts;
  const emp = (id: string) => prev?.empresas.find((e) => e.id === id);
  return (
    <>
      <Sec t="Peso dos Produtos *" r={
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: 64, marginRight: 17, fontSize: 12, color: ok ? PU : ROSE, fontWeight: 600 }}>{ok && <ICheck />}{numFmt(Math.round(soma * 1000) / 10)}%</span>
      } />
      <Box style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 3, height: 12, margin: "16px 0 6px" }}>
          {rg.empresas.map((e, k) => (rules.pesos[e.id] ?? 0) > 0 ? <div key={e.id} style={{ flex: (rules.pesos[e.id] ?? 0) * 100, background: COLORS[k % 4], borderRadius: 6 }} /> : null)}
        </div>
        {rg.empresas.map((e, k) => (
          <div key={e.id} style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: k === rg.empresas.length - 1 ? undefined : "1px solid #ece7f2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Dot c={COLORS[k % 4]} />
              <div><div style={{ fontSize: 14 }}>{e.linha}</div><div style={{ fontSize: 11.5, color: GR }}>{e.name}</div></div>
            </div>
            <Num box value={Math.round((rules.pesos[e.id] ?? 0) * 1000) / 10} fmt={pcf} align="center" w={64} h={30} r={8} fs={13} font={SORA} disabled={ro}
              onChange={(v) => v !== null && set((r) => { r.pesos[e.id] = v / 100; })} />
          </div>
        ))}
      </Box>

      <Sec t="Valores e Pontos de Referência" />
      <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: GT, gap: 4, alignItems: "center", padding: "0 12px", height: 32, background: "#f8f4fc", borderBottom: `1px solid ${LINE}`, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#6b6379" }}>
          <div>PRODUTO · TIPO</div><div style={{ textAlign: "right" }}>BRUTO *</div><div style={{ textAlign: "right" }}>LÍQUIDO</div><div style={{ textAlign: "right" }}>PTS</div>
        </div>
        {rg.variacoes.map((v) => {
          const cur = rules.valores[v.cobranca_id] ?? { bruto: v.bruto, liquido: v.liquido };
          const p = pts(v.cobranca_id);
          return (
            <div key={v.cobranca_id} style={{ display: "grid", gridTemplateColumns: GT, gap: 4, alignItems: "center", padding: "6px 12px", borderTop: "1px solid #ece7f2" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{v.produto}</div>
                <div style={{ fontSize: 11, color: GR }}>{v.label}</div>
              </div>
              <Num box nullable value={cur.bruto} w={52} h={26} r={7} fs={12} disabled={ro} onChange={(x) => set((r) => { r.valores[v.cobranca_id] = { ...cur, bruto: x }; })} />
              <Num box nullable value={cur.liquido} w={52} h={26} r={7} fs={12} disabled={ro} onChange={(x) => set((r) => { r.valores[v.cobranca_id] = { ...cur, liquido: x }; })} />
              <div style={{ textAlign: "right", fontSize: 12, color: "#5f5870" }}>{p === null || p === undefined ? "" : numFmt(p)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ margin: "8px 4px 0", fontSize: 12, color: GR }}>* Obrigatório</div>

      <Sec t="Meta Distribuída" />
      <Box style={{ padding: "0 16px" }}>
        <div style={{ height: 30, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #ece7f2", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: GR }}>
          <span style={{ flex: 1 }}>PRODUTO</span><span style={{ width: 60, textAlign: "right" }}>PONTOS</span><span style={{ width: 56, textAlign: "right" }}>VENDAS</span>
        </div>
        {rg.empresas.map((e, k) => {
          const d = emp(e.id);
          return (
            <div key={e.id} style={{ height: 50, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #ece7f2", fontSize: 14 }}>
              <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Dot c={COLORS[k % 4]} /><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13 }}>{e.linha}</span>
              </span>
              <span style={{ width: 60, textAlign: "right", color: "#5f5870", fontSize: 13 }}>{d ? n0(d.pontos) : "—"}</span>
              <span style={{ width: 56, textAlign: "right", color: PU, fontWeight: 600, fontSize: 13 }}>{d?.qtd != null ? n2(d.qtd) : "—"}</span>
            </div>
          );
        })}
        <div style={{ height: 50, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          <span style={{ flex: 1 }}>Total</span><span style={{ width: 60, textAlign: "right", fontSize: 13 }}>{prev ? n0(prev.objetivo) : "—"}</span><span style={{ width: 56 }} />
        </div>
      </Box>
      <Box onClick={onVariacoes} style={{ marginTop: 14, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, cursor: onVariacoes ? "pointer" : undefined }}>
        <span>Variações Cadastradas</span><span style={{ display: "flex", alignItems: "center", gap: 4, color: PU, fontWeight: 600 }}>{rg.variacoes.length}<IChevR /></span>
      </Box>
      <div style={{ height: 4 }} />
    </>
  );
};

/* ----------------------------------------------------------------- GANHO */
export const GanhoStep = ({ rules, set, ro }: StepProps) => {
  const reg = rules.regua;
  const nearest = [70, 80, 90, 100].reduce((a, b) => (Math.abs(b - rules.gatilho.m1 * 100) < Math.abs(a - rules.gatilho.m1 * 100) ? b : a));
  const [g, setG] = useState<number>(nearest);
  const dec = (x: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(Math.round((x * 100 - 0.1) * 10) / 10);
  const pr = (x: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(Math.round(x * 1000) / 10);
  type F = { l: string; s: string; m: number; c: string; t: string; key: "leve" | "padrao" | "acel" | "max" | null };
  const faixas: F[] = [{ l: `Até ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(g - 0.1)}%`, s: "Detrator forte", m: 0, c: "#e4dcee", t: `<${g}%`, key: null }];
  if (g < 100) faixas.push({ l: `${g}% a 99,9%`, s: "Detrator leve", m: reg.leve, c: "#c9b3e4", t: `${g}%`, key: "leve" });
  faixas.push(
    { l: `100% a ${dec(reg.acel_de)}%`, s: "Padrão", m: reg.padrao, c: "#a98bd0", t: "100%", key: "padrao" },
    { l: `${pr(reg.acel_de)}% a ${dec(reg.max_de)}%`, s: "Acelerador", m: reg.acel, c: "#7a4aa8", t: `${pr(reg.acel_de)}%`, key: "acel" },
    { l: `${pr(reg.max_de)}% ou Mais`, s: "Acelerador máximo", m: reg.max, c: PU, t: `${pr(reg.max_de)}%+`, key: "max" },
  );
  return (
    <>
      <Sec t="Acelerador e Detrator" r={<Toggle on={reg.on} disabled={ro} onChange={(v) => set((r) => { r.regua.on = v; })} />} />
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
        <span>Gatilho do Vendedor</span>
        <Seg opts={[70, 80, 90, 100].map((v) => ({ v, l: `${v}%` }))} value={g} onChange={(v) => setG(Number(v))} />
      </div>
      <Box style={{ padding: "0 16px", opacity: reg.on ? 1 : 0.5 }}>
        <div style={{ padding: "18px 0 14px", borderBottom: "1px solid #ece7f2" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {faixas.map((f) => (
              <div key={f.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 12.5, color: PU, marginBottom: 6 }}>×{n1(f.m)}</div>
                <div style={{ width: "100%", maxWidth: 44, height: 6 + Math.round(f.m * 58), borderRadius: 8, background: f.c }} />
                <div style={{ marginTop: 8, fontSize: 11, color: "#6b6379" }}>{f.t}</div>
              </div>
            ))}
          </div>
        </div>
        {faixas.map((f, k) => (
          <div key={f.l} style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: k === faixas.length - 1 ? undefined : "1px solid #ece7f2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Dot c={k ? f.c : "#d2c5e3"} />
              <div><div style={{ fontSize: 14 }}>{f.l}</div><div style={{ fontSize: 11.5, color: GR }}>{f.s}</div></div>
            </div>
            {f.key
              ? <Num value={f.m} fmt={(v) => `× ${f1(v)}`} w={72} h={44} disabled={ro || !reg.on} fs={14} weight={600} color={PU} onChange={(v) => v !== null && set((r) => { r.regua[f.key as "leve"] = v; })} />
              : <span style={{ color: PU, fontWeight: 600, fontSize: 14 }}>× 0,0</span>}
          </div>
        ))}
      </Box>
      <div style={{ height: 4 }} />
    </>
  );
};

/* -------------------------------------------------------------- OPERAÇÃO */
const TP = ".tp{position:relative;flex:1;min-width:0;text-align:left;color:#431171;font-weight:600;cursor:default;outline:none}.tp .tx{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.tp .tip{display:none;position:absolute;left:0;bottom:calc(100% + 6px);background:#120a1c;color:#fff;font-size:12px;font-weight:500;padding:6px 10px;border-radius:8px;white-space:nowrap;z-index:10}.tp:hover .tip,.tp:focus .tip{display:block}";
export const OperacaoStep = ({ rules, set, ro, rg, err, max }: StepProps & { rg: RulesGet; err: boolean; max: number }) => {
  const op = rules.operacao;
  const tiles: { k: "corte" | "folha" | "bonus"; n: string }[] = [{ k: "corte", n: "Corte do Histórico" }, { k: "folha", n: "Pagamento da Folha" }, { k: "bonus", n: "Pagamento do Bônus" }];
  const freeze = op.prazo <= 3 ? "Último Dia do Mês" : `Dia ${op.prazo - 3}`;
  return (
    <>
      <style>{TP}</style>
      <Sec t="Dias Úteis e Feriados" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {rg.calendar.map((c) => (
          <div key={c.month} style={{ flex: "1 1 calc(50% - 5px)", ...HERO_S, padding: 14, minWidth: 0, boxSizing: "border-box" }}>
            <Cap11>{mesNome(c.month).toUpperCase()}</Cap11>
            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 6 }}><Big sz={32}>{c.dias_uteis}</Big><span style={{ fontSize: 13, color: "#6b6379" }}>dias úteis</span></div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e6dcf2" }}>
              {c.feriados.length === 0 && <div style={{ fontSize: 12.5, lineHeight: "20px", color: GR }}>Sem feriados</div>}
              {c.feriados.map((h) => (
                <div key={h.dia} style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: "20px" }}>
                  <span style={{ color: "#6b6379", flex: "none", width: 36 }}>{h.dia}</span>
                  <span className="tp" tabIndex={0} title={h.nome}><span className="tx">{h.nome}</span><span className="tip">{h.nome}</span></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Box style={{ marginTop: 10, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
        <span>Calendário</span><span style={{ display: "flex", alignItems: "center", gap: 8, color: PU, fontWeight: 600 }}>Feriados nacionais <Pill>Automático</Pill></span>
      </Box>

      <Sec t="Fechamento do Mês" />
      <div style={{ display: "flex", gap: 10 }}>
        {tiles.map((t) => (
          <label key={t.k} style={{ flex: 1, minWidth: 0, border: `1px solid ${LINE}`, borderRadius: 20, padding: 14, display: "block", boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: GR }}>DIA</div>
            <div style={{ marginTop: 2, fontFamily: SORA, fontWeight: 600, fontSize: 28, letterSpacing: "-0.04em", color: PU, lineHeight: 1.15 }}>
              <Num value={op[t.k]} align="left" h={32} disabled={ro} fs={28} font={SORA} weight={600} color={PU} onChange={(v) => v !== null && set((r) => { r.operacao[t.k] = v; })} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: "15px", color: "#6b6379", minHeight: 30 }}>{t.n}</div>
          </label>
        ))}
      </div>
      <Box style={{ marginTop: 10, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
        <span>Congelamento do Resultado</span><span style={{ color: err ? ROSE : PU, fontWeight: 600 }}>{freeze} · 23h59</span>
      </Box>

      <Sec t="Vendas Canceladas" />
      <Box style={{ padding: "0 16px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, ...(err ? { borderColor: ROSE } : {}) }}>
        <span>Prazo em dias corridos</span>
        <Stepper value={op.prazo} min={1} max={60} rose={err} unit={op.prazo === 1 ? " dia" : " dias"} onChange={(v) => { if (!ro) set((r) => { r.operacao.prazo = v; }); }} />
      </Box>
      {err && (
        <div style={{ margin: "8px 4px 0", fontSize: 12.5, color: ROSE, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
          <span>Igual ou Maior que o Dia do Bônus</span><span>Máx. {max} dias</span>
        </div>
      )}
      <div style={{ height: 4 }} />
    </>
  );
};

/* ------------------------------------------------------------- PROJEÇÃO */
export const ProjecaoStep = ({ data }: { data?: Projecao }) => {
  if (!data) return <Empty>Carregando projeção…</Empty>;
  const meta = data.meta / 1000;
  const vals = data.bars.map((b) => (b.value === null ? null : b.value / 1000));
  const nums = [...vals.filter((v): v is number => v !== null), meta];
  const lo = Math.floor(Math.min(...nums)) - 1;
  const hi = Math.max(Math.ceil(Math.max(...nums)), lo + 2);
  const k = 96 / (hi - lo);
  const H = (v: number) => 40 + (v - lo) * k;
  const ym = 150 - H(meta);
  const col = { realizado: PU, parcial: "#9b74c4", projetado: "#d9c9ec" } as const;
  const metaTxt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(meta);
  const Row = ({ l, v, p, last }: { l: string; v: string; p: string; last?: boolean }) => (
    <div style={{ height: 50, display: "flex", alignItems: "center", borderBottom: last ? undefined : "1px solid #ece7f2", fontSize: 14 }}>
      <span style={{ flex: 1 }}>{l}</span><span style={{ width: 96, textAlign: "right", color: PU, fontWeight: 600 }}>{v}</span><span style={{ width: 64, textAlign: "right", color: "#6b6379" }}>{p}</span>
    </div>
  );
  const lg = (c: string, t: string) => <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 3, background: c, display: "inline-block" }} />{t}</span>;
  return (
    <>
      <Sec t="Caixa por Mês" r={<span style={{ fontSize: 12, color: GR, marginRight: 17 }}>R$ mil</span>} />
      <Box style={{ padding: "14px 12px 14px" }}>
        <svg width="318" height="180" viewBox="0 0 318 180" style={{ maxWidth: "100%" }}>
          <line x1="0" y1={ym} x2="318" y2={ym} stroke={PU} strokeWidth="1.5" strokeDasharray="4 4" />
          {data.bars.map((b, i) => {
            const v = vals[i]; const x = 14 + i * 52;
            const lab = (y: number, t: string) => <text x={x + 17} y={y} textAnchor="middle" fontSize="11" stroke="#fff" strokeWidth="3" paintOrder="stroke" fill="#6b6379" fontFamily="DM Sans">{t}</text>;
            return (
              <g key={b.month}>
                {v !== null ? <><rect x={x} y={150 - H(v)} width="34" height={H(v)} rx="8" fill={col[b.kind]} />{lab(150 - H(v) - 6, new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v))}</> : lab(144, "—")}
                <text x={x + 17} y="172" textAnchor="middle" fontSize="11" fill={GR} fontFamily="DM Sans">{mesNome(b.month).slice(0, 3)}</text>
              </g>
            );
          })}
        </svg>
        <div style={{ padding: "0 4px" }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "#6b6379", marginTop: 6, flexWrap: "wrap" }}>
            {lg(PU, "Realizado")}{lg("#9b74c4", "Parcial")}{lg("#d9c9ec", "Projetado")}
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 14, height: 0, borderTop: `2px dashed ${PU}`, display: "inline-block" }} />Meta {metaTxt}</span>
          </div>
        </div>
      </Box>

      <Sec t="Meses Seguintes" r={<span style={{ fontSize: 12, color: GR, marginRight: 17 }}>Projetado · Ating.</span>} />
      <Box style={{ padding: "0 16px" }}>
        {data.seguintes.map((s, i) => <Row key={s.month} l={mesNome(s.month)} v={s.projetado === null ? "—" : rs(s.projetado)} p={s.atingimento === null ? "—" : pc(s.atingimento, 0)} last={i === data.seguintes.length - 1} />)}
      </Box>

      <Sec t="Custo do Bônus" r={<span style={{ fontSize: 12, color: GR, marginRight: 17 }}>Bônus · % do Caixa</span>} />
      <Box style={{ padding: "0 16px" }}>
        {data.bonus.map((b, i) => <Row key={b.month} l={mesNome(b.month)} v={b.valor === null ? "—" : rs(b.valor)} p={b.pct_caixa === null ? "—" : pc(b.pct_caixa, 0)} last={i === data.bonus.length - 1} />)}
      </Box>
      <div style={{ height: 4 }} />
    </>
  );
};
