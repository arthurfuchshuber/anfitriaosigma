import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { mesLabel, n0, pc } from "@/lib/comercial/format";
import { BOX_S, Btn, Big, Empty, ErrorBox, GR, HERO_S, HRow, LINE2, Loading, PU, Sec, Shell, SORA } from "@/components/comercial/kit";
import { Cap11 as Cap, FootBox, Ini, SegPill } from "@/components/comercial/gestao/shared";

type Lista = {
  month: string; total: number; por_senioridade: { name: string; qtd: number }[];
  rows: { id: string; name: string; seniority: string; casa_label: string; meta: number | null; gatilho: number }[];
};

/** Lista de vendedores do mês: totais por senioridade + equipe (ativos/inativos). RPC: cm_sellers_list. */
export default function Vendedores() {
  const go = useNavigate();
  const [tab, setTab] = useState<"ativos" | "inativos">("ativos");
  const q = useQuery({ queryKey: ["cm", "sellers", tab], queryFn: () => cm<Lista>("cm_sellers_list", { p_active: tab === "ativos" }) });
  const d = q.data;

  return (
    <Shell title="Vendedores" back="/intranet/metas" nav="Menu" pad="4px 24px 0"
      footer={
        <FootBox>
          <Btn w="100%" style={{ fontSize: 15 }} onClick={() => go("/intranet/vendedores/novo")}>Novo Vendedor</Btn>
          <div onClick={() => go("/intranet/parametros/meta")} style={{ marginTop: 1, marginBottom: -11, padding: "11px 0", lineHeight: "18px", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: PU, cursor: "pointer" }}>Ir para Parâmetros</div>
        </FootBox>
      }>
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox e={q.error} /> : d && (
        <>
          <div style={{ margin: "20px 0 0", ...HERO_S, padding: "18px 18px 0" }}>
            <Cap>VENDEDORES ATIVOS · {mesLabel(d.month).toUpperCase()}</Cap>
            <div style={{ marginTop: 6 }}><Big sz={34}>{d.total}</Big></div>
            <div style={{ marginTop: 14, borderTop: "1px solid #e6dcf2" }}>
              {d.por_senioridade.map((s, i) => <HRow key={s.name} l={s.name} r={s.qtd} last={i === d.por_senioridade.length - 1} />)}
            </div>
          </div>

          <Sec t="Equipe" r={<SegPill<"ativos" | "inativos"> opts={[{ v: "ativos", l: "Ativos" }, { v: "inativos", l: "Inativos" }]} value={tab} onChange={setTab} />} />
          {d.rows.length === 0 ? <Empty>{tab === "ativos" ? "Nenhum vendedor ativo." : "Nenhum vendedor inativo."}</Empty> : (
            <div style={{ ...BOX_S, padding: "0 16px" }}>
              {d.rows.map((v, i) => (
                <div key={v.id} onClick={() => go(`/intranet/vendedores/${v.id}`)} style={{ height: 72, display: "flex", alignItems: "center", gap: 12, borderBottom: i === d.rows.length - 1 ? undefined : `1px solid ${LINE2}`, cursor: "pointer" }}>
                  <Ini name={v.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                    <div style={{ fontSize: 11.5, color: GR }}>{v.seniority} · {v.casa_label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em", color: PU }}>{v.meta === null ? "—" : n0(v.meta)}</div>
                    <div style={{ fontSize: 11.5, color: GR }}>Gatilho {pc(v.gatilho, 1)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ height: 4 }} />
        </>
      )}
    </Shell>
  );
}
