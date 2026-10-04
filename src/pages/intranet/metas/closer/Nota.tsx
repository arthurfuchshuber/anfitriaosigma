import { useMemo, useRef, useState } from "react";
import { Printer, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Btn, Card, Chip, ErrorBox, Field, Loading, Select } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { attachInvoiceFile, generateInvoice, getClosures, getCompany, getMyInvoice, getMySensitive } from "@/lib/intranet/api";
import { brl, maskDoc, monthLabel, monthStart } from "@/lib/intranet/format";
import { BASE, CopyBtn, Top, useMyRow } from "./shared";

const STEPS = ["pendente", "enviada", "aprovada", "paga"] as const;
const comp = (m: string) => `${m.slice(5, 7)}/${m.slice(0, 4)}`;

const Line = ({ l, v, copy }: { l: string; v: string; copy?: boolean }) => (
  <div className="ix-row ix-between" style={{ padding: "10px 0", borderTop: "1px solid #ece7f2", gap: 12, alignItems: "flex-start" }}>
    <div style={{ minWidth: 0 }}><div className="ix-small ix-faint">{l}</div><div style={{ fontWeight: 600, wordBreak: "break-word" }}>{v || "—"}</div></div>
    {copy && <span className="no-print"><CopyBtn value={v} label={l} /></span>}
  </div>
);

const Nota = () => {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const attach = useRef<HTMLInputElement>(null);
  const closures = useQuery({ queryKey: ["ix-closures"], queryFn: getClosures });
  const [sel, setSel] = useState<string | null>(null);

  const closed = useMemo(() => (closures.data ?? []).map((c) => c.month.slice(0, 7) + "-01").sort().reverse(), [closures.data]);
  const cur = monthStart();
  const options = useMemo(() => Array.from(new Set([cur, ...closed])).sort().reverse(), [cur, closed]);
  const month = sel ?? closed[0] ?? cur;
  const isClosed = closed.includes(month);

  const { q, row } = useMyRow(month);
  const inv = useQuery({ queryKey: ["ix-inv", profile?.id, month], queryFn: () => getMyInvoice(profile!.id, month), enabled: !!profile?.id && isClosed });
  const company = useQuery({ queryKey: ["ix-company"], queryFn: getCompany, enabled: isClosed });
  const sens = useQuery({ queryKey: ["ix-sens-nota", profile?.id], queryFn: () => getMySensitive(profile!.id), enabled: !!profile?.id && isClosed, gcTime: 0 });

  const gen = useMutation({
    mutationFn: () => generateInvoice(month),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ix-inv"] }); toast.success("Nota gerada"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const up = useMutation({
    mutationFn: (f: File) => attachInvoiceFile(profile!.id, month, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ix-inv"] }); toast.success("Nota anexada"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (closures.isLoading) return <div style={{ marginTop: 28 }}><Loading /></div>;
  if (closures.error) return <div style={{ marginTop: 28 }}><ErrorBox error={closures.error} /></div>;

  const picker = (
    <div className="no-print" style={{ minWidth: 190 }}>
      <Select aria-label="Mês" value={month} onChange={(e) => setSel(e.target.value)}>
        {options.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
      </Select>
    </div>
  );

  let body;
  if (!isClosed) {
    body = q.isLoading ? <Loading /> : q.error ? <ErrorBox error={q.error} /> : (
      <Card>
        <Chip tone="pending">Prévia — disponível após o fechamento</Chip>
        <div style={{ marginTop: 16 }}>
          <Line l="Fixo" v={brl(row?.salary, 2)} /><Line l="Bônus até agora" v={brl(row?.bonus, 2)} /><Line l="Total" v={brl(row?.total_pay, 2)} />
        </div>
      </Card>
    );
  } else if (inv.isLoading || company.isLoading || sens.isLoading) body = <Loading />;
  else if (inv.error || company.error) body = <ErrorBox error={inv.error ?? company.error} />;
  else if (!inv.data) body = (
    <Card>
      <p className="ix-muted" style={{ marginTop: 0 }}>Mês fechado. Gere o espelho da sua nota.</p>
      <Btn arrow mfull busy={gen.isPending} onClick={() => gen.mutate()}>Gerar nota</Btn>
    </Card>
  );
  else {
    const i = inv.data, c = company.data;
    const provDoc = sens.data?.cnpj || sens.data?.cpf || "";
    const step = STEPS.indexOf(i.status);
    body = (
      <>
        <div className="ix-row no-print" style={{ flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {STEPS.map((s, k) => <Chip key={s} tone={k === step ? undefined : "muted"}>{s[0].toUpperCase() + s.slice(1)}</Chip>)}
        </div>
        <div className="ix-grid c2" style={{ alignItems: "start" }}>
          <Card>
            <h2 className="ix-h3 hd" style={{ marginBottom: 8 }}>Espelho da nota{i.number ? ` · ${i.number}` : ""}</h2>
            <Line l="Competência" v={comp(month)} />
            <Line l="Prestador" v={`${profile?.full_name ?? profile?.email ?? ""}${provDoc ? ` · ${maskDoc(provDoc)}` : ""}`} />
            <Line l="Fixo" v={brl(i.fixo, 2)} />
            <Line l="Bônus" v={brl(i.bonus, 2)} />
            <div className="ix-row ix-between" style={{ borderTop: "1px solid #ece7f2", paddingTop: 14, marginTop: 4 }}><b>Valor</b><span className="ix-num" style={{ fontSize: 26, color: "#431171" }}>{brl(i.amount, 2)}</span></div>
            <Btn kind="secondary" mfull className="no-print" style={{ marginTop: 18 }} onClick={() => window.print()}><Printer size={16} /> Imprimir</Btn>
          </Card>
          <Card>
            <h2 className="ix-h3 hd" style={{ marginBottom: 8 }}>Tomador</h2>
            <Line copy l="Razão social" v={c?.legal_name ?? ""} />
            <Line copy l="CNPJ" v={c?.cnpj ?? ""} />
            <Line copy l="Endereço" v={c?.address ?? ""} />
            <Line copy l="E-mail" v={c?.email ?? ""} />
            <Line copy l="Descrição sugerida" v={c?.nf_notes ?? ""} />
          </Card>
        </div>
        <Card className="no-print" style={{ marginTop: 16 }}>
          <Field label="Nota emitida na prefeitura">
            <input ref={attach} type="file" accept="application/pdf,image/*" hidden aria-label="Anexar nota emitida" onChange={(e) => { const f = e.target.files?.[0]; if (f) up.mutate(f); e.target.value = ""; }} />
            <Btn kind="secondary" mfull busy={up.isPending} onClick={() => attach.current?.click()}><Upload size={16} /> {i.file_path ? "Substituir arquivo" : "Anexar nota"}</Btn>
          </Field>
          {i.file_path && <span className="ix-small ix-muted">Arquivo enviado.</span>}
        </Card>
      </>
    );
  }

  return (
    <div style={{ maxWidth: 980 }}>
      <style>{"@media print { .ix-top, .ix-tabbar, .no-print { display: none !important; } }"}</style>
      <Top back={BASE} title="Nota" right={picker} />
      {body}
      <p className="ix-small ix-faint no-print" style={{ marginTop: 18 }}>O sistema gera o espelho; a NFS-e oficial é emitida no portal da prefeitura.</p>
    </div>
  );
};
export default Nota;
