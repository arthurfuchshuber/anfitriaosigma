import type { ReactNode } from "react";
import { Btn, IChevR, Sec, PU, LINE2 } from "../kit";
import { dm, dmy, n0, rsc } from "@/lib/comercial/format";
import { Card, DateField, ICal, Pill, Rw, SaleHero, Tile3, Timeline, kindOf, type SaleStatus, type Step } from "./ui";
import { fileLabel } from "./comprovante";

export type SalePay = { id: string; forma: string; label: string; bruto: number; liquido: number; parcelas: number; data: string; paid_at: string | null; parcelado: boolean; pelas_taxas: boolean };
export type Sale = {
  id: string; status: SaleStatus; produto: string; cliente: string; seller_id: string; vendedor: string; cobranca: string; formas: SalePay[]; bruto: number; liquido: number;
  registrada_em: string; pago_em: string | null; cancelavel_ate: string | null; validada_em: string | null; month: string; confirmado_por: string | null; comprovante: string | null;
  pontos: number; previsto: number; congelado: boolean; cancelada_em: string | null; cancelada_por: string | null; motivo: string | null; product_id: string; cobranca_id: string;
  can_cancel: boolean; can_confirm: boolean; can_edit: boolean; is_manager: boolean;
};

const timeline = (s: Sale): Step[] => {
  const pago = s.pago_em ? dm(s.pago_em) : "—";
  switch (s.status) {
    case "aguardando_pagamento": return [["Registrada", dm(s.registrada_em), "done"], ["Pagamento Confirmado", "Pendente", "now"], ["Cancelável Até", "—", "todo"], ["Validada", "Automática", "todo"]];
    case "em_prazo": return [["Registrada", dm(s.registrada_em), "done"], ["Pagamento Confirmado", pago, "done"], ["Prazo de Cancelamento", `Até ${dm(s.cancelavel_ate)}`, "now"], ["Validada", "Automática", "todo"]];
    case "validada": return [["Registrada", dm(s.registrada_em), "done"], ["Pagamento Confirmado", pago, "done"], ["Prazo de Cancelamento", `Até ${dm(s.cancelavel_ate)}`, "done"], ["Validada", dm(s.validada_em), "done"]];
    default: return [["Registrada", dm(s.registrada_em), "done"], ["Pagamento Confirmado", pago, s.pago_em ? "done" : "todo"], ["Cancelada", dm(s.cancelada_em), "done"]];
  }
};

/** Detalhe da venda — mockups VendaAguardando e VendaEmPrazo (Validada/Cancelada reaproveitam o Em Prazo, sem ações). */
export const VendaView = ({ s, today, payDate, onPayDate, onFile, uploading, onSeeFile, editing, onToggleEdit, editor, onConfirmLine, busy }: {
  s: Sale; today: string; payDate: string; onPayDate: (d: string) => void; onFile: (f: File) => void; uploading: boolean; onSeeFile: () => void;
  editing: boolean; onToggleEdit: () => void; editor: ReactNode; onConfirmLine: (paymentId: string) => void; busy: boolean;
}) => {
  const aguard = s.status === "aguardando_pagamento";
  const formaTxt = [...new Set(s.formas.map((f) => f.label))].join(" + ") || "—";
  const pelas = s.formas.length > 0 && s.formas.every((f) => f.pelas_taxas);
  const liq = <>{pelas && <Pill />}{rsc(s.liquido)}</>;
  const comp = (
    <label style={{ minHeight: 40, display: "flex", alignItems: "center", cursor: "pointer" }}>
      {uploading ? "Enviando…" : "Anexar"}
      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </label>
  );
  const rows: [string, ReactNode, (() => void)?][] = aguard
    ? [["Vendedor", s.vendedor], ["Cobrança", s.cobranca], ["Forma de Pagamento", formaTxt], ["Valor Bruto", rsc(s.bruto)], ["Valor Líquido", liq], ["Registrada em", dmy(s.registrada_em)],
       ["Comprovante", s.comprovante ? <span onClick={onSeeFile} style={{ cursor: "pointer", minHeight: 40, display: "flex", alignItems: "center" }}>{fileLabel(s.comprovante)}</span> : comp],
       ...(s.can_edit ? [["Editar Venda", <IChevR key="c" />, onToggleEdit] as [string, ReactNode, () => void]] : [])]
    : [["Vendedor", s.vendedor], ["Forma de Pagamento", formaTxt], ["Valor Bruto", rsc(s.bruto)], ["Valor Líquido", liq], ["Pagamento Confirmado Por", s.confirmado_por ?? "—"],
       ...(s.comprovante ? [["Comprovante", <span key="v" onClick={onSeeFile} style={{ cursor: "pointer", minHeight: 40, display: "flex", alignItems: "center" }}>Ver</span>] as [string, ReactNode]] : []),
       ...(s.status === "cancelada" ? ([["Cancelada em", dmy(s.cancelada_em)], ["Cancelada Por", s.cancelada_por ?? "—"], ...(s.motivo ? [["Motivo", s.motivo]] : [])] as [string, ReactNode][]) : [])];
  const parc = s.status !== "cancelada" ? s.formas.filter((f) => f.parcelado) : [];
  return (
    <>
      <SaleHero prod={s.produto} cli={s.cliente} kind={kindOf(s.status)} pts={n0(s.pontos)} />
      {!aguard && <><div style={{ height: 12 }} /><Tile3 a={[dm(s.pago_em), "Pago em"]} b={[dm(s.cancelavel_ate), "Cancelável Até"]} c={[dm(s.validada_em), "Validada Em"]} /></>}
      <Sec t="Dados da Venda" mt={24} />
      <Card>{rows.map(([l, v, fn], i) => <Rw key={l} l={l} v={v} last={i === rows.length - 1} onClick={fn} />)}</Card>
      {editing && <><Sec t="Editar Venda" />{editor}</>}
      {aguard && s.can_confirm && (
        <>
          <Sec t="Confirmar Pagamento" />
          <Card><Rw l="Data do 1º Pagamento" last v={<DateField value={payDate} onChange={onPayDate} max={today} icon={<ICal />} />} /></Card>
        </>
      )}
      {parc.length > 0 && (
        <>
          <Sec t="Pagamentos" />
          <Card>
            {parc.map((f, i) => (
              <div key={f.id} style={{ minHeight: 60, display: "flex", alignItems: "center", gap: 10, borderBottom: i === parc.length - 1 ? undefined : `1px solid ${LINE2}`, fontSize: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>{f.label}</div>
                  <div style={{ fontSize: 11.5, color: "#6f6781" }}>{f.parcelas}× · 1ª em {dm(f.data)} · {rsc(f.bruto)}</div>
                </div>
                {f.paid_at ? <span style={{ color: PU, fontWeight: 600, fontSize: 13 }}>Pago {dm(f.paid_at)}</span>
                  : s.can_confirm || s.status === "em_prazo" ? <Btn kind="outline" w={168} disabled={busy} onClick={() => onConfirmLine(f.id)} style={{ height: 40, fontSize: 13 }}>Confirmar Pagamento</Btn> : null}
              </div>
            ))}
          </Card>
        </>
      )}
      <Sec t="Linha do Tempo" />
      <Timeline steps={timeline(s)} />
      <div style={{ height: 4 }} />
    </>
  );
};
