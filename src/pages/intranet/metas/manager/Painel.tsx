import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Lock } from "lucide-react";
import { Avatar, Banner, Btn, Card, Chip, Empty, ErrorBox, Loading, Modal, MonthNav, PageHeader } from "@/components/intranet/ui";
import { confirmGoalLock, getGoalLocks, getParams, listNotices, listSales, monthSummary, resolveNotice } from "@/lib/intranet/api";
import { addMonths, brl, monthLabel, monthStart, pct } from "@/lib/intranet/format";
import { commissionRatio } from "@/lib/intranet/calc";

const B = "/intranet/metas";
const nm = (r: { full_name: string | null; nickname: string | null }) => r.nickname || r.full_name || "—";

const Kpi = ({ l, v, s }: { l: string; v: string; s?: string }) => (
  <Card><div className="ix-kpi"><span className="l">{l}</span><span className="v">{v}</span>{s && <span className="ix-faint ix-small">{s}</span>}</div></Card>
);

const Painel = () => {
  const [month, setMonth] = useState(monthStart());
  const go = useNavigate();
  const qc = useQueryClient();
  const [confirmLock, setConfirmLock] = useState(false);
  const sum = useQuery({ queryKey: ["mgr-summary", month], queryFn: () => monthSummary(month) });
  const params = useQuery({ queryKey: ["params"], queryFn: getParams });
  const locks = useQuery({ queryKey: ["goal-locks"], queryFn: getGoalLocks });
  const notices = useQuery({ queryKey: ["notices"], queryFn: listNotices });
  const sales = useQuery({ queryKey: ["mgr-sales", month, "floor"], queryFn: () => listSales({ month }) });

  const lock = useMutation({
    mutationFn: (m: string) => confirmGoalLock(m),
    onSuccess: () => { toast.success("Meta fechada."); setConfirmLock(false); qc.invalidateQueries({ queryKey: ["goal-locks"] }); qc.invalidateQueries({ queryKey: ["mgr-summary"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const resolve = useMutation({
    mutationFn: resolveNotice, onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }), onError: (e: Error) => toast.error(e.message),
  });

  const rows = sum.data ?? [];
  const goal = rows.reduce((a, r) => a + r.goal, 0);
  const validated = rows.reduce((a, r) => a + r.validated, 0);
  const pending = rows.reduce((a, r) => a + r.pending, 0);
  const caixa = rows.reduce((a, r) => a + r.caixa, 0);
  const bonus = rows.reduce((a, r) => a + r.bonus, 0);
  const ratio = commissionRatio(bonus, caixa);
  const limit = params.data?.limite_comissao ?? 0.15;
  const floorN = (sales.data ?? []).filter((s) => s.floor_status === "needs_approval").length;

  // meta do próximo mês (sempre em relação a hoje)
  const today = new Date();
  const nextM = addMonths(monthStart(today), 1);
  const cutDay = params.data?.dia_corte ?? 25;
  const cutDate = new Date(today.getFullYear(), today.getMonth(), cutDay);
  const days = Math.ceil((cutDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  const locked = (locks.data ?? []).some((l) => l.month === nextM);
  const nextName = monthLabel(nextM).split(" de ")[0];
  const cutLabel = `${String(cutDay).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`;

  const goalBanner = !locks.data || !params.data ? null : locked
    ? <div><Chip><Lock size={12} /> Meta de {nextName} fechada</Chip></div>
    : days > 0
      ? <Banner action={<Link to={`${B}/metas`}><Btn kind="secondary" size="sm">Revisar meta</Btn></Link>}>Meta de {nextName} será fixada em {days} {days === 1 ? "dia" : "dias"} ({cutLabel})</Banner>
      : <Banner action={<Btn size="sm" onClick={() => setConfirmLock(true)}>Confirmar meta</Btn>}>Confirme a meta fechada de {nextName}</Banner>;

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Painel" right={<MonthNav month={month} onChange={setMonth} label={monthLabel(month)} />} />
      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        {goalBanner}
        {ratio !== null && ratio > limit && (
          <Banner error><AlertTriangle size={18} style={{ flex: "none" }} /><span className="grow">Comissão ÷ caixa em {pct(ratio, 1)}, acima do limite de {pct(limit, 1)}.</span></Banner>
        )}
        {floorN > 0 && (
          <Banner action={<Link to={`${B}/validacao`}><Btn kind="secondary" size="sm">Ver</Btn></Link>}>{floorN} {floorN === 1 ? "venda aguarda" : "vendas aguardam"} aprovação de piso</Banner>
        )}
      </div>

      {sum.isLoading ? <Loading rows={4} /> : sum.error ? <ErrorBox error={sum.error} /> : (
        <>
          <div className="ix-grid c4" style={{ marginBottom: 20 }}>
            <Kpi l="Soma das metas" v={brl(goal)} s={`${rows.length} ${rows.length === 1 ? "vendedor" : "vendedores"}`} />
            <Kpi l="Validado" v={brl(validated)} />
            <Kpi l="Pendente" v={brl(pending)} />
            <Kpi l="Atingimento do time" v={pct(goal > 0 ? validated / goal : 0)} />
          </div>
          <div className="ix-grid c2" style={{ marginBottom: 28 }}>
            <Kpi l="Caixa" v={brl(caixa)} />
            <Kpi l="Comissão ÷ caixa" v={ratio === null ? "—" : pct(ratio, 1)} s={`Limite ${pct(limit, 1)}`} />
          </div>

          <h2 className="ix-h2 hd" style={{ marginBottom: 14 }}>Vendedores</h2>
          {rows.length === 0 ? <Empty>Nenhum vendedor ativo neste mês.</Empty> : (
            <div className="ix-table-wrap" style={{ marginBottom: 32 }}>
              <table className="ix-table">
                <thead><tr><th>Vendedor</th><th>Rampa</th><th className="r">Meta</th><th className="r">Validado</th><th className="r">Pendente</th><th style={{ minWidth: 160 }}>Atingimento</th><th className="r">Bônus</th><th className="r">Total</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user_id} className="click" tabIndex={0} onClick={() => go(`${B}/vendedor/${r.user_id}`)} onKeyDown={(e) => e.key === "Enter" && go(`${B}/vendedor/${r.user_id}`)}>
                      <td><div className="ix-row"><Avatar name={nm(r)} size={34} /><b>{nm(r)}</b></div></td>
                      <td><Chip tone={r.ramp < 1 ? "pending" : undefined}>{pct(r.ramp)}</Chip></td>
                      <td className="r">{brl(r.goal)}</td><td className="r">{brl(r.validated)}</td><td className="r">{brl(r.pending)}</td>
                      <td><div className="ix-row"><div className="ix-bar" style={{ flex: 1 }}><i style={{ width: `${Math.min(r.attainment, 1) * 100}%` }} /></div><span className="ix-num ix-small">{pct(r.attainment)}</span></div></td>
                      <td className="r">{brl(r.bonus)}</td><td className="r"><b>{brl(r.total_pay)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <h2 className="ix-h2 hd" style={{ marginBottom: 14 }}>Avisos</h2>
      {notices.isLoading ? <Loading rows={2} /> : notices.error ? <ErrorBox error={notices.error} /> : (notices.data ?? []).length === 0 ? <Empty>Nenhum aviso pendente.</Empty> : (
        <div style={{ display: "grid", gap: 10 }}>
          {notices.data!.map((n) => (
            <Card key={n.id} style={{ padding: 16 }}>
              <div className="ix-row ix-between ix-wrapflex">
                <div><b>{n.title}</b>{n.body && <div className="ix-muted ix-small">{n.body}</div>}</div>
                <div className="ix-row">
                  {n.kind === "access_request" && <Link to={`${B}/pessoas?tab=solicitacoes`}><Btn kind="secondary" size="sm">Ver pedido</Btn></Link>}
                  {(n.kind === "floor" || n.kind === "duplicate") && <Link to={`${B}/validacao`}><Btn kind="secondary" size="sm">Ver venda</Btn></Link>}
                  {n.kind !== "access_request" && <Btn kind="ghost" size="sm" onClick={() => resolve.mutate(n.id)} disabled={resolve.isPending}>Resolver</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={confirmLock} onClose={() => setConfirmLock(false)} title={`Fechar meta de ${nextName}`}
        footer={<><Btn kind="ghost" onClick={() => setConfirmLock(false)}>Cancelar</Btn><Btn busy={lock.isPending} onClick={() => lock.mutate(nextM)}>Confirmar meta fechada</Btn></>}>
        <p className="ix-muted" style={{ margin: 0 }}>Depois de confirmada, as metas de {monthLabel(nextM)} não mudam mais.</p>
      </Modal>
    </>
  );
};
export default Painel;
