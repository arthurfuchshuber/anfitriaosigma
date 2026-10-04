import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Btn, Chip, Empty, ErrorBox, Loading, Modal, MonthNav, PageHeader } from "@/components/intranet/ui";
import { closeMonth, getClosures, getParams, invoiceUrl, listInvoices, monthSummary, setInvoiceStatus } from "@/lib/intranet/api";
import { downloadCsv } from "@/lib/intranet/csv";
import { addMonths, brl, monthLabel, monthStart, pct } from "@/lib/intranet/format";
import type { Invoice } from "@/lib/intranet/types";

const nm = (r: { full_name: string | null; nickname: string | null }) => r.full_name || r.nickname || "—";
const INV: Record<Invoice["status"], string> = { pendente: "Pendente", enviada: "Enviada", aprovada: "Aprovada", paga: "Paga" };

const Fechamento = () => {
  const qc = useQueryClient();
  const [month, setMonth] = useState(addMonths(monthStart(), -1));
  const [confirm, setConfirm] = useState(false);
  const sum = useQuery({ queryKey: ["mgr-summary", month], queryFn: () => monthSummary(month) });
  const inv = useQuery({ queryKey: ["invoices", month], queryFn: () => listInvoices(month) });
  const closures = useQuery({ queryKey: ["closures"], queryFn: getClosures });
  const params = useQuery({ queryKey: ["params"], queryFn: getParams });

  const closed = (closures.data ?? []).some((c) => c.month === month);
  const rows = sum.data ?? [];
  const byUser = new Map((inv.data ?? []).map((i) => [i.user_id, i]));
  const tot = rows.reduce((a, r) => ({ fixo: a.fixo + r.salary, bonus: a.bonus + r.bonus, total: a.total + r.total_pay }), { fixo: 0, bonus: 0, total: 0 });
  const [y, m] = month.split("-").map(Number);
  const open = new Date(y, m, 1 + (params.data?.retroativo_dias ?? 20)); // 1º dia após a janela (fim do mês + N dias)
  const windowOk = new Date() >= open;

  const err = (e: Error) => toast.error(e.message);
  const setSt = useMutation({
    mutationFn: (v: { u: string; s: string }) => setInvoiceStatus(v.u, month, v.s),
    onSuccess: () => { toast.success("Nota atualizada."); qc.invalidateQueries({ queryKey: ["invoices", month] }); }, onError: err,
  });
  const close = useMutation({
    mutationFn: () => closeMonth(month),
    onSuccess: () => { toast.success("Mês fechado."); setConfirm(false); qc.invalidateQueries({ queryKey: ["closures"] }); qc.invalidateQueries({ queryKey: ["mgr-summary"] }); },
    onError: (e: Error) => { toast.error(e.message); setConfirm(false); },
  });
  const openFile = async (path: string) => { const u = await invoiceUrl(path); if (u) window.open(u, "_blank", "noopener"); else toast.error("Arquivo indisponível."); };

  const exportCsv = () => downloadCsv(`folha-${month.slice(0, 7)}.csv`, [
    ["Vendedor", "Fixo", "Atingimento", "Bônus", "Total", "Nota fiscal"],
    ...rows.map((r) => [nm(r), r.salary.toFixed(2), `${(r.attainment * 100).toFixed(1)}%`, r.bonus.toFixed(2), r.total_pay.toFixed(2), INV[byUser.get(r.user_id)?.status ?? "pendente"]]),
    ["Total", tot.fixo.toFixed(2), "", tot.bonus.toFixed(2), tot.total.toFixed(2), ""],
  ]);

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Fechamento" right={
        <div className="ix-row ix-wrapflex">
          <MonthNav month={month} onChange={setMonth} label={monthLabel(month)} />
          <Btn kind="secondary" size="sm" onClick={exportCsv} disabled={rows.length === 0}>Exportar CSV</Btn>
          {closed ? <Chip><Lock size={12} /> Mês fechado</Chip> : <Btn size="sm" disabled={!windowOk} title={windowOk ? undefined : "Disponível após a janela de lançamento retroativo"} onClick={() => setConfirm(true)}>Fechar mês</Btn>}
        </div>} />
      {sum.isLoading ? <Loading rows={4} /> : sum.error ? <ErrorBox error={sum.error} /> : rows.length === 0 ? <Empty>Sem folha neste mês.</Empty> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Vendedor</th><th className="r">Fixo</th><th className="r">Atingimento</th><th className="r">Bônus</th><th className="r">Total</th><th>Nota fiscal</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => {
                const i = byUser.get(r.user_id);
                return (
                  <tr key={r.user_id}>
                    <td><b>{nm(r)}</b></td>
                    <td className="r">{brl(r.salary)}</td><td className="r">{pct(r.attainment)}</td><td className="r">{brl(r.bonus)}</td><td className="r"><b>{brl(r.total_pay)}</b></td>
                    <td>{i && i.status !== "pendente" ? <Chip tone={i.status === "enviada" ? "pending" : undefined}>{INV[i.status]}</Chip> : <Chip tone="pending">Pendente</Chip>}</td>
                    <td>
                      <div className="ix-row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        {i?.file_path && <Btn kind="ghost" size="sm" onClick={() => openFile(i.file_path!)}>Abrir arquivo</Btn>}
                        {i?.status === "enviada" && <Btn size="sm" disabled={setSt.isPending} onClick={() => setSt.mutate({ u: r.user_id, s: "aprovada" })}>Aprovar</Btn>}
                        {i?.status === "aprovada" && <Btn kind="secondary" size="sm" disabled={setSt.isPending} onClick={() => setSt.mutate({ u: r.user_id, s: "paga" })}>Marcar paga</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr><td><b>Total</b></td><td className="r"><b>{brl(tot.fixo)}</b></td><td /><td className="r"><b>{brl(tot.bonus)}</b></td><td className="r"><b>{brl(tot.total)}</b></td><td /><td /></tr>
            </tbody>
          </table>
        </div>
      )}
      <Modal open={confirm} onClose={() => setConfirm(false)} title={`Fechar ${monthLabel(month)}`}
        footer={<><Btn kind="ghost" onClick={() => setConfirm(false)}>Cancelar</Btn><Btn busy={close.isPending} onClick={() => close.mutate()}>Fechar mês</Btn></>}>
        <p className="ix-muted" style={{ margin: 0 }}>A folha de {monthLabel(month)} fica congelada: {brl(tot.total)} no total.</p>
      </Modal>
    </>
  );
};
export default Fechamento;
