import { useState, type ReactNode } from "react";
import { IChevR, Sec, TextField, PU, LINE, LINE2, GR } from "../kit";
import { dmy, mesLabel, n0, n1, pc, rs } from "@/lib/comercial/format";
import { Card, Rw, SaleHero, firstName, fzFull, kindOf } from "./ui";
import type { Sale } from "./VendaView";

export type CancelPreview = {
  seller: string; month: string; congelado: boolean; pontos: [number, number]; atingimento: [number, number]; fator: [number, number]; bonus: [number, number];
  diferenca: number; congelado_em: string; bonus_pago_em: string; hoje: string; cancelada_por: string;
};
export type Decision = "manter" | "ajustar";

const Ef = ({ l, a, b, last }: { l: string; a: ReactNode; b: ReactNode; last?: boolean }) => (
  <div style={{ height: 50, display: "flex", alignItems: "center", gap: 8, borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14 }}>
    <span style={{ flex: 1 }}>{l}</span><span style={{ color: GR }}>{a}</span><span style={{ width: 18, textAlign: "center", color: GR }}>›</span>
    <span style={{ width: 76, textAlign: "right", color: PU, fontWeight: 600 }}>{b}</span>
  </div>
);
const Opt = ({ t, v, on, onClick }: { t: string; v: string; on: boolean; onClick: () => void }) => (
  <div onClick={onClick} style={{ minHeight: 64, display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box", padding: "0 16px", borderRadius: 20, border: `1px solid ${on ? "#d2c5e3" : LINE}`, background: on ? "#f8f4fc" : undefined, cursor: "pointer" }}>
    <div style={{ width: 22, height: 22, boxSizing: "border-box", borderRadius: 11, border: on ? `6px solid ${PU}` : "1.5px solid #d2c5e3", flex: "none" }} />
    <div style={{ flex: 1, fontSize: 14, fontWeight: on ? 600 : undefined }}>{t}</div>
    <span style={{ color: PU, fontWeight: 600, fontSize: 14 }}>{v}</span>
  </div>
);

/** Cancelar Venda após o congelamento — mockup VendaCancelForaPrazo. */
export const CancelarView = ({ s, pv, isManager, decision, onDecision, motivo, onMotivo }: {
  s: Sale; pv: CancelPreview; isManager: boolean; decision: Decision; onDecision: (d: Decision) => void; motivo: string; onMotivo: (m: string) => void;
}) => {
  const [openMotivo, setOpenMotivo] = useState(false);
  return (
    <>
      <SaleHero prod={s.produto} cli={s.cliente} kind={kindOf(s.status)} pts={n0(s.pontos)} />
      <Sec t="Mês Afetado" />
      <Card>
        <Rw l="Mês do Registro" v={mesLabel(pv.month)} />
        <Rw l="Cancelável Até" v={dmy(s.cancelavel_ate)} />
        <Rw l="Resultado Congelado em" v={fzFull(pv.congelado_em)} />
        <Rw l="Bônus Pago em" v={dmy(pv.bonus_pago_em)} />
        <Rw l="Cancelada em" v={dmy(pv.hoje)} />
        <Rw l="Cancelada Por" v={pv.cancelada_por} last />
      </Card>
      <Sec t={`Se Recalculado · ${firstName(pv.seller)}`} />
      <Card>
        <Ef l="Pontos" a={n0(pv.pontos[0])} b={n0(pv.pontos[1])} />
        <Ef l="Atingimento" a={pc(pv.atingimento[0], 0)} b={pc(pv.atingimento[1], 0)} />
        <Ef l="Fator da Régua" a={`×${n1(pv.fator[0])}`} b={`×${n1(pv.fator[1])}`} />
        <Ef l="Bônus" a={rs(pv.bonus[0])} b={rs(pv.bonus[1])} last />
      </Card>
      {isManager && (
        <>
          <Sec t="Decisão do Gestor" />
          <Opt t="Manter Resultado Congelado" v="R$ 0" on={decision === "manter"} onClick={() => onDecision("manter")} />
          <div style={{ height: 8 }} />
          <Opt t="Ajustar Manualmente" v={rs(pv.diferenca)} on={decision === "ajustar"} onClick={() => { onDecision("ajustar"); setOpenMotivo(true); }} />
          <div style={{ height: 8 }} />
          <Card>
            <Rw l="Motivo do Ajuste" last={!(openMotivo || decision === "ajustar")} onClick={() => setOpenMotivo(!openMotivo)}
              v={<>{motivo ? <span style={{ maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{motivo}</span> : decision === "ajustar" ? "Obrigatório" : "Opcional"}<IChevR /></>} />
            {(openMotivo || decision === "ajustar") && <div style={{ padding: "0 0 14px" }}><TextField value={motivo} onChange={onMotivo} placeholder="Descreva o motivo do ajuste" /></div>}
          </Card>
        </>
      )}
      <div style={{ height: 4 }} />
    </>
  );
};
