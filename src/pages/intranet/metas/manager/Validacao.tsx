import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TwoStepConfirm } from "@/components/intranet/TwoStepConfirm";
import { Btn, Chip, Empty, ErrorBox, Field, Input, Loading, Modal, MonthNav, PageHeader, SaleChip, Select, Textarea } from "@/components/intranet/ui";
import { cancelSale, decideFloor, getParams, listProducts, listProfiles, listSales, runValidation, setItemQty } from "@/lib/intranet/api";
import { brl, dmy, monthLabel, monthStart } from "@/lib/intranet/format";
import type { Sale } from "@/lib/intranet/types";

const nm = (p?: { full_name: string | null; nickname: string | null } | null) => p?.nickname || p?.full_name || "—";

const Validacao = () => {
  const qc = useQueryClient();
  const [month, setMonth] = useState(monthStart());
  const [status, setStatus] = useState("");
  const [seller, setSeller] = useState("");
  const [cancel, setCancel] = useState<Sale | null>(null);
  const [reason, setReason] = useState("");
  const [edit, setEdit] = useState<Sale | null>(null);
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [confirmQty, setConfirmQty] = useState(false);

  const sales = useQuery({ queryKey: ["mgr-sales", month, status, seller], queryFn: () => listSales({ month, status: status || undefined, seller: seller || undefined }) });
  const products = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const people = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const params = useQuery({ queryKey: ["params"], queryFn: getParams });
  const pname = useMemo(() => new Map((products.data ?? []).map((p) => [p.id, p.name])), [products.data]);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["mgr-sales"] }); qc.invalidateQueries({ queryKey: ["mgr-summary"] }); qc.invalidateQueries({ queryKey: ["notices"] }); };
  const err = (e: Error) => toast.error(e.message);

  const floor = useMutation({ mutationFn: (v: { id: string; ok: boolean }) => decideFloor(v.id, v.ok), onSuccess: () => { toast.success("Decisão registrada."); refresh(); }, onError: err });
  const doCancel = useMutation({ mutationFn: () => cancelSale(cancel!.id, reason.trim()), onSuccess: () => { toast.success("Venda cancelada."); setCancel(null); setReason(""); refresh(); }, onError: err });
  const validate = useMutation({ mutationFn: runValidation, onSuccess: (n) => { toast.success(`${n ?? 0} venda(s) validada(s).`); refresh(); }, onError: err });

  const openEdit = (s: Sale) => { setEdit(s); setQtys(Object.fromEntries((s.sale_items ?? []).map((i) => [i.id, String(i.qty_override ?? i.qty)]))); };
  const changed = (edit?.sale_items ?? []).filter((i) => Number(qtys[i.id]) !== (i.qty_override ?? i.qty) && qtys[i.id] !== "" && Number(qtys[i.id]) >= 0);
  const saveQty = async () => { for (const i of changed) await setItemQty(i.id, Number(qtys[i.id])); toast.success("Quantidades atualizadas."); setEdit(null); refresh(); };

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Vendas e validação" right={<div className="ix-row ix-wrapflex"><MonthNav month={month} onChange={setMonth} label={monthLabel(month)} /><Btn kind="secondary" size="sm" busy={validate.isPending} onClick={() => validate.mutate()}>Validar agora</Btn></div>} />
      <p className="ix-muted ix-small" style={{ margin: "-12px 0 18px" }}>Vendas validam sozinhas após {params.data?.dias_validar ?? 10} dias.</p>
      <div className="ix-grid c3 ix-cards2" style={{ marginBottom: 6 }}>
        <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status"><option value="">Todos</option><option value="pending">Pendente</option><option value="validated">Validada</option><option value="cancelled">Cancelada</option></Select></Field>
        <Field label="Vendedor"><Select value={seller} onChange={(e) => setSeller(e.target.value)} aria-label="Filtrar por vendedor"><option value="">Todos</option>{(people.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.nickname || p.full_name || p.email}</option>)}</Select></Field>
      </div>
      {sales.isLoading ? <Loading rows={4} /> : sales.error ? <ErrorBox error={sales.error} /> : (sales.data ?? []).length === 0 ? <Empty>Nenhuma venda encontrada.</Empty> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Vendedor</th><th>Cliente</th><th>Data</th><th>Produtos</th><th className="r">Total</th><th>Status</th><th>Sinais</th><th>Ações</th></tr></thead>
            <tbody>
              {sales.data!.map((s) => (
                <tr key={s.id}>
                  <td><b>{nm(s.profiles)}</b></td>
                  <td>{s.client_name}</td>
                  <td>{dmy(s.sale_date)}</td>
                  <td className="ix-small">{(s.sale_items ?? []).map((i) => `${i.qty_override ?? i.qty}× ${pname.get(i.product_id) ?? "produto"}`).join(", ")}</td>
                  <td className="r">{brl(s.total_value)}</td>
                  <td><SaleChip status={s.status} floor={s.floor_status} /></td>
                  <td><div className="ix-row" style={{ gap: 6, flexWrap: "wrap" }}>{s.dup_flag && <Chip tone="pending">Possível duplicada</Chip>}{(s.floor_status === "needs_approval" || s.floor_status === "rejected") && <Chip tone={s.floor_status === "rejected" ? "error" : "pending"}>{s.floor_status === "rejected" ? "Piso rejeitado" : "Abaixo do piso"}</Chip>}</div></td>
                  <td>
                    <div className="ix-row" style={{ gap: 6, flexWrap: "wrap" }}>
                      {s.floor_status === "needs_approval" && <><Btn size="sm" onClick={() => floor.mutate({ id: s.id, ok: true })} disabled={floor.isPending}>Aprovar piso</Btn><Btn kind="danger" size="sm" onClick={() => floor.mutate({ id: s.id, ok: false })} disabled={floor.isPending}>Rejeitar</Btn></>}
                      {s.status !== "cancelled" && <Btn kind="secondary" size="sm" onClick={() => openEdit(s)}>Quantidades</Btn>}
                      {s.status === "pending" && <Btn kind="ghost" size="sm" onClick={() => { setCancel(s); setReason(""); }}>Cancelar</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!cancel} onClose={() => setCancel(null)} title="Cancelar venda"
        footer={<><Btn kind="ghost" onClick={() => setCancel(null)}>Voltar</Btn><Btn kind="danger" busy={doCancel.isPending} disabled={!reason.trim()} onClick={() => doCancel.mutate()}>Cancelar venda</Btn></>}>
        <p className="ix-muted" style={{ marginTop: 0 }}>{cancel?.client_name} · {brl(cancel?.total_value)}</p>
        <Field label="Motivo"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo do cancelamento" /></Field>
      </Modal>

      <Modal open={!!edit && !confirmQty} onClose={() => setEdit(null)} title="Quantidades"
        footer={<><Btn kind="ghost" onClick={() => setEdit(null)}>Fechar</Btn><Btn disabled={changed.length === 0} onClick={() => setConfirmQty(true)}>Salvar</Btn></>}>
        <div style={{ display: "grid", gap: 12 }}>
          {(edit?.sale_items ?? []).map((i) => (
            <Field key={i.id} label={`${pname.get(i.product_id) ?? "Produto"} (original: ${i.qty})`}>
              <Input type="number" min={0} step="any" value={qtys[i.id] ?? ""} onChange={(e) => setQtys({ ...qtys, [i.id]: e.target.value })} aria-label={`Quantidade de ${pname.get(i.product_id) ?? "produto"}`} />
            </Field>
          ))}
        </div>
      </Modal>
      <TwoStepConfirm open={confirmQty} hideWhen title="Confirmar quantidades" onClose={() => setConfirmQty(false)}
        summary={<>{changed.map((i) => <div key={i.id}><b>{pname.get(i.product_id) ?? "Produto"}</b>: {i.qty_override ?? i.qty} → {qtys[i.id]}</div>)}<div className="ix-small ix-muted">Muda os pontos da venda e o atingimento.</div></>}
        onConfirm={async () => { await saveQty(); }} />
    </>
  );
};
export default Validacao;
