import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Btn, Card, Chip, ErrorBox, Loading, SaleChip } from "@/components/intranet/ui";
import { getSale } from "@/lib/intranet/api";
import { brl, dmy, maskDoc, num, PAY_LABEL } from "@/lib/intranet/format";
import { addDaysIso, BASE, CancelModal, salePoints, Top, useParams_, useProducts } from "./shared";

const Row = ({ l, children }: { l: string; children: React.ReactNode }) => (
  <div className="ix-row ix-between" style={{ padding: "12px 0", borderTop: "1px solid #ece7f2", gap: 16, alignItems: "flex-start" }}>
    <span className="ix-muted">{l}</span><span style={{ textAlign: "right", fontWeight: 600 }}>{children}</span>
  </div>
);

const SaleDetail = () => {
  const { id = "" } = useParams();
  const [cancel, setCancel] = useState(false);
  const q = useQuery({ queryKey: ["ix-sale", id], queryFn: () => getSale(id), enabled: !!id });
  const products = useProducts();
  const params = useParams_();
  const ps = products.data ?? [];

  if (q.isLoading) return <div style={{ marginTop: 28 }}><Loading /></div>;
  if (q.error || !q.data) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error} /></div>;
  const s = q.data;
  const validaEm = addDaysIso(s.sale_date, params.data?.dias_validar ?? 10);

  return (
    <div style={{ maxWidth: 760 }}>
      <Top back={`${BASE}/vendas`} title={s.client_name} right={<SaleChip status={s.status} floor={s.floor_status} />} />
      <div className="ix-row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {s.dup_flag && <Chip tone="pending">Possível duplicada</Chip>}
        {s.floor_status === "needs_approval" && <Chip tone="pending">Abaixo do piso — aguardando gestor</Chip>}
        {s.floor_status === "approved" && <Chip>Piso aprovado</Chip>}
        {s.floor_status === "rejected" && <Chip tone="error">Piso recusado</Chip>}
      </div>
      <Card>
        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          {(s.sale_items ?? []).map((it) => {
            const p = ps.find((x) => x.id === it.product_id);
            const pts = (it.qty_override ?? it.qty) * Number(p?.version?.points ?? 0);
            return (
              <div key={it.id} className="ix-row ix-between" style={{ gap: 12 }}>
                <div><b>{p?.name ?? "Produto"}</b><div className="ix-small ix-faint">{it.qty}× · {num(pts)} pts</div></div>
                <span className="ix-num">{brl(it.value, 2)}</span>
              </div>
            );
          })}
        </div>
        <Row l="Valor total"><span className="ix-num">{brl(s.total_value, 2)}</span></Row>
        <Row l="Pontos">{num(salePoints(s, ps))}</Row>
        <Row l="Data">{dmy(s.sale_date)}</Row>
        {s.client_doc && <Row l="CPF/CNPJ">{maskDoc(s.client_doc)}</Row>}
        <Row l="Pagamento">{PAY_LABEL[s.pay_method] ?? s.pay_method}{s.installments > 1 ? ` · ${s.installments}x` : " · à vista"}{s.recurring ? " · recorrente" : ""}</Row>
        <Row l={s.status === "validated" ? "Validada" : "Validação em"}>{dmy(validaEm)}</Row>
        {s.notes && <Row l="Observações">{s.notes}</Row>}
        {s.cancel_reason && <Row l="Motivo do cancelamento">{s.cancel_reason}</Row>}
      </Card>
      {s.status === "pending" && <Btn kind="danger" mfull style={{ marginTop: 18 }} onClick={() => setCancel(true)}>Cancelar venda</Btn>}
      {s.status === "validated" && <p className="ix-small ix-muted" style={{ marginTop: 14 }}>Venda validada não pode ser cancelada.</p>}
      <CancelModal sale={cancel ? s : null} onClose={() => setCancel(false)} />
    </div>
  );
};
export default SaleDetail;
