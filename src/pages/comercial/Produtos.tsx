import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { n0 } from "@/lib/comercial/format";
import { BOX_S, Btn, Big, Empty, ErrorBox, GR, HERO_S, LINE2, Loading, PU, Sec, Shell, SORA } from "@/components/comercial/kit";
import { Cap11 as Cap, FootBox, Ini, SegPill } from "@/components/comercial/gestao/shared";

type Lista = {
  peso_count: number;
  rows: { id: string; name: string; empresa: string; active: boolean; gera_caixa: boolean; variacoes: number; pts: number | null }[];
};

/** Lista de apoio dos produtos (fora dos mockups; reutiliza o estilo da lista de Vendedores). RPC: cm_products_list. */
export default function Produtos() {
  const go = useNavigate();
  const [tab, setTab] = useState<"ativos" | "inativos">("ativos");
  const q = useQuery({ queryKey: ["cm", "products"], queryFn: () => cm<Lista>("cm_products_list") });
  const d = q.data;
  const rows = (d?.rows ?? []).filter((r) => r.active === (tab === "ativos"));

  return (
    <Shell title="Produtos" back="/intranet/metas" nav="Menu" pad="4px 24px 0"
      footer={<FootBox><Btn w="100%" style={{ fontSize: 15 }} onClick={() => go("/intranet/produtos/novo")}>Novo Produto</Btn></FootBox>}>
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox e={q.error} /> : d && (
        <>
          <div style={{ margin: "20px 0 0", ...HERO_S, padding: 18 }}>
            <Cap>PRODUTOS COM PESO</Cap>
            <div style={{ marginTop: 6 }}><Big sz={34}>{d.peso_count}</Big></div>
          </div>

          <Sec t="Catálogo" r={<SegPill<"ativos" | "inativos"> opts={[{ v: "ativos", l: "Ativos" }, { v: "inativos", l: "Inativos" }]} value={tab} onChange={setTab} />} />
          {rows.length === 0 ? <Empty>{tab === "ativos" ? "Nenhum produto ativo." : "Nenhum produto inativo."}</Empty> : (
            <div style={{ ...BOX_S, padding: "0 16px" }}>
              {rows.map((p, i) => (
                <div key={p.id} onClick={() => go(`/intranet/produtos/${p.id}`)} style={{ height: 68, display: "flex", alignItems: "center", gap: 12, borderBottom: i === rows.length - 1 ? undefined : `1px solid ${LINE2}`, cursor: "pointer" }}>
                  <Ini name={p.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: GR }}>{p.empresa} · {p.variacoes} {p.variacoes === 1 ? "Cobrança" : "Cobranças"}{p.gera_caixa ? "" : " · Sem Caixa"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em", color: PU }}>{p.pts === null ? "—" : n0(p.pts)}</div>
                    <div style={{ fontSize: 11.5, color: GR }}>Pontos</div>
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
