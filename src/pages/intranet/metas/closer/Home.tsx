import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, Coins, Package, Receipt, Target } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banner, Btn, Card, Chip, Donut, Empty, ErrorBox, IconBox, Loading, SaleChip, StatCard } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { listNotices, listSales, resolveNotice } from "@/lib/intranet/api";
import { brl, dmy, firstName, monthLabel, monthStart, num, pct, monthTitle } from "@/lib/intranet/format";
import { missing } from "@/lib/intranet/calc";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BASE, InfoTip, Kpi, salePoints, saleProductsText, useMyRow, useProducts, weekdaysLeft } from "./shared";

const Home = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const month = monthStart();
  const { q, row } = useMyRow(month);
  const products = useProducts();
  const mobile = useMediaQuery("(max-width: 767px)");
  const notices = useQuery({ queryKey: ["ix-notices"], queryFn: listNotices });
  const sales = useQuery({ queryKey: ["ix-sales", "recent", profile?.id], queryFn: () => listSales({ seller: profile?.id }), enabled: !!profile?.id });
  const resolve = useMutation({ mutationFn: resolveNotice, onSuccess: () => qc.invalidateQueries({ queryKey: ["ix-notices"] }) });

  if (q.isLoading) return <div style={{ marginTop: 28 }}><Loading rows={4} /></div>;
  if (q.error) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error} /></div>;
  if (!row) return <div style={{ marginTop: 28 }}><Empty>Sem meta definida para este mês.</Empty></div>;

  const falta = missing(row.goal, row.validated);
  const dias = weekdaysLeft();
  const ritmo = dias > 0 ? falta / dias : falta;
  const recent = (sales.data ?? []).slice(0, 5);

  return (
    <div>
      <div className="ix-row ix-between ix-wrapflex" style={{ margin: "28px 0 20px" }}>
        <div>
          <h1 className="ix-h2 hd" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>Olá, {firstName(profile)}</h1>
          <span className="ix-muted ix-small">{monthTitle(month)}</span>
        </div>
        {row.ramp < 1 && <Chip>Entrada · {Math.round(row.ramp * 100)}%</Chip>}
      </div>

      {(notices.data ?? []).length > 0 && (
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {(notices.data ?? []).map((n) => (
            <Banner key={n.id} error={n.kind === "floor"} action={<Btn kind="ghost" size="sm" onClick={() => resolve.mutate(n.id)}>Ok</Btn>}>
              {n.title}{n.body && <span style={{ fontWeight: 500 }}> — {n.body}</span>}
            </Banner>
          ))}
        </div>
      )}

      {mobile ? (
        <>
          <div className="ix-listcard" style={{ marginBottom: 12 }}>
            <div className="ix-row" style={{ gap: 14, padding: 14 }}>
              <Donut value={row.attainment} size={84} />
              <div style={{ minWidth: 0 }}>
                <div className="ix-num" style={{ fontSize: 15 }}>{falta > 0 ? <>falta {brl(falta)}</> : "Meta batida"}</div>
                <div className="ix-small ix-muted">da meta de {monthLabel(month)}</div>
                {falta > 0 && <div className="ix-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{dias} dias úteis · {brl(ritmo)} por dia útil</div>}
              </div>
            </div>
            <StatCard className="flat" items={[
              { icon: <Target />, l: "Meta", v: brl(row.goal) },
              { icon: <Check />, l: "Validado", v: brl(row.validated) },
              { icon: <Clock />, l: "Pendente", v: brl(row.pending) },
              { icon: <Coins />, l: "Remuneração", v: brl(row.total_pay), s: `Fixo ${brl(row.salary)} + bônus ${brl(row.bonus)}`, tip: <InfoTip text="Fixo + bônus calculado só com vendas validadas." /> },
            ]} />
          </div>
          <div className="ix-shortcuts" style={{ ["--n" as string]: 3 }}>
            {[{ to: "nota", t: "Nota", I: Receipt }, { to: "foco", t: "Foco", I: Target }, { to: "produtos", t: "Produtos", I: Package }].map(({ to, t, I }) => (
              <Link key={to} to={`${BASE}/${to}`}><i><I size={17} /></i>{t}</Link>
            ))}
          </div>
        </>
      ) : (
        <>
      <div className="ix-grid c2">
        <Card>
          <div className="ix-row" style={{ gap: 22, flexWrap: "wrap" }}>
            <Donut value={row.attainment} label="da meta" />
            <div style={{ display: "grid", gap: 12 }}>
              <div className="ix-row" style={{ flexWrap: "wrap", gap: 8 }}><Chip>Validado {brl(row.validated)}</Chip><Chip tone="pending">Pendente {brl(row.pending)}</Chip></div>
              <Kpi l="Meta" v={brl(row.goal)} />
              <span className="ix-small ix-muted">{falta > 0 ? <>falta <b>{brl(falta)}</b></> : "Meta batida"}</span>
            </div>
          </div>
          {falta > 0 && <p className="ix-small ix-muted" style={{ margin: "18px 0 0" }}>{dias} dias úteis restantes · {brl(ritmo)} por dia útil</p>}
        </Card>

        <Card>
          <div className="ix-row ix-between" style={{ marginBottom: 16 }}>
            <h2 className="ix-h3 hd">Remuneração</h2>
            <span className="ix-row" style={{ gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", color: "#431171" }}>HOJE<InfoTip text="Fixo + bônus calculado só com vendas validadas." /></span>
          </div>
          <div className="ix-grid" style={{ gap: 12 }}>
            <div className="ix-row ix-between"><span className="ix-muted">Fixo</span><span className="ix-num">{brl(row.salary)}</span></div>
            <div className="ix-row ix-between"><span className="ix-muted">Bônus · {pct(row.attainment)}</span><span className="ix-num">{brl(row.bonus)}</span></div>
            <div className="ix-row ix-between" style={{ borderTop: "1px solid #ece7f2", paddingTop: 14 }}><b>Total</b><span className="ix-num" style={{ fontSize: 28, color: "#431171" }}>{brl(row.total_pay)}</span></div>
          </div>
        </Card>
      </div>

      <div className="ix-grid c3" style={{ marginTop: 20 }}>
        {[{ to: "nota", t: "Nota", I: Receipt }, { to: "foco", t: "Foco", I: Target }, { to: "produtos", t: "Produtos", I: Package }].map(({ to, t, I }) => (
          <Link key={to} to={`${BASE}/${to}`}><Card className="ix-row ix-between"><span className="ix-row"><IconBox><I size={20} /></IconBox><b>{t}</b></span><ArrowRight size={18} color="#431171" /></Card></Link>
        ))}
      </div>

        </>
      )}

      <Card style={{ marginTop: 20 }}>
        <div className="ix-row ix-between" style={{ marginBottom: 12 }}>
          <h2 className="ix-h3 hd">Últimas vendas</h2>
          <Link to={`${BASE}/vendas`} className="ix-small" style={{ color: "#431171", fontWeight: 600 }}>Ver todas</Link>
        </div>
        {sales.isLoading ? <Loading rows={2} /> : sales.error ? <ErrorBox error={sales.error} /> : recent.length === 0 ? <Empty>Nenhuma venda ainda.</Empty> : (
          <div>
            {recent.map((s) => (
              <Link key={s.id} to={`${BASE}/vendas/${s.id}`} className="ix-row ix-between" style={{ padding: "14px 0", borderTop: "1px solid #ece7f2", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.client_name}</div>
                  <div className="ix-small ix-faint">{dmy(s.sale_date)} · {saleProductsText(s, products.data ?? [])} · {num(salePoints(s, products.data ?? []))} pts</div>
                </div>
                <div style={{ textAlign: "right", flex: "none", display: "grid", gap: 4, justifyItems: "end" }}><span className="ix-num">{brl(s.total_value)}</span><SaleChip status={s.status} floor={s.floor_status} /></div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
export default Home;
