import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, Btn, Card, Chip, Empty, ErrorBox, Field, Input, Loading, Modal, PageHeader } from "@/components/intranet/ui";
import { decideAccess, listAccessRows, listProfiles, type AccessRow } from "@/lib/intranet/api";
import { AREAS, ROLE_LABEL } from "@/lib/intranet/areas";
import { brl, dmy, dmyHm } from "@/lib/intranet/format";

const B = "/intranet/metas";
const areaName = (id: string) => AREAS.find((a) => a.id === id)?.title ?? id;

const Pessoas = () => {
  const [sp] = useSearchParams();
  const tab = sp.get("tab") === "solicitacoes" ? "solicitacoes" : "pessoas";
  const go = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [deciding, setDeciding] = useState<{ row: AccessRow; approve: boolean } | null>(null);
  const [note, setNote] = useState("");
  const people = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const reqs = useQuery({ queryKey: ["access-rows"], queryFn: listAccessRows });

  const decide = useMutation({
    mutationFn: () => decideAccess(deciding!.row.user_id, deciding!.row.area, deciding!.approve, note.trim() || undefined),
    onSuccess: () => { toast.success("Decisão registrada."); setDeciding(null); setNote(""); qc.invalidateQueries({ queryKey: ["access-rows"] }); qc.invalidateQueries({ queryKey: ["notices"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (people.data ?? []).filter((p) => !t || [p.full_name, p.nickname, p.email, p.job_title].some((x) => x?.toLowerCase().includes(t)));
  }, [people.data, q]);
  const sorted = useMemo(() => [...(reqs.data ?? [])].sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1)), [reqs.data]);
  const pendingN = sorted.filter((r) => r.status === "pending").length;

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Pessoas" />
      <div className="ix-tabs" style={{ marginBottom: 22 }}>
        <Link to={`${B}/pessoas`} className={`ix-tab ${tab === "pessoas" ? "on" : ""}`}>Pessoas</Link>
        <Link to={`${B}/pessoas?tab=solicitacoes`} className={`ix-tab ${tab === "solicitacoes" ? "on" : ""}`}>Solicitações{pendingN > 0 ? ` (${pendingN})` : ""}</Link>
      </div>

      {tab === "pessoas" ? (
        <>
          <div style={{ maxWidth: 360 }}><Field><Input placeholder="Buscar pessoa" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar pessoa" /></Field></div>
          {people.isLoading ? <Loading rows={4} /> : people.error ? <ErrorBox error={people.error} /> : list.length === 0 ? <Empty>Pessoas são criadas automaticamente no primeiro login com Google.</Empty> : (
            <div className="ix-table-wrap">
              <table className="ix-table">
                <thead><tr><th>Nome</th><th>Cargo</th><th>Papel</th><th>Regime</th><th>Início</th><th className="r">Salário</th><th>Status</th></tr></thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="click" tabIndex={0} onClick={() => go(`${B}/pessoas/${p.id}`)} onKeyDown={(e) => e.key === "Enter" && go(`${B}/pessoas/${p.id}`)}>
                      <td><div className="ix-row"><Avatar name={p.full_name || p.email} src={p.avatar_url} size={34} /><div><b>{p.full_name || p.email}</b><div className="ix-faint ix-small">{p.email}</div></div></div></td>
                      <td>{p.job_title || "—"}</td>
                      <td><Chip tone={p.role === "closer" ? "muted" : undefined}>{ROLE_LABEL[p.role]}</Chip></td>
                      <td>{p.regime ? p.regime.toUpperCase() : "—"}</td>
                      <td>{dmy(p.start_date)}</td>
                      <td className="r">{p.salary === null ? "—" : brl(p.salary)}</td>
                      <td>{p.active ? <Chip>Ativo</Chip> : <Chip tone="muted">Inativo</Chip>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : reqs.isLoading ? <Loading rows={3} /> : reqs.error ? <ErrorBox error={reqs.error} /> : sorted.length === 0 ? <Empty>Nenhuma solicitação.</Empty> : (
        <div style={{ display: "grid", gap: 10 }}>
          {sorted.map((r) => (
            <Card key={r.id} style={{ padding: 18 }}>
              <div className="ix-row ix-between ix-wrapflex">
                <div className="ix-row">
                  <Avatar name={r.profiles?.full_name || r.profiles?.email || "?"} size={38} />
                  <div><b>{r.profiles?.full_name || r.profiles?.email}</b><div className="ix-muted ix-small">{areaName(r.area)} · {dmyHm(r.requested_at)}</div>{r.note && <div className="ix-faint ix-small">{r.note}</div>}</div>
                </div>
                {r.status === "pending" ? (
                  <div className="ix-row"><Chip tone="pending">Pendente</Chip><Btn size="sm" onClick={() => { setDeciding({ row: r, approve: true }); setNote(""); }}>Aprovar</Btn><Btn kind="danger" size="sm" onClick={() => { setDeciding({ row: r, approve: false }); setNote(""); }}>Negar</Btn></div>
                ) : <Chip tone={r.status === "denied" ? "error" : undefined}>{r.status === "approved" ? "Aprovado" : "Negado"}</Chip>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deciding} onClose={() => setDeciding(null)} title={deciding?.approve ? "Aprovar acesso" : "Negar acesso"}
        footer={<><Btn kind="ghost" onClick={() => setDeciding(null)}>Cancelar</Btn><Btn kind={deciding?.approve ? "primary" : "danger"} busy={decide.isPending} onClick={() => decide.mutate()}>{deciding?.approve ? "Aprovar" : "Negar"}</Btn></>}>
        <p className="ix-muted" style={{ marginTop: 0 }}>{deciding?.row.profiles?.full_name || deciding?.row.profiles?.email} · {deciding && areaName(deciding.row.area)}</p>
        <Field label="Observação (opcional)"><Input value={note} onChange={(e) => setNote(e.target.value)} aria-label="Observação" /></Field>
      </Modal>
    </>
  );
};
export default Pessoas;
