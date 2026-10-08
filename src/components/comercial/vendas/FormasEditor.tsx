import { EditValue, ITrash, IPlus, PU, GR, LINE2 } from "../kit";
import { Pill, Rw, Card, DateField, FORMA_NOME } from "./ui";
import { n0, rsc } from "@/lib/comercial/format";

/** Formas de Pagamento (mockup RegistrarVenda): bloco por forma com Líquido, Parcelas, data e pontos do mês. */
export type FormaIn = { key: string; forma: "cartao" | "pix" | "boleto"; bruto: number; parcelas: number; data: string; touched?: boolean };
export type FormaOpt = { forma: "cartao" | "pix" | "boleto"; parcela: boolean; max: number; taxa: number };
export type FormaPrev = { label: string; liquido: number; pelas_taxas: boolean; parcelado: boolean; paid_at: string | null; confirmado: number; previsto: number };

const L = ({ l, v }: { l: React.ReactNode; v: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 34, fontSize: 13, color: GR }}>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{l}</span><span style={{ color: PU, fontWeight: 600, display: "flex", alignItems: "center" }}>{v}</span>
  </div>
);

export const FormasEditor = ({ formas, opts, prev, onChange, bare }: { formas: FormaIn[]; opts: FormaOpt[]; prev?: FormaPrev[]; onChange: (f: FormaIn[]) => void; bare?: boolean }) => {
  const set = (i: number, patch: Partial<FormaIn>) => onChange(formas.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  const add = () => {
    const used = new Set(formas.map((f) => f.forma));
    const o = opts.find((x) => !used.has(x.forma)) ?? opts[0];
    if (!o) return;
    onChange([...formas, { key: Math.random().toString(36).slice(2), forma: o.forma, bruto: 0, parcelas: 1, data: formas[0]?.data ?? "" }]);
  };
  return (
    <Card>
      {formas.map((f, i) => {
        const o = opts.find((x) => x.forma === f.forma);
        const max = o?.parcela ? o.max : 1;
        const p = prev?.[i];
        const parcelado = p ? p.parcelado : f.forma !== "cartao" && f.parcelas > 1;
        const label = p?.label ?? (f.forma === "cartao" ? FORMA_NOME.cartao : f.parcelas > 1 ? "Boleto | PIX Parcelado" : FORMA_NOME[f.forma]);
        const conf = p ? p.confirmado > 0 : false;
        return (
          <div key={f.key} style={{ padding: "4px 0", borderBottom: `1px solid ${LINE2}` }}>
            <div style={{ position: "relative" }}>
              <Rw h={46} last l={
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", minHeight: 40 }}>
                  {label}
                  <select value={f.forma} onChange={(e) => { const nf = e.target.value as FormaIn["forma"]; const no = opts.find((x) => x.forma === nf); set(i, { forma: nf, parcelas: Math.min(f.parcelas, no?.parcela ? no.max : 1) }); }}
                    aria-label="Forma de pagamento" style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", fontSize: 16 }}>
                    {opts.map((x) => <option key={x.forma} value={x.forma}>{FORMA_NOME[x.forma]}</option>)}
                  </select>
                </span>}
                v={<>
                  <EditValue value={f.bruto || null} onChange={(v) => set(i, { bruto: v })} prefix="R$ " dec={0} w={104} h={34} r={10} fs={14} align="right" ph="0" font="inherit" />
                  {formas.length > 1 && <span onClick={() => onChange(formas.filter((_, k) => k !== i))} role="button" aria-label="Remover forma" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: -10 }}><ITrash /></span>}
                </>} />
            </div>
            {!bare && <L l={<>Líquido {p?.pelas_taxas && <Pill />}</>} v={p ? rsc(p.liquido) : "—"} />}
            <L l="Parcelas" v={max > 1
              ? <EditValue value={f.parcelas} onChange={(v) => set(i, { parcelas: Math.max(1, Math.min(max, Math.round(v))) })} suffix="×" w={56} h={34} r={10} fs={13} align="right" font="inherit" />
              : "À Vista"} />
            <L l={parcelado ? "1ª Parcela em" : p?.paid_at ? "Pago em" : "Pagamento em"} v={<DateField value={f.data} onChange={(v) => set(i, { data: v, touched: true })} />} />
            {!bare && <L l={conf ? "Confirmado no Mês" : "Previsto no Mês"} v={p ? n0(conf ? p.confirmado : p.previsto) : "—"} />}
          </div>
        );
      })}
      <div onClick={add} style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: PU, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
        <IPlus />Adicionar Forma de Pagamento
      </div>
    </Card>
  );
};
export const formaPayload = (f: FormaIn) => ({ forma: f.forma, bruto: f.bruto, parcelas: f.parcelas, data: f.data });
export const formasOk = (f: FormaIn[]) => f.length > 0 && f.every((x) => x.bruto > 0 && x.parcelas >= 1 && !!x.data);
