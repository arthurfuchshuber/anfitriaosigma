import { Fragment, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock, Coins, PieChart } from "lucide-react";
import { Avatar, Card, Empty, ErrorBox, Loading, MonthNav, PageHeader, SaleChip, StatCard } from "@/components/intranet/ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { listMetaOverrides, listProducts, listSales, monthSummary } from "@/lib/intranet/api";
import { brl, dmy, monthLabel, monthStart, pct } from "@/lib/intranet/format";

const B = "/intranet/metas";
const fx = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const Vendedor = () => {
  const { id = "" } = useParams();
  const mobile = useMediaQuery("(max-width: 767px)");
  const [month, setMonth] = useState(monthStart());
  const sum = useQuery({ queryKey: ["mgr-summary", month], queryFn: () => monthSummary(month) });
  const ov = useQuery({ queryKey: ["meta-overrides"], queryFn: listMetaOverrides });
  const sales = useQuery({ queryKey: ["mgr-sales-seller", id, month], queryFn: () => listSales({ month, seller: id }) });
  const products = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const pname = useMemo(() => new Map((products.data ?? []).map((p) => [p.id, p.name])), [products.data]);
  const r = (sum.data ?? []).find((x) => x.user_id === id);
  const scale = (ov.data ?? []).find((o) => o.user_id === id && o.effective_month <= month)?.scale ?? 1;
  const name = r?.full_name || r?.nickname || "Vendedor";
  const fator = r && r.salary * r.ramp * r.multiplier * scale > 0 ? r.goal / (r.salary * r.ramp * r.multiplier * scale) : 2;

  const chain: [string, string][] = r ? [["Salário", brl(r.salary)], ["× fator", fx(fator)], ["× rampa", pct(r.ramp)], ["× múltiplo", fx(r.multiplier)], ["× escala", fx(scale)], ["= meta", brl(r.goal)]] : [];

  return (
    <>
      <div style={{ marginTop: 28 }}><Link to={B} className="ix-row ix-muted ix-small" style={{ gap: 6 }}><ArrowLeft size={14} /> Painel</Link></div>
      <PageHeader eyebrow="Vendedor" title={name} right={<div className="ix-row"><Avatar name={name} size={48} /><MonthNav month={month} onChange={setMonth} label={monthLabel(month)} /></div>} />
      {sum.isLoading ? <Loading rows={3} /> : sum.error ? <ErrorBox error={sum.error} /> : !r ? <Empty>Sem meta para este vendedor neste mês.</Empty> : (
        <>
          <Card style={{ marginBottom: 20 }}>
            <h2 className="ix-h2 hd" style={{ marginBottom: 16 }}>Como chegamos na meta</h2>
            <div className="ix-row ix-wrapflex" style={{ gap: 10, alignItems: "stretch" }}>
              {chain.map(([l, v], i) => (
                <Fragment key={l}>
                  <div className="ix-card lilac" style={{ padding: "14px 18px", borderRadius: 18, borderColor: i === chain.length - 1 ? "#431171" : undefined }}>
                    <div className="ix-faint ix-small">{l}</div><div className="ix-num" style={{ fontSize: 20 }}>{v}</div>
                  </div>
                </Fragment>
              ))}
            </div>
          </Card>
          {mobile ? (
            <StatCard style={{ marginBottom: 14 }} items={[
              { icon: <Check />, l: "Validado", v: brl(r.validated) }, { icon: <Clock />, l: "Pendente", v: brl(r.pending) },
              { icon: <PieChart />, l: "Atingimento", v: pct(r.attainment), bar: r.attainment }, { icon: <Coins />, l: "Bônus", v: brl(r.bonus) },
            ]} />
          ) : (
          <div className="ix-grid c4" style={{ marginBottom: 28 }}>
              {([["Validado", brl(r.validated)], ["Pendente", brl(r.pending)], ["Atingimento", pct(r.attainment)], ["Bônus", brl(r.bonus)]] as const).map(([l, v]) => (
                <Card key={l}><div className="ix-kpi"><span className="l">{l}</span><span className="v">{v}</span></div></Card>
              ))}
            </div>
          )}
          <Card style={{ marginBottom: 28 }}><div className="ix-row ix-between"><span className="ix-muted">Total a receber (fixo + bônus)</span><span className="ix-num" style={{ fontSize: 24 }}>{brl(r.total_pay)}</span></div></Card>
        </>
      )}
      <h2 className="ix-h2 hd" style={{ marginBottom: 14 }}>Vendas do mês</h2>
      {sales.isLoading ? <Loading rows={3} /> : sales.error ? <ErrorBox error={sales.error} /> : (sales.data ?? []).length === 0 ? <Empty>Nenhuma venda neste mês.</Empty> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Produtos</th><th className="r">Total</th><th>Status</th></tr></thead>
            <tbody>{sales.data!.map((s) => (
              <tr key={s.id}><td>{dmy(s.sale_date)}</td><td>{s.client_name}</td>
                <td className="ix-small">{(s.sale_items ?? []).map((i) => `${i.qty_override ?? i.qty}× ${pname.get(i.product_id) ?? "produto"}`).join(", ")}</td>
                <td className="r">{brl(s.total_value)}</td><td><SaleChip status={s.status} floor={s.floor_status} /></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default Vendedor;
