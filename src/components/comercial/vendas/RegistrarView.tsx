import { Sec, TextField, ErrorBox, Loading } from "../kit";
import { rs, dmy, pc, n0 } from "@/lib/comercial/format";
import { Card, DateField, HeroBlock, IClip, PickRow, Rw, SegFlex } from "./ui";
import { FormasEditor, type FormaIn, type FormaOpt, type FormaPrev } from "./FormasEditor";
import { fileLabel } from "./comprovante";
import { PU } from "../kit";

export type ProdOpt = { id: string; name: string; cobrancas: { id: string; label: string; bruto: number }[]; formas: FormaOpt[] };
export type Preview = {
  month: string; status: string; formas: FormaPrev[]; confirmado: number; previsto: number; bruto: number; liquido: number;
  atingimento: [number, number]; cancelavel_ate: string | null; validada_em: string | null;
};
export type RegForm = { seller: string; product: string; cobranca: string; cliente: string; formas: FormaIn[]; pago: boolean; data: string; comprovante: string };

/** Registrar Venda — mockup RegistrarVenda (Venda, Formas de Pagamento, Pagamento, Pontos da Venda). */
export const RegistrarView = ({ form, set, products, sellers, canPickSeller, preview, previewLoading, previewError, uploading, onFile, today }: {
  form: RegForm; set: (p: Partial<RegForm>) => void; products: ProdOpt[]; sellers: { id: string; name: string }[]; canPickSeller: boolean;
  preview?: Preview; previewLoading: boolean; previewError: unknown; uploading: boolean; onFile: (f: File) => void; today: string;
}) => {
  const prod = products.find((p) => p.id === form.product);
  const pv = preview;
  return (
    <>
      <Sec t="Venda" mt={20} />
      <Card>
        <PickRow l="Vendedor" value={form.seller} opts={sellers.map((s) => ({ v: s.id, l: s.name }))} onChange={(v) => set({ seller: v })} disabled={!canPickSeller} />
        <PickRow l="Produto" value={form.product} opts={products.map((p) => ({ v: p.id, l: p.name }))} onChange={(v) => set({ product: v })} />
        <PickRow l="Cobrança" value={form.cobranca} opts={(prod?.cobrancas ?? []).map((c) => ({ v: c.id, l: c.label }))} onChange={(v) => set({ cobranca: v })} />
        <Rw l="Cliente" last v={
          <input value={form.cliente} onChange={(e) => set({ cliente: e.target.value })} placeholder="Nome do Cliente" aria-label="Cliente"
            style={{ border: "none", outline: "none", background: "transparent", textAlign: "right", font: "inherit", color: PU, fontWeight: 600, width: "100%", minWidth: 0, height: 40, padding: 0 }} />} />
      </Card>

      <Sec t="Formas de Pagamento" />
      <FormasEditor formas={form.formas} opts={prod?.formas ?? []} prev={pv?.formas} onChange={(formas) => set({ formas })} />

      <Sec t="Pagamento" />
      <Card>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ece7f2", fontSize: 14 }}>
          <span>Status</span>
          <div style={{ width: 190 }}><SegFlex opts={[{ v: "aguardando", l: "Aguardando" }, { v: "pago", l: "Pago" }]} value={form.pago ? "pago" : "aguardando"} onChange={(v) => set({ pago: v === "pago" })} /></div>
        </div>
        <Rw l="Data do 1º Pagamento" v={<DateField value={form.data} onChange={(v) => set({ data: v })} max={form.pago ? today : undefined} />} />
        <Rw l="Comprovante" last v={
          <label style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 40, cursor: "pointer", maxWidth: 200 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploading ? "Enviando…" : form.comprovante ? fileLabel(form.comprovante) : "Anexar"}</span><IClip />
            <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
          </label>} />
      </Card>

      <Sec t="Pontos da Venda" />
      {previewError ? <ErrorBox e={previewError} /> : !pv ? (previewLoading ? <Loading /> : <HeroBlock cap="PONTOS CONFIRMADOS" big="—" rows={[["Informe o valor das formas de pagamento", ""]]} />) : (
        <HeroBlock cap="PONTOS CONFIRMADOS" big={n0(pv.confirmado)} rows={[
          ["Previsto no Mês", n0(pv.previsto)],
          ["Atingimento do Vendedor", `${pc(pv.atingimento[0], 0)} › ${pc(pv.atingimento[1], 0)}`],
          ["Valor Bruto", rs(pv.bruto)],
          ["Valor Líquido", rs(pv.liquido)],
          ["Cancelável Até", pv.cancelavel_ate ? dmy(pv.cancelavel_ate) : "—"],
          ["Validação Automática", pv.validada_em ? dmy(pv.validada_em) : "—"],
        ]} />
      )}
      <div style={{ height: 4 }} />
    </>
  );
};
