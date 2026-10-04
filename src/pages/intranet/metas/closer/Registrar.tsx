import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banner, Btn, Card, Chip, ErrorBox, Field, Input, Loading, Select, Textarea } from "@/components/intranet/ui";
import { checkDuplicate, registerSale } from "@/lib/intranet/api";
import { brl, digits, iso, maskDoc, monthLabel, monthStart, num, PAY_LABEL, toNumber } from "@/lib/intranet/format";
import { addDaysIso, BASE, Top, useParams_, useProducts } from "./shared";

interface Line { product_id: string; qty: string; value: string }
const emptyLine = (): Line => ({ product_id: "", qty: "1", value: "" });
type Done = { id: string; duplicate: boolean; needs_approval: boolean };

const Registrar = () => {
  const qc = useQueryClient();
  const products = useProducts();
  const params = useParams_();
  const today = iso(new Date());
  const retro = params.data?.retroativo_dias ?? 20;

  const [client, setClient] = useState("");
  const [doc, setDoc] = useState("");
  const [date, setDate] = useState(today);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [pay, setPay] = useState("pix");
  const [parcelado, setParcelado] = useState(false);
  const [inst, setInst] = useState(2);
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [dup, setDup] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const ps = (products.data ?? []).filter((p) => p.active);
  const setLine = (i: number, patch: Partial<Line>) => setLines((l) => l.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  const calc = lines.map((l) => {
    const p = ps.find((x) => x.id === l.product_id);
    const qty = Math.max(parseInt(l.qty, 10) || 0, 0);
    const value = toNumber(l.value);
    return { p, qty, value, points: qty * Number(p?.version?.points ?? 0), below: !!p && qty > 0 && value < Number(p.version?.min_price ?? 0) * qty };
  });
  const total = calc.reduce((a, c) => a + c.value, 0);
  const pointsTotal = calc.reduce((a, c) => a + c.points, 0);
  const anyBelow = calc.some((c) => c.below);
  const valid = client.trim().length > 1 && [11, 14].includes(digits(doc).length) && date >= addDaysIso(today, -retro) && date <= today
    && calc.every((c) => c.p && c.qty > 0 && c.value > 0);

  const reg = useMutation({
    mutationFn: () => registerSale({
      client: client.trim(), doc: digits(doc), date,
      items: calc.map((c) => ({ product_id: c.p!.id, qty: c.qty, value: c.value })),
      pay, installments: parcelado ? inst : 1, recurring, notes: notes.trim(),
    }),
    onSuccess: (r) => { setDone(r); setDup(false); ["ix-sales", "ix-ms", "ix-notices"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); },
    onError: (e: Error) => toast.error(e.message),
  });
  const check = useMutation({
    mutationFn: () => checkDuplicate(digits(doc), total, date),
    onSuccess: (r) => { if (r) setDup(true); else reg.mutate(); },
    onError: () => reg.mutate(),
  });

  const reset = () => { setClient(""); setDoc(""); setDate(today); setLines([emptyLine()]); setPay("pix"); setParcelado(false); setRecurring(false); setNotes(""); setDup(false); setDone(null); };

  if (products.isLoading) return <div style={{ marginTop: 28 }}><Loading rows={4} /></div>;
  if (products.error) return <div style={{ marginTop: 28 }}><ErrorBox error={products.error} /></div>;

  if (done) return (
    <div style={{ maxWidth: 560 }}>
      <Top title="Venda registrada" />
      <Card>
        <div className="ix-row" style={{ flexWrap: "wrap", gap: 8 }}>
          <Chip tone="pending">Pendente</Chip>
          {done.needs_approval && <Chip tone="pending">Aguardando aprovação</Chip>}
          {done.duplicate && <Chip tone="pending">Possível duplicada</Chip>}
        </div>
        <div className="ix-num" style={{ fontSize: 32, margin: "18px 0 22px" }}>{brl(total, 2)}</div>
        <div className="ix-row" style={{ flexWrap: "wrap" }}>
          <Link to={`${BASE}/vendas/${done.id}`} className="mfull"><Btn mfull arrow>Ver venda</Btn></Link>
          <Btn kind="secondary" mfull onClick={reset}>Registrar outra</Btn>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <Top title="Registrar venda" />
      <form onSubmit={(e) => { e.preventDefault(); if (valid) check.mutate(); }}>
        <Card>
          <div className="ix-grid c2" style={{ gap: "0 20px" }}>
            <Field label="Cliente"><Input value={client} onChange={(e) => setClient(e.target.value)} autoComplete="off" required /></Field>
            <Field label="CPF / CNPJ"><Input inputMode="numeric" value={doc} onChange={(e) => digits(e.target.value).length <= 14 && setDoc(maskDoc(e.target.value))} required /></Field>
          </div>
          <Field label="Data da venda" hint={`Retroativo: até ${retro} dias`}>
            <Input type="date" value={date} min={addDaysIso(today, -retro)} max={today} onChange={(e) => setDate(e.target.value)} required />
          </Field>
        </Card>

        {lines.map((l, i) => (
          <Card key={i} style={{ marginTop: 16 }}>
            <div className="ix-row ix-between" style={{ marginBottom: 12 }}>
              <b>Produto {i + 1}</b>
              {lines.length > 1 && <Btn kind="ghost" size="sm" type="button" aria-label={`Remover produto ${i + 1}`} onClick={() => setLines((x) => x.filter((_, k) => k !== i))}><Trash2 size={16} /></Btn>}
            </div>
            <Field label="Produto">
              <Select value={l.product_id} onChange={(e) => setLine(i, { product_id: e.target.value })} required>
                <option value="">Selecione</option>
                {ps.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <div className="ix-grid c2" style={{ gap: "0 20px", gridTemplateColumns: "100px 1fr" }}>
              <Field label="Qtd"><Input type="number" min={1} inputMode="numeric" value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} required /></Field>
              <Field label="Valor total da linha (R$)"><Input inputMode="decimal" placeholder="0,00" value={l.value} onChange={(e) => setLine(i, { value: e.target.value.replace(/[^\d.,]/g, "") })} required /></Field>
            </div>
            <div className="ix-row" style={{ flexWrap: "wrap", gap: 8 }}>
              <span className="ix-small ix-muted">{num(calc[i].points)} pts</span>
              {calc[i].below && <Chip tone="error">abaixo do piso — o gestor precisa aprovar</Chip>}
            </div>
          </Card>
        ))}
        <Btn kind="secondary" type="button" mfull style={{ marginTop: 16 }} onClick={() => setLines((x) => [...x, emptyLine()])}><Plus size={16} /> Adicionar produto</Btn>

        <Card style={{ marginTop: 16 }}>
          <div className="ix-label">Forma de pagamento</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {Object.entries(PAY_LABEL).map(([k, v]) => <Btn key={k} type="button" size="sm" kind={pay === k ? "primary" : "secondary"} aria-pressed={pay === k} onClick={() => setPay(k)}>{v}</Btn>)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: parcelado ? 12 : 16 }}>
            <Btn type="button" size="sm" kind={!parcelado ? "primary" : "secondary"} aria-pressed={!parcelado} onClick={() => setParcelado(false)}>À vista</Btn>
            <Btn type="button" size="sm" kind={parcelado ? "primary" : "secondary"} aria-pressed={parcelado} onClick={() => setParcelado(true)}>Parcelado</Btn>
          </div>
          {parcelado && <Field label="Parcelas"><Select value={inst} onChange={(e) => setInst(Number(e.target.value))}>{Array.from({ length: 11 }, (_, k) => k + 2).map((n) => <option key={n} value={n}>{n}x</option>)}</Select></Field>}
          <label className="ix-row" style={{ cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: 20, height: 20, accentColor: "#431171" }} /> Recorrente
          </label>
          <Field label="Observações"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </Card>

        <Card lilac style={{ marginTop: 16 }}>
          <div className="ix-row ix-between"><span className="ix-muted">Total · {monthLabel(monthStart(new Date(date + "T12:00:00")))}</span><span className="ix-num" style={{ fontSize: 26 }}>{brl(total, 2)}</span></div>
          <div className="ix-row ix-between" style={{ marginTop: 6 }}><span className="ix-muted">Pontos</span><b className="ix-num">{num(pointsTotal)}</b></div>
          {anyBelow && <div style={{ marginTop: 12 }}><Chip tone="error">abaixo do piso — o gestor precisa aprovar</Chip></div>}
        </Card>

        {dup && (
          <div style={{ marginTop: 16 }}>
            <Banner error action={<div className="ix-row"><Btn size="sm" kind="secondary" type="button" onClick={() => setDup(false)}>Revisar</Btn><Btn size="sm" type="button" busy={reg.isPending} onClick={() => reg.mutate()}>Registrar mesmo assim</Btn></div>}>
              Possível duplicada: já existe venda de {doc} de {brl(total, 2)} em {monthLabel(monthStart(new Date(date + "T12:00:00")))}.
            </Banner>
          </div>
        )}

        <Btn type="submit" arrow mfull busy={check.isPending || reg.isPending} disabled={!valid} style={{ marginTop: 20 }}>Registrar venda</Btn>
      </form>
    </div>
  );
};
export default Registrar;
