import { useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { mesLabel, mesNome, n0 } from "@/lib/comercial/format";
import { BOX_S, Btn, ICheck, IChevG, Big, ErrorBox, GR, HERO_S, LINE2, Loading, PU, Sec, Shell } from "@/components/comercial/kit";
import { Cap11 as Cap, FootBox } from "@/components/comercial/gestao/shared";
import { useMe } from "@/components/comercial/gestao/hooks";

type Etapa = { key: "produtos" | "vendedores" | "sugestao" | "parametros" | "meses"; label: string; value: string; done: boolean; state: "done" | "now" | "todo" };
type HubData = { proximo: string; concluidas: number; total: number; etapas: Etapa[]; atual: string; vendas_pts: number };

const ROTA: Record<Etapa["key"], string> = {
  produtos: "/intranet/produtos",
  vendedores: "/intranet/vendedores",
  sugestao: "/intranet/sugestao",
  parametros: "/intranet/parametros/meta",
  meses: "/intranet/meses",
};

/** Menu do Comercial (gestor/admin): preparar o próximo mês em 5 etapas + acompanhamento do mês em vigor. */
export default function Hub() {
  const go = useNavigate();
  const me = useMe();
  const isMgr = !!me.data && (me.data.is_manager || me.data.is_admin);
  const hub = useQuery({ queryKey: ["cm", "hub"], queryFn: () => cm<HubData>("cm_hub"), enabled: isMgr });

  if (me.data && !isMgr) return <Navigate to="/intranet/vendas" replace />;
  const d = hub.data;
  const now = d?.etapas.find((e) => e.state === "now");

  return (
    <Shell title="Comercial" back={null} nav="Menu" pad="4px 24px 0"
      footer={now ? <FootBox><Btn w="100%" style={{ fontSize: 15 }} onClick={() => go(ROTA[now.key])}>Continuar · {now.label}</Btn></FootBox> : undefined}>
      {me.isLoading || hub.isLoading ? <Loading /> : me.error || hub.error ? <ErrorBox e={me.error ?? hub.error} /> : d && (
        <>
          <div style={{ margin: "20px 0 0", ...HERO_S, padding: 18 }}>
            <Cap>PREPARAR {mesLabel(d.proximo).toUpperCase()}</Cap>
            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
              <Big sz={34}>{d.concluidas} de {d.total}</Big>
              <span style={{ fontSize: 13, color: GR }}>Etapas Concluídas</span>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
              {Array.from({ length: d.total }, (_, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < d.concluidas ? PU : "#e6dcf2" }} />)}
            </div>
          </div>

          <Sec t="Etapas" />
          <div style={{ ...BOX_S, padding: "0 16px" }}>
            {d.etapas.map((e, i) => {
              const last = i === d.etapas.length - 1;
              const circ = e.state === "done"
                ? <div style={{ width: 32, height: 32, borderRadius: 16, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><ICheck /></div>
                : e.state === "now"
                  ? <div style={{ width: 32, height: 32, borderRadius: 16, background: PU, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flex: "none" }}>{i + 1}</div>
                  : <div style={{ width: 32, height: 32, boxSizing: "border-box", borderRadius: 16, border: "1.5px solid #d2c5e3", color: GR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flex: "none" }}>{i + 1}</div>;
              return (
                <div key={e.key} onClick={() => go(ROTA[e.key])} style={{ height: 64, display: "flex", alignItems: "center", gap: 12, borderBottom: last ? undefined : `1px solid ${LINE2}`, cursor: "pointer" }}>
                  {circ}
                  <div style={{ flex: 1, fontSize: 14, ...(e.state === "now" ? { fontWeight: 600 } : {}) }}>{e.label}</div>
                  <span style={{ color: PU, fontWeight: 600, fontSize: 14 }}>{e.value}</span>
                  <IChevG />
                </div>
              );
            })}
          </div>

          <Sec t={`Acompanhar ${mesNome(d.atual)}`} />
          <div style={{ ...BOX_S, padding: "0 16px" }}>
            <div onClick={() => go("/intranet/vendas")} style={{ height: 64, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ flex: 1, fontSize: 14 }}>Vendas</div>
              <span style={{ color: PU, fontWeight: 600, fontSize: 14 }}>{n0(d.vendas_pts)} pts</span>
              <IChevG />
            </div>
          </div>
          <div style={{ height: 4 }} />
        </>
      )}
    </Shell>
  );
}
