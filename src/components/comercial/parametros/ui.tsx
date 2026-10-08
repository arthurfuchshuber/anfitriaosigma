import { useState, type CSSProperties, type ReactNode } from "react";
import { GR, LINE, PU, ROSE } from "../kit";

/* Peças locais das telas de Parâmetros (o kit não cobre campos numéricos "nus" nem anuláveis). */

const nfDef = (v: number) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
export const numFmt = nfDef;

/** Campo numérico editável. `box` desenha a caixinha dos mockups; sem `box`, é o texto do mockup editável no próprio lugar. */
export const Num = ({
  value, onChange, fmt, align = "right", disabled, nullable, box, w = "100%", h = 44, r = 8, fs, font, color, weight, ph,
}: {
  value: number | null | undefined; onChange?: (v: number | null) => void; fmt?: (v: number) => string; align?: "left" | "center" | "right"; disabled?: boolean; nullable?: boolean;
  box?: boolean; w?: number | string; h?: number; r?: number; fs?: number; font?: string; color?: string; weight?: number; ph?: string;
}) => {
  const f = fmt ?? nfDef;
  const [foc, setFoc] = useState(false);
  const [txt, setTxt] = useState("");
  const shown = foc ? txt : value === null || value === undefined ? "" : f(value);
  const commit = () => {
    setFoc(false);
    const raw = txt.replace(/\./g, "").replace(",", ".").trim();
    if (raw === "") { if (nullable && value !== null && value !== undefined) onChange?.(null); return; }
    const n = Number(raw);
    if (!Number.isNaN(n) && n !== value) onChange?.(n);
  };
  const input = (
    <input
      inputMode="decimal" readOnly={disabled} value={shown} placeholder={ph}
      onFocus={(e) => { if (disabled) return; setTxt(value === null || value === undefined ? "" : nfDef(value)); setFoc(true); const t = e.target; setTimeout(() => t.select(), 0); }}
      onChange={(e) => setTxt(e.target.value.replace(/[^\d.,]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{ border: "none", outline: "none", background: "transparent", width: "100%", minWidth: 0, height: box ? "100%" : h, padding: 0, textAlign: align, font: "inherit", color: "inherit", fontWeight: "inherit", letterSpacing: "inherit", cursor: disabled ? "default" : "text" }}
    />
  );
  if (!box) return <div style={{ width: w, height: h, display: "flex", alignItems: "center", color, fontWeight: weight, fontFamily: font, fontSize: fs }}>{input}</div>;
  return (
    <div style={{ width: w, height: h, boxSizing: "border-box", border: "1px solid #d2c5e3", borderRadius: r, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-end", padding: "0 6px", fontSize: fs, color: color ?? PU, fontFamily: font, background: "#fff" }}>{input}</div>
  );
};

export const Cap11 = ({ children, c = PU }: { children: ReactNode; c?: string }) => <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: c }}>{children}</div>;

export const Pill = ({ children }: { children: ReactNode }) => (
  <span style={{ height: 24, padding: "0 10px", borderRadius: 12, background: "#fff", border: "1px solid #d2c5e3", color: PU, fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center" }}>{children}</span>
);

export const BoxPad = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ border: `1px solid ${LINE}`, borderRadius: 20, padding: "0 16px", ...style }}>{children}</div>
);

/** Rodapé de etapa — transliterado de foot_step/FOOT_FIRST/FOOT_PUB/FOOT_LOCK. */
export const StepFoot = ({ note, noteRose, back, next, nextLabel, nextDisabled, nextBusy, outline, onBack, onNext }: {
  note: ReactNode; noteRose?: boolean; back?: boolean; next?: boolean; nextLabel?: ReactNode; nextDisabled?: boolean; nextBusy?: boolean; outline?: boolean; onBack?: () => void; onNext?: () => void;
}) => (
  <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, padding: "14px 24px 20px" }}>
    <div style={{ marginBottom: 10, textAlign: "center", fontSize: 11.5, color: noteRose ? ROSE : GR }}>{note}</div>
    <div style={{ display: "flex", gap: 10 }}>
      {back && <button type="button" onClick={onBack} style={{ width: 96, height: 48, boxSizing: "border-box", borderRadius: 14, border: "1px solid #d2c5e3", background: "#fff", color: PU, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Voltar</button>}
      {next && (
        <button type="button" disabled={nextDisabled || nextBusy} onClick={onNext}
          style={{
            flex: 1, height: outline ? 50 : 48, boxSizing: "border-box", borderRadius: 14, fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: nextDisabled ? "default" : "pointer",
            ...(outline ? { border: "1px solid #d2c5e3", background: "#fff", color: PU } : nextDisabled ? { border: "none", background: "#e4dcee", color: GR } : { border: "none", background: PU, color: "#fff", opacity: nextBusy ? 0.6 : 1 }),
          }}>{nextLabel}</button>
      )}
    </div>
  </div>
);
