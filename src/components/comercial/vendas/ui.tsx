import { useRef, type CSSProperties, type ReactNode } from "react";
import { Box, Cap, Big, HERO_S, HRow, Hero, ICheck, IChev, Icon, PU, GR, GR2, ROSE, SORA, LINE2 } from "../kit";
import { dm, dmy } from "@/lib/comercial/format";

/* Blocos locais das telas de Vendas — transliterados de /tmp/vendas.py (chips de 22px, linhas de 78px). */
export type SaleStatus = "aguardando_pagamento" | "em_prazo" | "validada" | "cancelada";
export type ChipKind = "aguard" | "prazo" | "valid" | "canc";
export const kindOf = (s: SaleStatus): ChipKind => ({ aguardando_pagamento: "aguard", em_prazo: "prazo", validada: "valid", cancelada: "canc" } as const)[s];
const CHIP: Record<ChipKind, [string, string, string, string]> = {
  aguard: ["Aguardando Pagamento", "#fff", GR, "1px solid #d2c5e3"],
  prazo: ["Em Prazo", "#f2ecf8", PU, ""],
  valid: ["Validada", PU, "#fff", ""],
  canc: ["Cancelada", "#fbeef1", ROSE, ""],
};
export const SaleChip = ({ kind }: { kind: ChipKind }) => {
  const [t, bg, c, b] = CHIP[kind];
  return <span style={{ display: "inline-flex", alignItems: "center", boxSizing: "border-box", height: 22, padding: "0 9px", borderRadius: 11, background: bg, color: c, fontSize: 11, fontWeight: 600, border: b || undefined, whiteSpace: "nowrap" }}>{t}</span>;
};
export const SaleRow = ({ prod, sub, pts, kind, last, onClick }: { prod: ReactNode; sub: ReactNode; pts: ReactNode; kind: ChipKind; last?: boolean; onClick?: () => void }) => (
  <div onClick={onClick} style={{ height: 78, display: "flex", alignItems: "center", gap: 10, borderBottom: last ? undefined : `1px solid ${LINE2}`, cursor: onClick ? "pointer" : undefined }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod}</div>
      <div style={{ marginTop: 2, fontSize: 11.5, color: GR, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
    </div>
    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
      <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em", color: kind === "aguard" || kind === "canc" ? GR : PU }}>{pts}</div>
      <SaleChip kind={kind} />
    </div>
  </div>
);

/** Cartão com linhas (padding 0 16px) */
export const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <Box style={{ padding: "0 16px", ...style }}>{children}</Box>;
/** Linha de dados (vendas.py `rw`) */
export const Rw = ({ l, v, last, h = 50, onClick }: { l: ReactNode; v: ReactNode; last?: boolean; h?: number; onClick?: () => void }) => (
  <div onClick={onClick} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: onClick ? "pointer" : undefined }}>
    <span style={{ flex: "none" }}>{l}</span>
    <span style={{ display: "flex", alignItems: "center", gap: 6, color: PU, fontWeight: 600, minWidth: 0, justifyContent: "flex-end" }}>{v}</span>
  </div>
);
export const Pill = ({ children = "Pelas Taxas" }: { children?: ReactNode }) => (
  <span style={{ height: 20, lineHeight: "20px", padding: "0 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "#f2ecf8", color: PU, whiteSpace: "nowrap" }}>{children}</span>
);
export const Tile3 = ({ a, b, c }: { a: [ReactNode, string]; b: [ReactNode, string]; c: [ReactNode, string] }) => {
  const t = (x: [ReactNode, string], pur: boolean, first: boolean) => (
    <div style={{ flex: 1, padding: "14px 0 14px 16px", borderLeft: first ? undefined : `1px solid ${LINE2}` }}>
      <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 19, letterSpacing: "-0.04em", color: pur ? PU : "#120a1c" }}>{x[0]}</div>
      <div style={{ marginTop: 3, fontSize: 11.5, color: GR2 }}>{x[1]}</div>
    </div>
  );
  return <Box style={{ display: "flex" }}>{t(a, false, true)}{t(b, true, false)}{t(c, false, false)}</Box>;
};
/** Segmentado de itens com a mesma largura (vendas.py `seg`) */
export const SegFlex = <T extends string>({ opts, value, onChange, h = 36 }: { opts: { v: T; l: string }[]; value: T; onChange: (v: T) => void; h?: number }) => (
  <div style={{ height: h, borderRadius: 12, background: "#f2ecf8", padding: 3, display: "flex", boxSizing: "border-box", fontSize: 12.5 }}>
    {opts.map((o) => (
      <div key={o.v} onClick={() => onChange(o.v)} style={{ flex: 1, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", ...(o.v === value ? { background: "#fff", color: PU, fontWeight: 600, boxShadow: "0 1px 2px rgba(67,17,113,.12)" } : { color: "#6b6379" }) }}>{o.l}</div>
    ))}
  </div>
);
/** Cabeçalho da venda (vendas.py `hero`) */
export const SaleHero = ({ prod, cli, kind, pts }: { prod: ReactNode; cli: string; kind: ChipKind; pts: ReactNode }) => (
  <Hero style={{ marginTop: 20, padding: 18 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Cap>{cli.toUpperCase()}</Cap><SaleChip kind={kind} /></div>
    <div style={{ marginTop: 8, fontFamily: SORA, fontWeight: 600, fontSize: 17, letterSpacing: "-0.03em" }}>{prod}</div>
    <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 6 }}><Big sz={32}>{pts}</Big><span style={{ fontSize: 13, color: GR }}>pontos</span></div>
  </Hero>
);
export type Step = [string, string, "done" | "now" | "todo"];
export const Timeline = ({ steps }: { steps: Step[] }) => (
  <Card>
    {steps.map(([t, d, st], i) => (
      <div key={t} style={{ height: 54, display: "flex", alignItems: "center", gap: 12, borderBottom: i === steps.length - 1 ? undefined : `1px solid ${LINE2}` }}>
        {st === "done" ? <div style={{ width: 24, height: 24, borderRadius: 12, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><ICheck /></div>
          : st === "now" ? <div style={{ width: 24, height: 24, borderRadius: 12, background: PU, flex: "none" }} />
          : <div style={{ width: 24, height: 24, boxSizing: "border-box", borderRadius: 12, border: "1.5px solid #d2c5e3", flex: "none" }} />}
        <div style={{ flex: 1, fontSize: 14, fontWeight: st === "now" ? 600 : undefined }}>{t}</div>
        <span style={{ fontSize: 13, color: st !== "todo" ? PU : GR, fontWeight: 600 }}>{d}</span>
      </div>
    ))}
  </Card>
);
export const HeroBlock = ({ cap, big, rows }: { cap: ReactNode; big: ReactNode; rows: [ReactNode, ReactNode][] }) => (
  <div style={{ ...HERO_S, padding: "18px 18px 0" }}>
    <Cap>{cap}</Cap>
    <div style={{ marginTop: 6 }}><Big sz={34}>{big}</Big></div>
    <div style={{ marginTop: 14, borderTop: "1px solid #e6dcf2" }}>{rows.map(([l, r], i) => <HRow key={i} l={l} r={r} last={i === rows.length - 1} />)}</div>
  </div>
);

/* ---------- campos nativos com a aparência do texto do mockup ---------- */
/** Linha "rótulo — valor ▾" com <select> nativo transparente por cima (toque ≥ 40px). */
export const PickRow = ({ l, value, opts, onChange, last, disabled, chev = true }: { l: ReactNode; value: string; opts: { v: string; l: string }[]; onChange: (v: string) => void; last?: boolean; disabled?: boolean; chev?: boolean }) => {
  const cur = opts.find((o) => o.v === value)?.l ?? "Selecione";
  return (
    <div style={{ position: "relative" }}>
      <Rw l={l} last={last} v={<>{cur}{chev && !disabled && <IChev />}</>} />
      {!disabled && (
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={typeof l === "string" ? l : undefined} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", fontSize: 16 }}>
          {value === "" && <option value="">Selecione</option>}
          {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      )}
    </div>
  );
};
/** Data "dd/mm/aaaa" com seletor nativo por baixo. */
export const DateField = ({ value, onChange, max, disabled, icon }: { value: string; onChange: (v: string) => void; max?: string; disabled?: boolean; icon?: ReactNode }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, color: PU, fontWeight: 600 }} onClick={() => { try { ref.current?.showPicker?.(); } catch { /* sem showPicker */ } }}>
      {value ? dmy(value) : "Selecione"}{icon}
      <input ref={ref} type="date" value={value} max={max} disabled={disabled} onChange={(e) => e.target.value && onChange(e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", fontSize: 16 }} />
    </span>
  );
};
export const ICal = () => <Icon d={<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>} w={16} sw={1.8} />;
export const IClip = () => <Icon d={<path d="M21 12l-8.5 8.5a5 5 0 01-7-7L14 5a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 8" />} w={16} sw={1.8} />;
/** "2026-11-04T23:59:00" -> "04/11 · 23h59" */
export const fzShort = (s?: string | null) => (s ? `${dm(s)} · ${s.slice(11, 13)}h${s.slice(14, 16)}` : "—");
/** "2026-11-04T23:59:00" -> "04/11/2026 · 23h59" */
export const fzFull = (s?: string | null) => (s ? `${dmy(s)} · ${s.slice(11, 13)}h${s.slice(14, 16)}` : "—");
export const firstName = (n?: string | null) => (n ?? "").split(" ")[0];
export const FORMA_NOME: Record<string, string> = { cartao: "Cartão de Crédito", pix: "PIX", boleto: "Boleto" };
