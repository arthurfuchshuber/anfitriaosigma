import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cm } from "@/lib/comercial/api";
import { mesNome, pc, rs } from "@/lib/comercial/format";
import { Box, Empty, ErrorBox, GR, LINE, Loading, PU, SORA, Sec, Shell } from "@/components/comercial/kit";
import type { Sugestao as Sug } from "@/components/comercial/parametros/types";

type Cen = "atual" | "sugerido" | "aliviar";
const CEN: { v: Cen; l: string; apply: string }[] = [{ v: "atual", l: "Manter", apply: "manter" }, { v: "sugerido", l: "Sugerido", apply: "sugerido" }, { v: "aliviar", l: "Aliviar", apply: "aliviar" }];

/** /intranet/sugestao[?mes=2026-11-01] — cm_sugestao + cm_apply_sugestao. */
export default function Sugestao() {
  const go = useNavigate(); const qc = useQueryClient(); const [sp] = useSearchParams();
  const mes = sp.get("mes");
  const [cen, setCen] = useState<Cen>("sugerido");
  const q = useQuery({ queryKey: ["cm", "sugestao", mes], queryFn: () => cm<Sug>("cm_sugestao", mes ? { p_month: mes } : {}) });
  const apply = useMutation({
    mutationFn: (s: Sug) => cm("cm_apply_sugestao", { p_month: s.month, p_scenario: CEN.find((c) => c.v === cen)!.apply }),
    onSuccess: (_d, s) => { qc.invalidateQueries({ queryKey: ["cm"] }); go(`/intranet/parametros/meta?meses=${s.month}`); },
  });
  const back = "/intranet/metas";
  if (q.error) return <Shell title="Sugestão" back={back}><ErrorBox e={q.error} /></Shell>;
  if (!q.data) return <Shell title="Sugestão" back={back}><Loading /></Shell>;
  const s = q.data;
  const semHist = s.sem_historico || !s.cenarios;
  const mm = mesNome(s.month).toLowerCase();
  const manual = () => go(`/intranet/parametros/meta?meses=${s.month}`);

  const foot = (
    <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, padding: "14px 24px 20px" }}>
      <button type="button" disabled={semHist || apply.isPending} onClick={() => apply.mutate(s)}
        style={{ width: "100%", height: 48, borderRadius: 14, background: PU, color: "#fff", border: "none", fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: semHist ? "default" : "pointer", opacity: semHist || apply.isPending ? 0.5 : 1 }}>Aplicar em Parâmetros</button>
      <div onClick={manual} style={{ marginTop: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: PU, cursor: "pointer", minHeight: 24 }}>Ajustar manualmente</div>
      {apply.error && <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#b4415a" }}>{(apply.error as Error).message}</div>}
    </div>
  );
  if (semHist) return <Shell title="Sugestão" back={back} footer={foot}><Sec t="Recomendação" /><Empty>Sem histórico suficiente para sugerir.</Empty></Shell>;

  const atual = s.atual, sug = s.sugerido ?? atual;
  const verbo = sug > atual ? "Subir" : sug < atual ? "Reduzir" : "Manter";
  const acima = (s.motivos?.[0]?.label ?? "").toLowerCase().includes("acima");
  const lista = (s.meses ?? []).map((a) => pc(a, 0));
  const listaTxt = lista.length > 1 ? `${lista.slice(0, -1).join(", ")} e ${lista[lista.length - 1]}` : lista[0] ?? "";
  const hoje = s.cenarios!.atual, sel = s.cenarios![cen];
  const nome = (s.vendedor ?? "").split(" ")[0];
  const rows: [string, string, string][] = [
    ["% de geração", pc(hoje.pct, 0), pc(sel.pct, 0)],
    ["Meta de caixa", rs(hoje.objetivo), rs(sel.objetivo)],
    ["Atingimento", hoje.atingimento === null ? "—" : pc(hoje.atingimento, 0), sel.atingimento === null ? "—" : pc(sel.atingimento, 0)],
    ["Bônus do mês", hoje.bonus === null ? "—" : rs(hoje.bonus), sel.bonus === null ? "—" : rs(sel.bonus)],
  ];
  return (
    <Shell title="Sugestão" back={back} footer={foot}>
      <Sec t="Recomendação" />
      <div style={{ border: "1px solid #d2c5e3", background: "#faf8fc", borderRadius: 20, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: PU, letterSpacing: "0.04em" }}>CONFIANÇA {(s.confianca ?? "").toUpperCase()}</div>
        <div style={{ marginTop: 6, fontFamily: SORA, fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", lineHeight: "22px" }}>
          {verbo === "Manter" ? `Manter a geração de caixa em ${pc(atual, 0)} em ${mm}` : `${verbo} a geração de caixa de ${pc(atual, 0)} para ${pc(sug, 0)} a partir de ${mm}`}
        </div>
        {lista.length > 0 && <div style={{ marginTop: 8, fontSize: 13, lineHeight: "19px", color: "#6b6379" }}>O time fechou {acima ? "acima" : "abaixo"} da meta nos últimos {lista.length} meses ({listaTxt}).</div>}
      </div>

      <Sec t="Motivos" />
      <Box style={{ padding: "0 16px" }}>
        {(s.motivos ?? []).map((m, i, a) => (
          <div key={m.label} style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i === a.length - 1 ? undefined : "1px solid #ece7f2", fontSize: 14 }}>
            <span>{m.label}</span><span style={{ display: "flex", alignItems: "center", gap: 4, color: PU, fontWeight: 600 }}>{m.value}</span>
          </div>
        ))}
      </Box>

      <Sec t={nome ? `Efeito para a ${nome}` : "Efeito para o Vendedor"} />
      <div style={{ height: 42, borderRadius: 14, background: "#f2ecf8", padding: 3, display: "flex", gap: 2, boxSizing: "border-box", fontSize: 13 }}>
        {CEN.map((c) => (
          <div key={c.v} onClick={() => setCen(c.v)} style={{ flex: 1, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", ...(c.v === cen ? { background: "#fff", color: PU, fontWeight: 600, boxShadow: "0 1px 2px rgba(67,17,113,.12)" } : { color: "#6b6379" }) }}>{c.l}</div>
        ))}
      </div>
      <Box style={{ marginTop: 12, padding: "0 16px" }}>
        <div style={{ height: 36, display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: GR, borderBottom: "1px solid #ece7f2" }}>
          <span style={{ flex: 1 }} /><span style={{ width: 84, textAlign: "right" }}>HOJE</span><span style={{ width: 84, textAlign: "right" }}>{CEN.find((c) => c.v === cen)!.l.toUpperCase()}</span>
        </div>
        {rows.map(([l, a, b], i) => (
          <div key={l} style={{ height: 48, display: "flex", alignItems: "center", borderBottom: i === rows.length - 1 ? undefined : "1px solid #ece7f2", fontSize: 14 }}>
            <span style={{ flex: 1, color: "#6b6379" }}>{l}</span><span style={{ width: 84, textAlign: "right" }}>{a}</span><span style={{ width: 84, textAlign: "right", color: PU, fontWeight: 600 }}>{b}</span>
          </div>
        ))}
      </Box>
    </Shell>
  );
}
