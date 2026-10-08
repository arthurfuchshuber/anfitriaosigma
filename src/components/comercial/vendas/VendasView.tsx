import { useState } from "react";
import { Big, Cap, Empty, Hero, HRow, Sec } from "../kit";
import { n0, pc, mesLabel, dm } from "@/lib/comercial/format";
import { Card, PickRow, SaleRow, SegFlex, Tile3, firstName, fzShort, kindOf, type SaleStatus } from "./ui";


export type SaleRowT = { id: string; produto: string; cliente: string; vendedor: string; data: string; pontos: number; status: SaleStatus };
export type SalesList = {
  month: string; todos?: boolean; sem_vendedor?: boolean; seller?: { id: string; name: string } | null;
  sellers?: { id: string; name: string }[];
  hero?: { meta: number; confirmado: number; validadas: number; em_prazo: number; aguardando: number; atingimento: number | null; congelamento: string; gatilho?: number; abaixo_gatilho?: boolean };
  rows?: SaleRowT[];
};
type Filter = "todas" | "abertas" | "validadas" | "canceladas";
const FILTERS: { v: Filter; l: string }[] = [{ v: "todas", l: "Todas" }, { v: "abertas", l: "Abertas" }, { v: "validadas", l: "Validadas" }, { v: "canceladas", l: "Canceladas" }];
const pass = (f: Filter, s: SaleStatus) => f === "todas" || (f === "abertas" && (s === "aguardando_pagamento" || s === "em_prazo")) || (f === "validadas" && s === "validada") || (f === "canceladas" && s === "cancelada");

/** Vendas (vendedor) e Vendas · Todos (gestor/admin) — mockups Vendas e VendasTodos. */
export const VendasView = ({ data, isManager, selected, onSelect, onOpen }: { data: SalesList; isManager: boolean; selected: string; onSelect: (v: string) => void; onOpen: (id: string) => void }) => {
  const [filter, setFilter] = useState<Filter>("todas");
  const h = data.hero!;
  const todos = !!data.todos;
  const sellers = data.sellers ?? [];
  const canPick = isManager || sellers.length > 1;
  const opts = [...(isManager ? [{ v: "todos", l: "Todos" }] : []), ...sellers.map((s) => ({ v: s.id, l: s.name }))];
  const rows = (data.rows ?? []).filter((r) => pass(filter, r.status));
  const att = h.atingimento == null ? "—" : pc(h.atingimento, 0);
  return (
    <>
      <div style={{ marginTop: 20 }}>
        <Card>
          <PickRow l="Vendedor" last value={todos ? "todos" : data.seller?.id ?? selected} opts={opts.length ? opts : [{ v: data.seller?.id ?? "", l: data.seller?.name ?? "—" }]} onChange={onSelect} disabled={!canPick} />
        </Card>
      </div>
      <Hero style={{ marginTop: 12, padding: "18px 18px 0" }}>
        <Cap>{`PONTOS CONFIRMADOS · ${mesLabel(data.month).toUpperCase()}`}</Cap>
        <div style={{ marginTop: 6 }}><Big sz={34}>{n0(h.confirmado)}</Big></div>
        <div style={{ marginTop: 14, borderTop: "1px solid #e6dcf2" }}>
          {todos ? (
            <>
              <HRow l="Meta do Time" r={n0(h.meta)} />
              <HRow l="Atingimento" r={att} />
              <HRow l="Congelamento" r={fzShort(h.congelamento)} last />
            </>
          ) : (
            <>
              <HRow l="Meta" r={n0(h.meta)} />
              <HRow l="Atingimento" r={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {h.abaixo_gatilho && <span style={{ height: 22, lineHeight: "22px", padding: "0 9px", borderRadius: 11, background: "#fbeef1", color: "#b4415a", fontSize: 11, fontWeight: 600 }}>Abaixo do Gatilho</span>}{att}
                </span>} />
              <HRow l="Congelamento" r={fzShort(h.congelamento)} />
              <HRow l="Gatilho Mínimo" r={h.gatilho == null ? "—" : pc(h.gatilho, 0)} last />
            </>
          )}
        </div>
      </Hero>
      <div style={{ height: 12 }} />
      <Tile3 a={[n0(h.validadas), "Validadas"]} b={[n0(h.em_prazo), "Em Prazo"]} c={[n0(h.aguardando), "Aguardando"]} />
      <Sec t="Vendas" />
      <SegFlex<Filter> opts={FILTERS} value={filter} onChange={setFilter} h={40} />
      <div style={{ height: 10 }} />
      <Card>
        {rows.length === 0 && <Empty>Nenhuma venda neste filtro.</Empty>}
        {rows.map((r, i) => (
          <SaleRow key={r.id} prod={r.produto} sub={`${todos ? `${firstName(r.vendedor)} · ` : ""}${r.cliente} · ${dm(r.data)}`} pts={n0(r.pontos)} kind={kindOf(r.status)} last={i === rows.length - 1} onClick={() => onOpen(r.id)} />
        ))}
      </Card>
      <div style={{ height: 4 }} />
    </>
  );
};
