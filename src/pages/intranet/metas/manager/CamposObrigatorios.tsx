import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banner, Btn, Card, Empty, ErrorBox, Loading, Modal, Select } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { getMyPending, pendingPeople, remindPending, requiredFieldStats, setRequiredField, type RequiredStat } from "@/lib/intranet/api";
import { dmy } from "@/lib/intranet/format";
import { PENDING_KEY } from "@/components/intranet/useCadastroForm";

const DOC = { pf: "só PF", pj: "só PJ" } as const;
const err = (e: Error) => toast.error(e.message);

/** Cadastros → Campos obrigatórios: liga/desliga o que é obrigatório e acompanha quem ainda não preencheu. */
const CamposObrigatorios = () => {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const stats = useQuery({ queryKey: ["req-stats"], queryFn: requiredFieldStats });
  const people = useQuery({ queryKey: ["req-people"], queryFn: pendingPeople });
  const mine = useQuery({ queryKey: [PENDING_KEY, profile?.id], queryFn: getMyPending });
  const [ask, setAsk] = useState<RequiredStat | null>(null);
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState("");

  const refresh = () => ["req-stats", "req-people", PENDING_KEY, "ix-required-fields"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const toggle = useMutation({ mutationFn: (v: { key: string; on: boolean }) => setRequiredField(v.key, v.on), onSuccess: () => { toast.success("Campo atualizado."); setAsk(null); setAdding(false); setPick(""); refresh(); }, onError: err });
  const remind = useMutation({ mutationFn: (u: string) => remindPending(u), onSuccess: (n) => toast.success(n > 0 ? "Lembrete enviado." : "Essa pessoa não tem pendências."), onError: err });

  if (stats.isLoading || people.isLoading) return <Loading rows={4} />;
  if (stats.error) return <ErrorBox error={stats.error} />;
  const rows = stats.data ?? [];
  const optional = rows.filter((r) => !r.required);
  const withPending = (people.data ?? []).filter((p) => p.missing > 0);
  const companyPending = mine.data?.company?.length ?? 0;
  const impacted = (r: RequiredStat) => Math.round(((100 - r.filled_pct) / 100) * (people.data?.length ?? 0));

  return (
    <>
      <div className="ix-row ix-between ix-wrapflex" style={{ marginBottom: 14 }}>
        <p className="ix-muted" style={{ margin: 0, maxWidth: 560 }}>Ao ativar um campo, o formulário de pendências aparece no próximo acesso de quem ainda não preencheu — e o acesso fica bloqueado até completar.</p>
        <Btn size="sm" disabled={optional.length === 0} onClick={() => setAdding(true)}>Adicionar campo</Btn>
      </div>
      <Banner>Empresa: {companyPending === 1 ? "1 campo pendente" : `${companyPending} campos pendentes`} · Colaboradores: {withPending.length === 1 ? "1 pessoa com pendências" : `${withPending.length} pessoas com pendências`}</Banner>

      <div className="ix-table-wrap" style={{ marginTop: 16 }}>
        <table className="ix-req-table">
          <thead><tr><th>Campo</th><th>Quem preenche</th><th>Aplica a</th><th>Obrigatório</th><th>Desde</th><th>Preenchido</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} style={{ opacity: r.required ? 1 : 0.75 }}>
                <td>{r.label}</td>
                <td><span className={`ix-chip ${r.scope === "company" ? "muted" : ""}`}>{r.scope === "company" ? "Empresa" : "Colaborador"}</span></td>
                <td className="ix-muted">{r.doc_type ? DOC[r.doc_type] : "todos"}</td>
                <td><button type="button" className={`ix-switch ${r.required ? "on" : ""}`} role="switch" aria-checked={r.required} aria-label={`Obrigatório: ${r.label}`} disabled={toggle.isPending}
                  onClick={() => (r.required ? toggle.mutate({ key: r.key, on: false }) : setAsk(r))} /></td>
                <td className="ix-muted">{r.required ? dmy(r.since) : "—"}</td>
                <td><div className="ix-row" style={{ gap: 10 }}><div className="ix-mini" style={{ flex: 1 }}><i style={{ width: `${r.filled_pct}%` }} /></div><b className="ix-num" style={{ fontSize: 13 }}>{r.filled_pct}%</b></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card style={{ marginTop: 20 }}>
        <h2 className="ix-h3 hd" style={{ marginBottom: 12 }}>Pendências por pessoa</h2>
        {(people.data ?? []).length === 0 ? <Empty>Nenhum colaborador ativo.</Empty> : (
          <div>
            {(people.data ?? []).map((p) => {
              const pct = p.total ? Math.round(((p.total - p.missing) / p.total) * 100) : 100;
              return (
                <div key={p.user_id} className="ix-row ix-wrapflex" style={{ padding: "12px 0", borderTop: "1px solid #e7e2ee", gap: 14 }}>
                  <b style={{ minWidth: 160, flex: "1 1 160px" }}>{p.full_name ?? p.email}</b>
                  <div className="ix-mini" style={{ flex: "2 1 160px" }}><i style={{ width: `${pct}%` }} /></div>
                  <span className="ix-muted ix-small" style={{ minWidth: 100, textAlign: "right" }}>{p.missing === 0 ? "completo" : p.missing === 1 ? "1 pendência" : `${p.missing} pendências`}</span>
                  <Btn kind="secondary" size="sm" disabled={p.missing === 0 || remind.isPending} onClick={() => remind.mutate(p.user_id)}>Lembrar</Btn>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={!!ask} onClose={() => setAsk(null)} title="Tornar obrigatório"
        footer={<><Btn kind="ghost" onClick={() => setAsk(null)}>Cancelar</Btn><Btn busy={toggle.isPending} onClick={() => ask && toggle.mutate({ key: ask.key, on: true })}>Tornar obrigatório</Btn></>}>
        <p className="ix-muted" style={{ marginTop: 0 }}>
          <b style={{ color: "#120a1c" }}>{ask?.label}</b> ({ask?.scope === "company" ? "empresa" : "colaborador"}) passa a ser obrigatório.
          {ask && ask.filled_pct < 100 && <> Quem ainda não preencheu ({ask.scope === "company" ? "gestor/admin" : `cerca de ${impacted(ask)} pessoa(s)`}) fica bloqueado até completar no próximo acesso.</>}
        </p>
      </Modal>
      <Modal open={adding} onClose={() => setAdding(false)} title="Adicionar campo obrigatório"
        footer={<><Btn kind="ghost" onClick={() => setAdding(false)}>Cancelar</Btn><Btn disabled={!pick} busy={toggle.isPending} onClick={() => toggle.mutate({ key: pick, on: true })}>Ativar</Btn></>}>
        <Select aria-label="Campo" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Escolha o campo</option>
          {optional.map((r) => <option key={r.key} value={r.key}>{r.scope === "company" ? "Empresa" : "Colaborador"} · {r.label}</option>)}
        </Select>
      </Modal>
    </>
  );
};
export default CamposObrigatorios;
