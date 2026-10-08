import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { cm } from "@/lib/comercial/api";
import { mesLabel, mesSigla, rs } from "@/lib/comercial/format";
import { Big, Box, Cap, Chip, ErrorBox, HERO_S, IChevG, LINE, Loading, PU, SORA, Sec, Shell, GR2 } from "@/components/comercial/kit";
import type { MonthsList } from "@/components/comercial/parametros/types";

const ST = { em_vigor: { l: "Em vigor", k: "vig" }, encerrado: { l: "Encerrado", k: "sem" }, programado: { l: "Programado", k: "prog" }, sem_regras: { l: "Sem regras", k: "sem" } } as const;

/** /intranet/meses — Meses Programados (cm_months_list). */
export default function Meses() {
  const go = useNavigate();
  const q = useQuery({ queryKey: ["cm", "months"], queryFn: () => cm<MonthsList>("cm_months_list") });
  if (q.error) return <Shell title="Meses Programados" back="/intranet/metas"><ErrorBox e={q.error} /></Shell>;
  if (!q.data) return <Shell title="Meses Programados" back="/intranet/metas"><Loading /></Shell>;
  const d = q.data;
  const open = (m: string) => go(`/intranet/parametros/meta?meses=${m}`);
  const alvo = d.rows.find((r) => r.status === "sem_regras" && !r.locked) ?? d.rows.find((r) => !r.locked) ?? d.rows[d.rows.length - 1];
  const foot = (
    <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, padding: "14px 24px 20px" }}>
      <div onClick={() => open(alvo.month)} style={{ height: 48, borderRadius: 14, background: PU, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Programar Meses</div>
      <div onClick={() => go("/intranet/metas")} style={{ marginTop: 12, textAlign: "center", fontSize: 13.5, fontWeight: 600, color: PU, cursor: "pointer", minHeight: 24 }}>Voltar ao Menu</div>
    </div>
  );
  return (
    <Shell title="Meses Programados" back="/intranet/metas" footer={foot}>
      <Sec t="Em Vigor" mt={20} />
      <div style={{ ...HERO_S, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><Cap>EM VIGOR · {mesLabel(d.atual).toUpperCase()}</Cap><div style={{ marginTop: 6 }}><Big sz={30}>{rs(d.objetivo_atual)}</Big></div></div>
      </div>
      <Sec t="Meses" />
      <Box style={{ padding: "0 16px" }}>
        {d.rows.map((r, k) => {
          const st = ST[r.status];
          const tile = r.status === "em_vigor" ? { background: PU, color: "#fff" } : r.status === "programado" ? { background: "#f2ecf8", color: PU } : { background: "#faf8fc", border: "1px dashed #d2c5e3", color: GR2, boxSizing: "border-box" as const };
          return (
            <div key={r.month} onClick={() => open(r.month)} style={{ height: 68, display: "flex", alignItems: "center", gap: 12, borderBottom: k === d.rows.length - 1 ? undefined : "1px solid #ece7f2", cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, ...tile, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>{mesSigla(r.month)}</div>
                <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 14, lineHeight: 1.1 }}>{r.month.slice(2, 4)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{mesLabel(r.month)}</div>
                <div style={{ marginTop: 3 }}><Chip kind={st.k}>{st.l}</Chip></div>
              </div>
              <span style={{ color: PU, fontWeight: 600, fontSize: 14 }}>{r.objetivo === null ? "—" : rs(r.objetivo)}</span>
              <IChevG />
            </div>
          );
        })}
      </Box>
      <div style={{ height: 4 }} />
    </Shell>
  );
}
