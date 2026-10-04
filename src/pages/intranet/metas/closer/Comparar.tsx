import { useQuery } from "@tanstack/react-query";
import { Card, ErrorBox, Loading } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { monthSummary, teamAverage } from "@/lib/intranet/api";
import { addMonths, monthLabel, monthShort, monthStart, pct, monthTitle } from "@/lib/intranet/format";
import { BASE, Top, useMyRow } from "./shared";

const Bar = ({ label, value, max, strong }: { label: string; value: number | null; max: number; strong?: boolean }) => (
  <div style={{ marginBottom: 16 }}>
    <div className="ix-row ix-between" style={{ marginBottom: 6 }}><span style={{ fontWeight: strong ? 700 : 500 }}>{label}</span><span className="ix-num">{value === null ? "—" : pct(value)}</span></div>
    <div className="ix-bar" role="img" aria-label={`${label}: ${value === null ? "indisponível" : pct(value)}`}><i style={{ width: `${value === null ? 0 : Math.min((value / max) * 100, 100)}%`, opacity: strong ? 1 : 0.55 }} /></div>
  </div>
);

const Comparar = () => {
  const { profile } = useAuth();
  const month = monthStart();
  const { q, row } = useMyRow(month);
  const team = useQuery({ queryKey: ["ix-team", month], queryFn: () => teamAverage(month) });
  const hist = useQuery({
    queryKey: ["ix-hist", month, profile?.id],
    queryFn: async () => {
      const months = [1, 2, 3, 4].map((k) => addMonths(month, -k));
      const res = await Promise.all(months.map((m) => monthSummary(m).catch(() => [])));
      return months.map((m, i) => ({ m, att: res[i].find((r) => r.user_id === profile?.id)?.attainment ?? null }));
    },
    enabled: !!profile?.id,
  });

  if (q.isLoading) return <div style={{ marginTop: 28 }}><Loading /></div>;
  if (q.error) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error} /></div>;

  const avg = team.data?.avg_attainment ?? null;
  const max = Math.max(1, row?.attainment ?? 0, avg ?? 0, ...(hist.data ?? []).map((h) => h.att ?? 0));

  return (
    <div>
      <Top back={BASE} title="Comparar" />
      <div className="ix-grid c2" style={{ alignItems: "start" }}>
        <Card>
          <h2 className="ix-h3 hd" style={{ marginBottom: 18 }}>{monthTitle(month)}</h2>
          <Bar label="Você" value={row?.attainment ?? 0} max={max} strong />
          <Bar label="Média do time" value={avg} max={max} />
          {avg === null && <p className="ix-small ix-faint" style={{ margin: 0 }}>Média disponível com 3 ou mais vendedores.</p>}
        </Card>
        <Card>
          <h2 className="ix-h3 hd" style={{ marginBottom: 18 }}>Últimos meses</h2>
          {hist.isLoading ? <Loading rows={2} /> : hist.error ? <ErrorBox error={hist.error} /> : (hist.data ?? []).map((h) => <Bar key={h.m} label={monthShort(h.m)} value={h.att} max={max} />)}
        </Card>
      </div>
    </div>
  );
};
export default Comparar;
