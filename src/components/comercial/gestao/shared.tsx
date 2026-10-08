import { type CSSProperties, type ReactNode } from "react";
import { BOX_S, GR, LINE, LINE2, PU, SORA, ISearch, ICheck } from "../kit";

/* Peças compartilhadas das telas de gestão do Comercial (Hub, Calculadora, Produtos, Vendedores). */

/** Legenda em caixa-alta (11px: piso de legibilidade dos mockups finais). */
export const Cap11 = ({ children, c = PU }: { children: ReactNode; c?: string }) => (
  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: c }}>{children}</div>
);

/** Cartão de 3 números lado a lado (tile3 dos mockups). */
export const Tile3 = ({ cells }: { cells: { v: ReactNode; l: string; pur?: boolean }[] }) => (
  <div style={{ ...BOX_S, display: "flex" }}>
    {cells.map((c, i) => (
      <div key={c.l} style={{ flex: 1, minWidth: 0, padding: "14px 0 14px 16px", borderLeft: i ? `1px solid ${LINE2}` : undefined }}>
        <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 19, letterSpacing: "-0.04em", color: c.pur ? PU : "#120a1c" }}>{c.v}</div>
        <div style={{ marginTop: 3, fontSize: 11.5, color: GR }}>{c.l}</div>
      </div>
    ))}
  </div>
);

/** Rodapé fixo-de-fluxo das telas (borda superior + padding), igual ao Foot do kit, mas para conteúdo empilhado. */
export const FootBox = ({ children }: { children: ReactNode }) => <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, padding: "14px 24px 20px" }}>{children}</div>;

/** Seletor em pílula (Ativos/Inativos) dos mockups de lista. */
export const SegPill = <T extends string>({ opts, value, onChange }: { opts: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) => (
  <div style={{ height: 36, borderRadius: 18, background: "#f2ecf8", padding: 3, display: "flex", boxSizing: "border-box", fontSize: 12.5 }}>
    {opts.map((o) => (
      <div key={o.v} onClick={() => onChange(o.v)} style={{ padding: "0 12px", borderRadius: 12, display: "flex", alignItems: "center", cursor: "pointer", ...(o.v === value ? { background: "#fff", color: PU, fontWeight: 600, boxShadow: "0 1px 2px rgba(67,17,113,.12)" } : { color: "#6b6379" }) }}>{o.l}</div>
    ))}
  </div>
);

/** Avatar de uma letra (listas) ou duas (popover), nos tamanhos dos mockups. */
export const Ini = ({ name, sz = 40, fs = 14, one = true, on = false }: { name: string; sz?: number; fs?: number; one?: boolean; on?: boolean }) => {
  const w = name.split(" ").filter(Boolean);
  const t = one ? (w[0]?.[0] ?? "") : w.slice(0, 2).map((x) => x[0]).join("");
  return (
    <div style={{ width: sz, height: sz, borderRadius: sz / 2, background: on ? PU : "#f2ecf8", color: on ? "#fff" : PU, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SORA, fontWeight: 600, fontSize: fs, flex: "none" }}>{t.toUpperCase()}</div>
  );
};

/** Popover ancorado no pai (position:relative) com fundo que fecha ao tocar fora. */
export const Pop = ({ top, bottom, onClose, children, style }: { top?: number; bottom?: number; onClose: () => void; children: ReactNode; style?: CSSProperties }) => (
  <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 4 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top, bottom, zIndex: 5, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, boxShadow: "0 12px 28px rgba(67,17,113,0.14)", padding: 6, ...style }}>{children}</div>
  </>
);

export const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div style={{ height: 40, margin: "2px 2px 6px", border: `1px solid ${LINE}`, background: "#faf8fc", borderRadius: 12, padding: "0 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: GR }}>
    <ISearch />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, fontSize: 13.5, fontFamily: "inherit", color: "#120a1c" }} />
  </div>
);

/** Item de lista dentro de popover: avatar + nome (+ subtítulo) + marca de selecionado. */
export const PopItem = ({ on, onClick, avatar, children, sub }: { on?: boolean; onClick: () => void; avatar?: ReactNode; children: ReactNode; sub?: ReactNode }) => (
  <div onClick={onClick} style={{ minHeight: 48, borderRadius: 12, padding: "0 10px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: on ? "#f2ecf8" : undefined }}>
    {avatar}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, ...(on ? { fontWeight: 600, color: PU } : {}) }}>{children}</div>
      {sub && <div style={{ fontSize: 11.5, color: GR }}>{sub}</div>}
    </div>
    {on && <ICheck w={16} />}
  </div>
);
