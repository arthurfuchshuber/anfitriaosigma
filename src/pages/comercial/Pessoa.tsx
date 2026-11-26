import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BOX_S, Btn, Empty, ErrorBox, GR, HERO_S, IChev, ILock, LINE2, Loading, PU, Sec, SORA, Shell } from "@/components/comercial/kit";
import { FootBox, Ini, Pop, PopItem } from "@/components/comercial/gestao/shared";
import { ACCESS_LABEL, NegarAcesso, ROLE_LABEL, usePeople, usePeopleActions, type Role } from "@/components/comercial/gestao/pessoas";

const F = ({ l, last, children, onClick }: { l: string; last?: boolean; children: ReactNode; onClick?: () => void }) => (
  <div onClick={onClick} style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: onClick ? "pointer" : undefined }}>
    <span>{l}</span><span style={{ color: PU, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{children}</span>
  </div>
);

/** Ficha da pessoa: papel (admin), acesso ao Comercial e vínculo com o cadastro de vendedor. */
export default function Pessoa() {
  const { id } = useParams();
  const go = useNavigate();
  const q = usePeople();
  const { decide, role } = usePeopleActions();
  const [pop, setPop] = useState(false);
  const [neg, setNeg] = useState(false);
  const d = q.data;
  const p = d?.people.find((x) => x.id === id);
  const back = "/intranet/pessoas";

  if (q.isLoading) return <Shell title="Pessoa" back={back} nav="Menu"><Loading /></Shell>;
  if (q.error) return <Shell title="Pessoa" back={back} nav="Menu"><ErrorBox e={q.error} /></Shell>;
  if (!d || !p) return <Shell title="Pessoa" back={back} nav="Menu"><Empty>Pessoa não encontrada.</Empty></Shell>;

  const canRole = d.is_admin && !p.protegido && p.id !== d.me;
  const efetivo = p.role === "closer";          // gestor/admin passam pelo acesso sempre
  const err = (decide.error ?? role.error) as Error | null;
  const pend = p.access === "pending";
  const footer = (
    <FootBox>
      <div style={{ display: "flex", gap: 10 }}>
        {pend ? (
          <>
            <Btn kind="danger" onClick={() => setNeg(true)}>Negar</Btn>
            <Btn disabled={decide.isPending} onClick={() => decide.mutate({ id: p.id, approve: true })}>Aprovar Acesso</Btn>
          </>
        ) : p.access === "denied" || p.access === "none" ? (
          <>
            <Btn kind="outline" w={96} style={{ fontSize: 14 }} onClick={() => go(back)}>Voltar</Btn>
            <Btn disabled={decide.isPending} onClick={() => decide.mutate({ id: p.id, approve: true })}>Aprovar Acesso</Btn>
          </>
        ) : (
          <>
            <Btn kind="outline" w={96} style={{ fontSize: 14 }} onClick={() => go(back)}>Voltar</Btn>
            {p.seller_id
              ? <Btn onClick={() => go(`/intranet/vendedores/${p.seller_id}`)}>Abrir Vendedor</Btn>
              : <Btn onClick={() => go(`/intranet/vendedores/novo?user=${p.id}`)}>Cadastrar como Vendedor</Btn>}
          </>
        )}
      </div>
    </FootBox>
  );

  return (
    <Shell title="Pessoa" back={back} nav="Menu" pad="4px 24px 0" footer={footer}>
      <div style={{ margin: "20px 0 0", ...HERO_S, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <Ini name={p.name} sz={56} fs={19} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 19, letterSpacing: "-0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
          <div style={{ marginTop: 2, fontSize: 12.5, color: "#6b6379", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
        </div>
      </div>

      <Sec t="Acesso e Papel" />
      <div style={{ position: "relative", ...BOX_S, padding: "0 16px" }}>
        <F l="Papel" onClick={canRole ? () => setPop(!pop) : undefined}>
          {ROLE_LABEL[p.role]}{canRole ? <IChev /> : <ILock c={GR} w={15} />}
        </F>
        <F l="Acesso ao Comercial">{ACCESS_LABEL[p.access]}</F>
        <F l="Cadastro">{p.cadastro_ok ? "Completo" : "Pendente"}</F>
        <F l="Vendedor" last onClick={p.seller_id ? () => go(`/intranet/vendedores/${p.seller_id}`) : undefined}>
          {p.seller_id ? (p.seller_active ? "Ativo" : "Inativo") : "Sem Cadastro"}
        </F>
        {pop && (
          <Pop top={50} onClose={() => setPop(false)}>
            {(["closer", "gestor", "admin"] as Role[]).map((r) => (
              <PopItem key={r} on={r === p.role} onClick={() => { setPop(false); if (r !== p.role) role.mutate({ id: p.id, role: r }); }}>{ROLE_LABEL[r]}</PopItem>
            ))}
          </Pop>
        )}
      </div>
      {p.note && p.access === "denied" && <div style={{ margin: "8px 4px 0", fontSize: 12, color: GR }}>{p.note}</div>}

      {p.access === "approved" && efetivo && !p.protegido && p.id !== d.me && (
        <div style={{ marginTop: 12, display: "flex" }}><Btn kind="danger" onClick={() => setNeg(true)}>Revogar Acesso</Btn></div>
      )}
      <div style={{ height: 4 }} />
      {err && <ErrorBox e={err} />}
      {neg && (
        <NegarAcesso person={p} busy={decide.isPending} error={decide.error ? (decide.error as Error).message : undefined} onCancel={() => { setNeg(false); decide.reset(); }}
          onConfirm={(note) => decide.mutate({ id: p.id, approve: false, note }, { onSuccess: () => setNeg(false) })} />
      )}
    </Shell>
  );
}
