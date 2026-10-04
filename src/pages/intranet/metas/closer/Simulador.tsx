import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Btn, Card, ErrorBox, Field, Input, Loading } from "@/components/intranet/ui";
import { attainment, bonusOf, missing, totalPay } from "@/lib/intranet/calc";
import { brl, monthStart, num, pct, toNumber } from "@/lib/intranet/format";
import { Kpi, Top, toSim, useMyRow, useProducts } from "./shared";

const Simulador = () => {
  const { q, row } = useMyRow(monthStart());
  const products = useProducts();
  const [goalS, setGoalS] = useState<string | null>(null);
  const [salS, setSalS] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [fromSold, setFromSold] = useState(false);

  if (q.isLoading || products.isLoading) return <div style={{ marginTop: 28 }}><Loading rows={4} /></div>;
  if (q.error || products.error) return <div style={{ marginTop: 28 }}><ErrorBox error={q.error ?? products.error} /></div>;

  const sim = toSim(products.data ?? []);
  const goal = goalS === null ? row?.goal ?? 0 : toNumber(goalS);
  const salary = salS === null ? row?.salary ?? 0 : toNumber(salS);
  const base = fromSold ? row?.validated ?? 0 : 0;
  const pts = base + sim.reduce((a, p) => a + (qty[p.id] ?? 0) * p.points, 0);
  const att = attainment(pts, goal);
  const gap = missing(goal, pts);
  const step = (id: string, d: number) => setQty((s) => ({ ...s, [id]: Math.max((s[id] ?? 0) + d, 0) }));

  return (
    <div>
      <Top title="Simulador" />
      <div className="ix-grid c2" style={{ alignItems: "start" }}>
        <Card>
          <div className="ix-grid c2" style={{ gap: "0 16px" }}>
            <Field label="Meta"><Input inputMode="decimal" value={goalS ?? String(goal).replace(".", ",")} onChange={(e) => setGoalS(e.target.value)} /></Field>
            <Field label="Salário fixo"><Input inputMode="decimal" value={salS ?? String(salary).replace(".", ",")} onChange={(e) => setSalS(e.target.value)} /></Field>
          </div>
          <label className="ix-row" style={{ cursor: "pointer", margin: "4px 0 18px" }}>
            <input type="checkbox" checked={fromSold} onChange={(e) => setFromSold(e.target.checked)} style={{ width: 20, height: 20, accentColor: "#431171" }} /> Partir do que já vendi
          </label>
          <div style={{ display: "grid", gap: 12 }}>
            {sim.map((p) => (
              <div key={p.id} className="ix-row ix-between">
                <div><b>{p.name}</b><div className="ix-small ix-faint">{num(p.points)} pts</div></div>
                <div className="ix-row" style={{ gap: 8 }}>
                  <Btn kind="secondary" size="sm" aria-label={`Menos ${p.name}`} onClick={() => step(p.id, -1)}><Minus size={16} /></Btn>
                  <span className="ix-num" style={{ minWidth: 28, textAlign: "center" }} aria-live="polite">{qty[p.id] ?? 0}</span>
                  <Btn kind="secondary" size="sm" aria-label={`Mais ${p.name}`} onClick={() => step(p.id, 1)}><Plus size={16} /></Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card lilac>
          <div className="ix-grid" style={{ gap: 18, gridTemplateColumns: "1fr 1fr" }}>
            <Kpi l="Pontos" v={num(pts)} /><Kpi l="Atingimento" v={pct(att)} />
            <Kpi l="Bônus" v={brl(bonusOf(salary, att))} /><Kpi l="Fixo + bônus" v={brl(totalPay(salary, att))} />
          </div>
          <div style={{ borderTop: "1px solid #e7e2ee", marginTop: 20, paddingTop: 16 }}>
            <div className="ix-label">Para chegar a 100%</div>
            {gap <= 0 ? <b>Meta atingida</b> : (
              <>
                <div className="ix-num" style={{ fontSize: 22 }}>faltam {num(gap)} pts</div>
                <div className="ix-small ix-muted" style={{ marginTop: 6 }}>
                  {sim.filter((p) => p.points > 0).map((p) => `${Math.ceil(gap / p.points)}× ${p.name}`).slice(0, 4).join(" · ")}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Simulador;
