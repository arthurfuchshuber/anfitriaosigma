import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Btn, Card, Empty, ErrorBox, Input, Loading, MonthNav, SaleChip } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { listSales } from "@/lib/intranet/api";
import { brl, dmy, monthLabel, monthStart, num } from "@/lib/intranet/format";
import type { Sale } from "@/lib/intranet/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BASE, CancelModal, salePoints, saleProductsText, Top, useProducts } from "./shared";

const FILTERS = [["", "Todas"], ["pending", "Pendentes"], ["validated", "Validadas"], ["cancelled", "Canceladas"]] as const;

const Vendas = () => {
  const { profile } = useAuth();
  const nav = useNavigate();
  const mobile = useMediaQuery("(max-width: 767px)");
  const [month, setMonth] = useState(monthStart());
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cancel, setCancel] = useState<Sale | null>(null);
  const products = useProducts();
  const q = useQuery({ queryKey: ["ix-sales", month, profile?.id], queryFn: () => listSales({ month, seller: profile?.id }), enabled: !!profile?.id });
  const ps = products.data ?? [];
  const list = useMemo(() => (q.data ?? []).filter((s) => (!status || s.status === status) && s.client_name.toLowerCase().includes(search.trim().toLowerCase())), [q.data, status, search]);

  return (
    <div>
      <Top title="Vendas" right={<MonthNav month={month} onChange={setMonth} label={monthLabel(month)} />} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {FILTERS.map(([k, l]) => <Btn key={k} size="sm" kind={status === k ? "primary" : "secondary"} aria-pressed={status === k} onClick={() => setStatus(k)}>{l}</Btn>)}
      </div>
      <div style={{ marginBottom: 18 }}><Input type="search" placeholder="Buscar cliente" aria-label="Buscar cliente" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      {q.isLoading ? <Loading /> : q.error ? <ErrorBox error={q.error} /> : list.length === 0 ? <Empty>Nenhuma venda.</Empty> : mobile ? (
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((s) => (
            <Card key={s.id} style={{ padding: 16 }}>
              <Link to={`${BASE}/vendas/${s.id}`} className="ix-row ix-between" style={{ alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{s.client_name}</div>
                  <div className="ix-small ix-faint">{dmy(s.sale_date)} · {saleProductsText(s, ps)}</div>
                  <div className="ix-small ix-muted" style={{ marginTop: 4 }}>{num(salePoints(s, ps))} pts</div>
                </div>
                <div style={{ display: "grid", gap: 6, justifyItems: "end", flex: "none" }}><span className="ix-num">{brl(s.total_value)}</span><SaleChip status={s.status} floor={s.floor_status} /></div>
              </Link>
              {s.status === "pending" && <Btn kind="danger" size="sm" style={{ marginTop: 12 }} onClick={() => setCancel(s)}>Cancelar</Btn>}
            </Card>
          ))}
        </div>
      ) : (
        <div className="ix-table-wrap"><table className="ix-table">
          <thead><tr><th>Cliente</th><th>Data</th><th>Produtos</th><th className="r">Valor</th><th className="r">Pontos</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="click" onClick={() => nav(`${BASE}/vendas/${s.id}`)}>
                <td><b>{s.client_name}</b></td><td>{dmy(s.sale_date)}</td><td>{saleProductsText(s, ps)}</td>
                <td className="r">{brl(s.total_value)}</td><td className="r">{num(salePoints(s, ps))}</td>
                <td><SaleChip status={s.status} floor={s.floor_status} /></td>
                <td>{s.status === "pending" && <Btn kind="danger" size="sm" onClick={(e) => { e.stopPropagation(); setCancel(s); }}>Cancelar</Btn>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      <CancelModal sale={cancel} onClose={() => setCancel(null)} />
    </div>
  );
};
export default Vendas;
