import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cm } from "@/lib/comercial/api";
import { Shell, Foot, Btn, Loading, ErrorBox, TextField } from "@/components/comercial/kit";
import { VendaView, type Sale } from "@/components/comercial/vendas/VendaView";
import { FormasEditor, formaPayload, formasOk, type FormaIn, type FormaOpt } from "@/components/comercial/vendas/FormasEditor";
import { Card } from "@/components/comercial/vendas/ui";
import { openComprovante, uploadComprovante } from "@/components/comercial/vendas/comprovante";

const BACK = "/intranet/vendas";

/** /intranet/vendas/:id — Aguardando Pagamento, Em Prazo e (sem desenho próprio) Validada/Cancelada, conforme o estado de cm_sale_get. */
export default function Venda() {
  const { id = "" } = useParams(); const nav = useNavigate(); const qc = useQueryClient(); const { session } = useAuth();
  const saleQ = useQuery({ queryKey: ["cm", "sale", id], queryFn: () => cm<Sale>("cm_sale_get", { p_sale: id }) });
  const meQ = useQuery({ queryKey: ["cm", "me"], queryFn: () => cm<{ today: string }>("cm_me"), staleTime: 60_000 });
  const s = saleQ.data; const today = meQ.data?.today ?? "";
  const optQ = useQuery({ queryKey: ["cm", "products-options"], queryFn: () => cm<{ products: { id: string; formas: FormaOpt[] }[] }>("cm_products_options"), staleTime: 60_000 });

  const [payDate, setPayDate] = useState("");
  const [editing, setEditing] = useState(false);
  const [cliente, setCliente] = useState(""); const [formas, setFormas] = useState<FormaIn[]>([]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [uploading, setUploading] = useState(false); const [err, setErr] = useState<unknown>(null);
  useEffect(() => { if (today && !payDate) setPayDate(today); }, [today, payDate]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["cm", "sale", id] }); qc.invalidateQueries({ queryKey: ["cm", "sales"] }); };
  const run = useMutation({ mutationFn: (f: () => Promise<unknown>) => f(), onSuccess: () => { setErr(null); refresh(); }, onError: setErr });
  const confirm = (payment?: string) => run.mutate(() => cm("cm_confirm_payment", { p_sale: id, p_date: s?.status === "aguardando_pagamento" ? payDate : null, p_payment: payment ?? null }));
  const cancel = useMutation({ mutationFn: () => cm("cm_cancel_sale", { p_sale: id }), onSuccess: () => { refresh(); nav(BACK); }, onError: setErr });

  const startEdit = () => {
    if (!s) return;
    if (!editing) { setCliente(s.cliente); setFormas(s.formas.map((f) => ({ key: f.id, forma: f.forma as FormaIn["forma"], bruto: f.bruto, parcelas: f.parcelas, data: f.data, touched: true }))); }
    setEditing(!editing);
  };
  const saveEdit = () => run.mutate(async () => {
    await cm("cm_update_sale", { p_sale: id, p: { cliente, pago: false, data_pagamento: formas[0]?.data, formas: formas.map(formaPayload) } });
    setEditing(false);
  });
  const onFile = async (f: File) => {
    if (!session?.user.id) return;
    setUploading(true);
    try { const path = await uploadComprovante(f, session.user.id); await cm("cm_update_sale", { p_sale: id, p: { comprovante: path } }); refresh(); setErr(null); } catch (e) { setErr(e); } finally { setUploading(false); }
  };
  const goCancel = () => (s!.status === "em_prazo" && s!.congelado ? nav(`${BACK}/${id}/cancelar`) : setConfirmCancel(true));

  const prodFormas = optQ.data?.products.find((p) => p.id === s?.product_id)?.formas ?? [];
  const editor = (
    <>
      <Card><div style={{ height: 60, display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}><span>Cliente</span><div style={{ flex: 1 }}><TextField value={cliente} onChange={setCliente} h={44} /></div></div></Card>
      <div style={{ height: 12 }} />
      <FormasEditor formas={formas} opts={prodFormas} onChange={setFormas} bare />
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <Btn kind="outline" w={96} onClick={() => setEditing(false)}>Voltar</Btn>
        <Btn disabled={run.isPending || !cliente.trim() || !formasOk(formas)} onClick={saveEdit}>Salvar Alterações</Btn>
      </div>
    </>
  );

  let footer = undefined;
  if (s) {
    if (confirmCancel) footer = <Foot note="Cancelar esta venda? Esta ação não pode ser desfeita."><Btn kind="outline" w={96} onClick={() => setConfirmCancel(false)}>Voltar</Btn><Btn kind="danger" disabled={cancel.isPending} onClick={() => cancel.mutate()}>Confirmar Cancelamento</Btn></Foot>;
    else if (s.status === "aguardando_pagamento") footer = <Foot>{s.can_cancel && <Btn kind="outline" onClick={goCancel}>Cancelar Venda</Btn>}{s.can_confirm && <Btn disabled={run.isPending || !payDate} onClick={() => confirm()}>Confirmar Pagamento</Btn>}</Foot>;
    else if (s.status === "em_prazo" && s.can_cancel) footer = <Foot><Btn kind="outline" onClick={goCancel}>Cancelar Venda</Btn></Foot>;
  }
  return (
    <Shell title="Venda" back={BACK} nav="Vendas" footer={footer}>
      {saleQ.isLoading ? <Loading /> : saleQ.error ? <ErrorBox e={saleQ.error} /> : s && (
        <>
          <VendaView s={s} today={today} payDate={payDate} onPayDate={setPayDate} onFile={onFile} uploading={uploading}
            onSeeFile={() => s.comprovante && openComprovante(s.comprovante).catch(setErr)} editing={editing} onToggleEdit={startEdit} editor={editor}
            onConfirmLine={confirm} busy={run.isPending} />
          {err && <ErrorBox e={err} />}
        </>
      )}
    </Shell>
  );
}
