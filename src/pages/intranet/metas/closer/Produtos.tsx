import { Card, Chip, Empty, ErrorBox, Loading } from "@/components/intranet/ui";
import { brl, monthLabel, num } from "@/lib/intranet/format";
import { BASE, Top, useProducts } from "./shared";

const Produtos = () => {
  const q = useProducts();
  if (q.isLoading) return <div style={{ marginTop: 28 }}><Loading /></div>;
  if (q.error) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error} /></div>;
  const list = (q.data ?? []).filter((p) => p.active);
  return (
    <div>
      <Top back={BASE} title="Produtos" />
      {list.length === 0 ? <Empty>Nenhum produto.</Empty> : (
        <div className="ix-grid c3 ix-cards2">
          {list.map((p) => (
            <Card key={p.id}>
              <div className="ix-row ix-between" style={{ alignItems: "flex-start" }}>
                <b className="ix-h3 hd">{p.name}</b>
                {p.recurring && <Chip>Recorrente</Chip>}
              </div>
              <div className="ix-grid" style={{ gap: 12, marginTop: 16, gridTemplateColumns: "1fr 1fr" }}>
                <div className="ix-kpi"><span className="l">Valor</span><span className="v">{num(p.version?.points)}</span></div>
                <div className="ix-kpi"><span className="l">Piso</span><span className="v">{brl(p.version?.min_price)}</span></div>
              </div>
              {p.next && <div className="ix-small ix-muted" style={{ marginTop: 14 }}>a partir de {monthLabel(p.next.valid_from.slice(0, 7) + "-01")}: {num(p.next.points)} · piso {brl(p.next.min_price)}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default Produtos;
