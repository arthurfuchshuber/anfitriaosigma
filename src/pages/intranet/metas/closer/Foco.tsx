import { Card, Empty, ErrorBox, Loading } from "@/components/intranet/ui";
import { missing, suggestFocus } from "@/lib/intranet/calc";
import { brl, monthStart, pct } from "@/lib/intranet/format";
import { BASE, Top, toSim, useMyRow, useProducts } from "./shared";

const Foco = () => {
  const { q, row } = useMyRow(monthStart());
  const products = useProducts();
  if (q.isLoading || products.isLoading) return <div style={{ marginTop: 28 }}><Loading /></div>;
  if (q.error || products.error) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error ?? products.error} /></div>;
  if (!row) return <div style={{ marginTop: 28 }}><Empty>Sem meta definida para este mês.</Empty></div>;

  const falta = missing(row.goal, row.validated);
  const cards = suggestFocus(row.goal, row.validated, row.salary, toSim(products.data ?? []));
  return (
    <div style={{ maxWidth: 900 }}>
      <Top back={BASE} title="Foco sugerido" right={falta > 0 ? <span className="ix-num" style={{ fontSize: 18, color: "#431171" }}>falta {brl(falta)}</span> : undefined} />
      {cards.length === 0 ? <Empty>Meta batida.</Empty> : (
        <div className="ix-grid c3 ix-cards2">
          {cards.map((c) => (
            <Card key={c.product.id}>
              <div className="ix-num" style={{ fontSize: 26, color: "#431171" }}>{c.qty}×</div>
              <b>{c.product.name}</b>
              <div className="ix-muted" style={{ marginTop: 10 }}>{pct(c.attainment)} · total {brl(c.total)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default Foco;
