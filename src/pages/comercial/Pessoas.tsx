import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BOX_S, Btn, Big, Empty, ErrorBox, GR, HERO_S, HRow, LINE2, Loading, PU, Sec, Shell, SORA } from "@/components/comercial/kit";
import { Cap11 as Cap, Ini, SegPill } from "@/components/comercial/gestao/shared";
import { AcessoChip, NegarAcesso, ROLE_LABEL, haQuanto, usePeople, usePeopleActions, type Person } from "@/components/comercial/gestao/pessoas";

/** Pessoas do Comercial: solicitações de acesso (aprovar/negar) e equipe (papel, acesso, vendedor). RPC: cm_people_list. */
export default function Pessoas() {
  const go = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") === "equipe" ? "equipe" : "solicitacoes";
  const q = usePeople();
  const { decide } = usePeopleActions();
  const [neg, setNeg] = useState<Person | null>(null);
  const d = q.data;
  const pend = d?.people.filter((p) => p.access === "pending") ?? [];
  const team = d?.people.filter((p) => p.access !== "pending") ?? [];
  const n = (a: string) => d?.people.filter((p) => p.access === a).length ?? 0;

  return (
    <Shell title="Pessoas" back="/intranet/metas" nav="Menu" pad="4px 24px 0">
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox e={q.error} /> : d && (
        <>
          <div style={{ margin: "20px 0 0", ...HERO_S, padding: "18px 18px 0" }}>
            <Cap>PESSOAS · COMERCIAL</Cap>
            <div style={{ marginTop: 6 }}><Big sz={34}>{d.people.length}</Big></div>
            <div style={{ marginTop: 14, borderTop: "1px solid #e6dcf2" }}>
              <HRow l="Pendentes" r={n("pending")} /><HRow l="Aprovadas" r={n("approved")} /><HRow l="Negadas" r={n("denied")} last />
            </div>
          </div>

          <Sec t="Pessoas" r={<SegPill<"solicitacoes" | "equipe"> opts={[{ v: "solicitacoes", l: "Solicitações" }, { v: "equipe", l: "Equipe" }]} value={tab} onChange={(v) => setSp(v === "equipe" ? { tab: "equipe" } : {}, { replace: true })} />} />

          {tab === "solicitacoes" ? (
            pend.length === 0 ? <Empty>Nenhuma solicitação pendente.</Empty> : (
              <div style={{ ...BOX_S, padding: "0 16px" }}>
                {pend.map((p, i) => (
                  <div key={p.id} style={{ padding: "14px 0", borderBottom: i === pend.length - 1 ? undefined : `1px solid ${LINE2}` }}>
                    <div onClick={() => go(`/intranet/pessoas/${p.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <Ini name={p.name} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: GR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                      </div>
                      <div style={{ fontSize: 11.5, color: GR, whiteSpace: "nowrap" }}>{haQuanto(p.requested_at)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <Btn kind="danger" style={{ height: 40, fontSize: 14 }} onClick={() => setNeg(p)}>Negar</Btn>
                      <Btn disabled={decide.isPending} style={{ height: 40, fontSize: 14 }} onClick={() => decide.mutate({ id: p.id, approve: true })}>Aprovar</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : team.length === 0 ? <Empty>Nenhuma pessoa na equipe.</Empty> : (
            <div style={{ ...BOX_S, padding: "0 16px" }}>
              {team.map((p, i) => (
                <div key={p.id} onClick={() => go(`/intranet/pessoas/${p.id}`)} style={{ height: 72, display: "flex", alignItems: "center", gap: 12, borderBottom: i === team.length - 1 ? undefined : `1px solid ${LINE2}`, cursor: "pointer" }}>
                  <Ini name={p.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: GR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                  </div>
                  <div style={{ textAlign: "right", flex: "none" }}>
                    {p.access === "approved"
                      ? <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em", color: PU }}>{ROLE_LABEL[p.role]}</div>
                      : <AcessoChip a={p.access} />}
                    <div style={{ fontSize: 11.5, color: GR }}>{p.seller_id ? "Vendedor" : "Sem Cadastro"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ height: 4 }} />
          {decide.error && <ErrorBox e={decide.error} />}
        </>
      )}
      {neg && (
        <NegarAcesso person={neg} busy={decide.isPending} error={decide.error ? (decide.error as Error).message : undefined} onCancel={() => { setNeg(null); decide.reset(); }}
          onConfirm={(note) => decide.mutate({ id: neg.id, approve: false, note }, { onSuccess: () => setNeg(null) })} />
      )}
    </Shell>
  );
}
