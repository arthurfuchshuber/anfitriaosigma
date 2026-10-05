import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { TwoStepConfirm } from "@/components/intranet/TwoStepConfirm";
import { Btn, Card, Chip, Empty, ErrorBox, Field, Input, Loading, Modal, MonthNav, PageHeader } from "@/components/intranet/ui";
import { getFixedMultipliers, getGoalLocks, getParams, listMetaOverrides, monthSummary, setMetaScale, setMultiplier } from "@/lib/intranet/api";
import { addMonths, brl, monthLabel, monthShort, monthStart, pct, toNumber, monthTitle } from "@/lib/intranet/format";
import type { MonthRow } from "@/lib/intranet/types";

const nm = (r: { full_name: string | null; nickname: string | null }) => r.nickname || r.full_name || "—";
const fx = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const Metas = () => {
  const qc = useQueryClient();
  const cur = monthStart();
  const next = addMonths(cur, 1);
  const [month, setMonth] = useState(cur);
  const params = useQuery({ queryKey: ["params"], queryFn: getParams });
  const locks = useQuery({ queryKey: ["goal-locks"], queryFn: getGoalLocks });
  const fixed = useQuery({ queryKey: ["fixed-mult"], queryFn: getFixedMultipliers });
  const overrides = useQuery({ queryKey: ["meta-overrides"], queryFn: listMetaOverrides });
  const rows = useQuery({ queryKey: ["mgr-summary", month], queryFn: () => monthSummary(month) });
  const hist = useQueries({ queries: [-5, -4, -3, -2, -1, 0, 1].map((k) => { const m = addMonths(cur, k); return { queryKey: ["mgr-summary", m], queryFn: () => monthSummary(m) }; }) });

  const isLocked = (m: string) => (locks.data ?? []).some((l) => l.month === m);
  const multOf = (i: number) => hist[i].data?.[0]?.multiplier ?? params.data?.multiplo;
  const fixedSet = new Set((fixed.data ?? []).map((x) => x.month));
  const scaleOf = (uid: string, m: string) => (overrides.data ?? []).find((o) => o.user_id === uid && o.effective_month <= m)?.scale ?? 1;

  const [multOpen, setMultOpen] = useState(false); const [multVal, setMultVal] = useState(""); const [multConfirm, setMultConfirm] = useState(false);
  const [scaleRow, setScaleRow] = useState<MonthRow | null>(null); const [scaleVal, setScaleVal] = useState(""); const [scaleConfirm, setScaleConfirm] = useState(false);
  const refresh = () => { ["mgr-summary", "fixed-mult", "meta-overrides"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); };
  const lockChip = (m: string) => (isLocked(m) ? <Chip><Lock size={12} /> Fechada</Chip> : <Chip tone="pending">Aberta</Chip>);

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Metas e ajustes" right={<Btn size="sm" onClick={() => { setMultVal(""); setMultOpen(true); }}>Fixar múltiplo</Btn>} />
      <p className="ix-muted ix-small" style={{ margin: "-12px 0 18px" }}>Meses com meta fechada não podem mudar.</p>

      <div className="ix-grid c2 ix-cards2" style={{ marginBottom: 24 }}>
        {[[cur, 5] as const, [next, 6] as const].map(([m, i]) => (
          <Card key={m}>
            <div className="ix-row ix-between"><span className="ix-muted">{monthTitle(m)}</span>{lockChip(m)}</div>
            <div className="ix-kpi" style={{ marginTop: 8 }}><span className="v">{multOf(i) === undefined ? "—" : fx(multOf(i)!)}</span><span className="l">Múltiplo do time{fixedSet.has(m) ? " (fixado)" : ""}</span></div>
          </Card>
        ))}
      </div>

      <div className="ix-row ix-between ix-wrapflex" style={{ marginBottom: 14 }}>
        <h2 className="ix-h2 hd">Metas por vendedor</h2>
        <MonthNav month={month} onChange={setMonth} label={monthLabel(month)} />
      </div>
      {rows.isLoading ? <Loading rows={3} /> : rows.error ? <ErrorBox error={rows.error} /> : (rows.data ?? []).length === 0 ? <Empty>Nenhum vendedor neste mês.</Empty> : (
        <div className="ix-table-wrap" style={{ marginBottom: 28 }}>
          <table className="ix-table">
            <thead><tr><th>Vendedor</th><th className="r">Salário</th><th>Rampa</th><th className="r">Múltiplo</th><th className="r">Escala</th><th className="r">Meta</th><th /></tr></thead>
            <tbody>{rows.data!.map((r) => {
              const sc = scaleOf(r.user_id, month);
              return (
                <tr key={r.user_id}>
                  <td><Link to={`/intranet/metas/vendedor/${r.user_id}`}><b>{nm(r)}</b></Link></td>
                  <td className="r">{brl(r.salary)}</td><td>{pct(r.ramp)}</td><td className="r">{fx(r.multiplier)}</td>
                  <td className="r">{sc === 1 ? <span className="ix-faint">sem ajuste</span> : fx(sc)}</td>
                  <td className="r"><b>{brl(r.goal)}</b></td>
                  <td style={{ textAlign: "right" }}><Btn kind="secondary" size="sm" disabled={isLocked(month)} onClick={() => { setScaleRow(r); setScaleVal(fx(sc)); }}>Ajustar escala</Btn></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      <h2 className="ix-h2 hd" style={{ marginBottom: 14 }}>Histórico do múltiplo</h2>
      <div className="ix-table-wrap">
        <table className="ix-table">
          <thead><tr>{[-5, -4, -3, -2, -1, 0].map((k) => <th key={k} className="r">{monthShort(addMonths(cur, k))}</th>)}</tr></thead>
          <tbody><tr>{[-5, -4, -3, -2, -1, 0].map((k, i) => { const m = addMonths(cur, k); const v = multOf(i); return <td key={k} className="r">{v === undefined ? "—" : fx(v)}{fixedSet.has(m) && <div><Chip>Fixado</Chip></div>}</td>; })}</tr></tbody>
        </table>
      </div>

      <Modal open={multOpen && !multConfirm} onClose={() => setMultOpen(false)} title="Fixar múltiplo"
        footer={<><Btn kind="ghost" onClick={() => setMultOpen(false)}>Cancelar</Btn><Btn disabled={toNumber(multVal) <= 0} onClick={() => setMultConfirm(true)}>Continuar</Btn></>}>
        <Field label="Múltiplo do time"><Input inputMode="decimal" value={multVal} onChange={(e) => setMultVal(e.target.value)} aria-label="Múltiplo do time" /></Field>
      </Modal>
      <TwoStepConfirm open={multConfirm} onClose={() => setMultConfirm(false)} title="Confirmar múltiplo"
        summary={<b>Múltiplo do time: {fx(toNumber(multVal))}</b>}
        onConfirm={async (when) => {
          const m = when === "now" ? cur : next;
          if (isLocked(m)) throw new Error(`A meta de ${monthLabel(m)} já está fechada.`);
          await setMultiplier(m, toNumber(multVal)); toast.success("Múltiplo fixado."); setMultOpen(false); refresh();
        }} />

      <Modal open={!!scaleRow && !scaleConfirm} onClose={() => setScaleRow(null)} title={`Escala — ${scaleRow ? nm(scaleRow) : ""}`}
        footer={<><Btn kind="ghost" onClick={() => setScaleRow(null)}>Cancelar</Btn><Btn disabled={scaleVal === "" || toNumber(scaleVal) < 0} onClick={() => setScaleConfirm(true)}>Continuar</Btn></>}>
        <Field label="Escala da meta" hint="1 = sem ajuste"><Input inputMode="decimal" value={scaleVal} onChange={(e) => setScaleVal(e.target.value)} aria-label="Escala da meta" /></Field>
      </Modal>
      <TwoStepConfirm open={scaleConfirm} onClose={() => setScaleConfirm(false)} title="Confirmar escala"
        summary={scaleRow ? <><b>{nm(scaleRow)}</b><div>Escala {fx(scaleOf(scaleRow.user_id, month))} → {fx(toNumber(scaleVal))}</div></> : null}
        onConfirm={async (when, reason) => {
          await setMetaScale(scaleRow!.user_id, toNumber(scaleVal), when, reason); toast.success("Escala salva."); setScaleRow(null); refresh();
        }} />
    </>
  );
};
export default Metas;
