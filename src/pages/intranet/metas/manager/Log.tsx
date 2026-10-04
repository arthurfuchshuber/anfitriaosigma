import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Btn, Chip, Empty, ErrorBox, Field, Input, Loading, PageHeader } from "@/components/intranet/ui";
import { listAudit, logEvent } from "@/lib/intranet/api";
import { downloadCsv } from "@/lib/intranet/csv";
import { dmyHm } from "@/lib/intranet/format";

const Cut = ({ s, w }: { s: string | null; w: number }) => <span title={s ?? ""} style={{ display: "inline-block", maxWidth: w, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "bottom" }}>{s || "—"}</span>;

const Log = () => {
  const [f, setF] = useState({ from: "", to: "", actor: "", action: "" });
  const [applied, setApplied] = useState(f);
  const q = useQuery({ queryKey: ["audit", applied], queryFn: () => listAudit(applied) });
  const rows = q.data ?? [];
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const exportLog = () => {
    downloadCsv(`log-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Data/hora", "Pessoa", "Papel", "Ação", "Detalhamento", "Local", "Dispositivo"],
      ...rows.map((r) => [dmyHm(r.at), r.actor_name, r.actor_role, r.action, r.detail, r.location, r.device]),
    ]);
    void logEvent("exportou_log");
  };

  return (
    <>
      <PageHeader eyebrow="Gestor" title="Log" right={<Btn kind="secondary" size="sm" onClick={exportLog} disabled={rows.length === 0}>Exportar relatório</Btn>} />
      <form className="ix-grid c4" style={{ alignItems: "end" }} onSubmit={(e) => { e.preventDefault(); setApplied(f); }}>
        <Field label="De"><Input type="date" value={f.from} onChange={set("from")} aria-label="De" /></Field>
        <Field label="Até"><Input type="date" value={f.to} onChange={set("to")} aria-label="Até" /></Field>
        <Field label="Pessoa"><Input value={f.actor} onChange={set("actor")} aria-label="Pessoa" /></Field>
        <Field label="Ação"><div className="ix-row"><Input value={f.action} onChange={set("action")} aria-label="Ação" /><Btn type="submit" size="sm">Filtrar</Btn></div></Field>
      </form>
      {q.isLoading ? <Loading rows={4} /> : q.error ? <ErrorBox error={q.error} /> : rows.length === 0 ? <Empty>Nenhum registro.</Empty> : (
        <div className="ix-table-wrap">
          <table className="ix-table">
            <thead><tr><th>Data/hora</th><th>Pessoa</th><th>Ação</th><th>Detalhamento</th><th>Local</th><th>Dispositivo</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: "nowrap" }}>{dmyHm(r.at)}</td>
                <td><div className="ix-row" style={{ gap: 8 }}><span>{r.actor_name || "—"}</span>{r.actor_role && <Chip tone="muted">{r.actor_role}</Chip>}</div></td>
                <td><b>{r.action}</b></td>
                <td><Cut s={r.detail} w={280} /></td><td><Cut s={r.location} w={140} /></td><td><Cut s={r.device} w={180} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default Log;
