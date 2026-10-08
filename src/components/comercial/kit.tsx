import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";

/* Kit visual do Comercial — transliterado dos mockups aprovados (mobile-first, coluna única). */
export const PU = "#431171";
export const GR = "#6f6781";
export const GR2 = "#8c849c";
export const LINE = "#e7e2ee";
export const LINE2 = "#ece7f2";
export const ROSE = "#b4415a";
export const BOX_S: CSSProperties = { border: `1px solid ${LINE}`, borderRadius: 20 };
export const HERO_S: CSSProperties = { border: "1px solid #d2c5e3", background: "#f8f4fc", borderRadius: 20 };
export const SORA = "Sora,sans-serif";

export const Icon = ({ d, w = 16, sw = 1.9, c = PU, fill = "none" }: { d: ReactNode; w?: number; sw?: number; c?: string; fill?: string }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
export const IChev = () => <Icon d={<path d="M6 9l6 6 6-6" />} />;
export const IChevR = ({ c = PU }: { c?: string }) => <Icon d={<path d="M9 6l6 6-6 6" />} c={c} />;
export const IChevG = () => <IChevR c={GR2} />;
export const ICheck = ({ w = 13 }: { w?: number }) => <Icon d={<path d="M5 12l5 5 9-10" />} w={w} sw={2.6} />;
export const ILock = ({ c = GR, w = 18 }: { c?: string; w?: number }) => <Icon d={<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>} w={w} sw={1.8} c={c} />;
export const IPlus = ({ w = 16 }: { w?: number }) => <Icon d={<path d="M12 5v14M5 12h14" />} w={w} sw={2.2} />;
export const IBack = () => <Icon d={<path d="M15 6l-6 6 6 6" />} w={18} />;
export const ISearch = () => <Icon d={<><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>} w={15} c={GR2} />;
export const IPen = () => <Icon d={<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>} sw={1.8} c="#6b6379" />;
export const ITrash = ({ c = "#d2c5e3" }: { c?: string }) => <Icon d={<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6" />} sw={1.8} c={c} />;

/* ---------- tipografia / blocos ---------- */
export const Sec = ({ t, r, mt = 24 }: { t: ReactNode; r?: ReactNode; mt?: number }) => (
  <div style={{ margin: `${mt}px 0 10px`, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 30 }}>
    <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em" }}>{t}</div>{r}
  </div>
);
export const Cap = ({ children, c = PU }: { children: ReactNode; c?: string }) => <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", color: c }}>{children}</div>;
export const Big = ({ children, sz = 32, c = "#120a1c" }: { children: ReactNode; sz?: number; c?: string }) => (
  <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: sz, letterSpacing: "-0.04em", color: c, lineHeight: 1.1 }}>{children}</div>
);
export const Box = ({ children, style, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) => <div onClick={onClick} style={{ ...BOX_S, ...style }}>{children}</div>;
export const Hero = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ ...HERO_S, ...style }}>{children}</div>;
export const HRow = ({ l, r, last, bg = "#e6dcf2" }: { l: ReactNode; r: ReactNode; last?: boolean; bg?: string }) => (
  <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? undefined : `1px solid ${bg}`, fontSize: 14 }}>
    <span>{l}</span><span style={{ color: PU, fontWeight: 600 }}>{r}</span>
  </div>
);
export const Row = ({ l, r, last, onClick }: { l: ReactNode; r: ReactNode; last?: boolean; onClick?: () => void }) => (
  <div onClick={onClick} style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: onClick ? "pointer" : undefined }}>
    <span>{l}</span><span style={{ color: PU, fontWeight: 600 }}>{r}</span>
  </div>
);
export const Dot = ({ c }: { c: string }) => <i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: c, flex: "none" }} />;
export const Toggle = ({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) => (
  <div role="switch" aria-checked={on} onClick={() => !disabled && onChange?.(!on)} style={{ width: 40, height: 24, borderRadius: 12, background: on ? PU : "#e4dcee", position: "relative", cursor: disabled ? "default" : "pointer", flex: "none" }}>
    <div style={{ position: "absolute", [on ? "right" : "left"]: 3, top: 3, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
  </div>
);
export const Seg = <T extends string | number>({ opts, value, onChange, w = 50, disabled }: { opts: { v: T; l: ReactNode }[]; value: T; onChange?: (v: T) => void; w?: number; disabled?: boolean }) => (
  <div style={{ height: 36, borderRadius: 12, background: "#f2ecf8", padding: 3, display: "flex", boxSizing: "border-box", fontSize: 13 }}>
    {opts.map((o) => (
      <div key={String(o.v)} onClick={() => !disabled && onChange?.(o.v)} style={{ width: w, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "default" : "pointer", ...(o.v === value ? { background: "#fff", color: PU, fontWeight: 600, boxShadow: "0 1px 2px rgba(67,17,113,.12)" } : { color: "#6b6379" }) }}>{o.l}</div>
    ))}
  </div>
);
export const Chip = ({ kind, children }: { kind: "aguard" | "prazo" | "valid" | "canc" | "prog" | "vig" | "sem"; children: ReactNode }) => {
  const st: Record<string, CSSProperties> = {
    aguard: { background: "#f2ecf8", color: PU }, prazo: { background: "#fff", border: "1px solid #d2c5e3", color: PU }, valid: { background: PU, color: "#fff" },
    canc: { background: "#fbeef1", color: ROSE }, prog: { background: "#f2ecf8", color: PU }, vig: { background: PU, color: "#fff" }, sem: { border: `1px solid ${LINE}`, color: GR2 },
  };
  return <span style={{ display: "inline-block", height: 20, lineHeight: "20px", padding: "0 9px", borderRadius: 10, fontSize: 11, fontWeight: 600, boxSizing: "border-box", ...(kind === "prazo" || kind === "sem" ? { lineHeight: "18px" } : {}), ...st[kind] }}>{children}</span>;
};
export const Avatar = ({ name, sz = 44, on = true }: { name: string; sz?: number; on?: boolean }) => (
  <div style={{ width: sz, height: sz, borderRadius: sz / 2, background: on ? "#f2ecf8" : "#f4f2f7", color: on ? PU : GR2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SORA, fontWeight: 600, fontSize: sz * 0.34, flex: "none" }}>
    {name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
  </div>
);

/* ---------- botões ---------- */
export const Btn = ({ children, kind = "primary", onClick, disabled, w, style }: { children: ReactNode; kind?: "primary" | "outline" | "danger"; onClick?: () => void; disabled?: boolean; w?: number | string; style?: CSSProperties }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={{
    width: w, flex: w ? undefined : 1, height: 48, boxSizing: "border-box", borderRadius: 14, fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
    ...(kind === "primary" ? { background: PU, color: "#fff", border: "none" } : kind === "danger" ? { background: "#fff", color: ROSE, border: `1px solid ${ROSE}` } : { background: "#fff", color: PU, border: "1px solid #d2c5e3" }), ...style,
  }}>{children}</button>
);

/* ---------- editor de valor (toque para editar, mesma tipografia) ---------- */
export const EditValue = ({ value, onChange, suffix = "", prefix = "", w = 64, h = 30, r = 8, fs = 13, dec = 0, align = "center", disabled, font, ph }: {
  value: number | string | null; onChange?: (v: number) => void; suffix?: string; prefix?: string; w?: number | string; h?: number; r?: number; fs?: number; dec?: number; align?: "center" | "right"; disabled?: boolean; font?: string; ph?: string;
}) => {
  const fmt = (v: number | string | null) => (v === null || v === "" ? "" : new Intl.NumberFormat("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Number(v)));
  const [txt, setTxt] = useState(fmt(value));
  const [foc, setFoc] = useState(false);
  useEffect(() => { if (!foc) setTxt(fmt(value)); /* eslint-disable-next-line */ }, [value, foc, dec]);
  return (
    <label style={{ width: w, height: h, boxSizing: "border-box", border: "1px solid #d2c5e3", borderRadius: r, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-end", padding: "0 6px", fontSize: fs, color: PU, fontFamily: font, background: disabled ? "#faf8fc" : "#fff" }}>
      {prefix}
      {suffix || prefix ? (
        <span style={{ position: "relative", display: "inline-block" }}><span aria-hidden style={{ visibility: "hidden", whiteSpace: "pre" }}>{txt || ph || " "}</span>
      <input inputMode="decimal" disabled={disabled} value={txt} placeholder={ph}
        onFocus={() => setFoc(true)}
        onChange={(e) => { const t = e.target.value.replace(/[^\d.,]/g, ""); setTxt(t); }}
        onBlur={() => { setFoc(false); const raw = txt.replace(/\./g, "").replace(",", "."); if (raw === "") return; const n = Number(raw); if (!Number.isNaN(n)) onChange?.(n); }}
        style={{ border: "none", outline: "none", background: "transparent", position: "absolute", inset: 0, width: "100%", minWidth: 0, textAlign: align === "center" ? "center" : "right", font: "inherit", color: "inherit", padding: 0 }} /></span>
      ) : (
      <input inputMode="decimal" disabled={disabled} value={txt} placeholder={ph}
        onFocus={() => setFoc(true)}
        onChange={(e) => { const t = e.target.value.replace(/[^\d.,]/g, ""); setTxt(t); }}
        onBlur={() => { setFoc(false); const raw = txt.replace(/\./g, "").replace(",", "."); if (raw === "") return; const n = Number(raw); if (!Number.isNaN(n)) onChange?.(n); }}
        style={{ border: "none", outline: "none", background: "transparent", width: "100%", minWidth: 0, textAlign: align === "center" ? "center" : "right", font: "inherit", color: "inherit", padding: 0 }} />
      )}
      {suffix}
    </label>
  );
};
export const TextField = ({ value, onChange, placeholder, h = 48, disabled, type = "text", mono }: { value: string; onChange?: (v: string) => void; placeholder?: string; h?: number; disabled?: boolean; type?: string; mono?: boolean }) => (
  <input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
    style={{ width: "100%", height: h, boxSizing: "border-box", border: `1px solid ${LINE}`, borderRadius: 14, padding: "0 14px", fontSize: 14, fontFamily: mono ? SORA : "inherit", color: "#120a1c", outline: "none", background: disabled ? "#faf8fc" : "#fff" }} />
);
export const Stepper = ({ value, onChange, min = 0, max = 99, rose, unit = "" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; rose?: boolean; unit?: string }) => {
  const c = rose ? ROSE : PU;
  const b = (s: string, d: number) => <span onClick={() => onChange(Math.max(min, Math.min(max, value + d)))} style={{ width: 36, textAlign: "center", fontSize: 16, cursor: "pointer", userSelect: "none", height: 40, lineHeight: "40px" }}>{s}</span>;
  return <div style={{ display: "flex", alignItems: "center", height: 40, border: `1px solid ${rose ? ROSE : "#d2c5e3"}`, borderRadius: 12, color: c, fontWeight: 600, fontSize: 14 }}>{b("−", -1)}<span style={{ padding: "0 6px" }}>{value}{unit}</span>{b("+", 1)}</div>;
};

/* ---------- estrutura de página ---------- */
export type NavKey = "Painel" | "Vendas" | "Calculadora" | "Perfil" | "Menu";
const NAVI: { n: NavKey; p: ReactNode | null; to: string }[] = [
  { n: "Painel", to: "/intranet/painel", p: <><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></> },
  { n: "Vendas", to: "/intranet/vendas", p: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" /> },
  { n: "Calculadora", to: "/intranet/calculadora", p: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" /></> },
  { n: "Perfil", to: "/intranet/cadastro", p: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" /></> },
  { n: "Menu", to: "/intranet/metas", p: null },
];
export const BottomNav = ({ active }: { active: NavKey }) => {
  const go = useNavigate();
  const { isManager } = useAuth();
  return (
    <div style={{ position: "sticky", bottom: 0, height: 78, boxSizing: "border-box", borderTop: `1px solid ${LINE}`, background: "#fff", display: "flex", justifyContent: "space-between", padding: "12px 12px 0", zIndex: 5 }}>
      {NAVI.map(({ n, p, to }) => {
        const on = n === active; const c = on ? PU : "#6b6379";
        const dest = n === "Menu" && !isManager ? "/intranet/areas" : to;
        return (
          <div key={n} onClick={() => go(dest)} style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontSize: 11, color: c, fontWeight: on ? 600 : undefined, cursor: "pointer" }}>
            {p === null
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>}
            {n}
          </div>
        );
      })}
    </div>
  );
};

/** Moldura: coluna mobile (até 430px), cabeçalho 60px com voltar, corpo, rodapé e navegação inferior. */
export const Shell = ({ title, back, nav = "Menu", pad = "4px 24px 0", children, footer, noNav, right }: {
  title: ReactNode; back?: string | (() => void) | null; nav?: NavKey; pad?: string; children: ReactNode; footer?: ReactNode; noNav?: boolean; right?: ReactNode;
}) => {
  const go = useNavigate(); const loc = useLocation();
  const doBack = () => (typeof back === "function" ? back() : back ? go(back) : window.history.length > 1 && loc.key !== "default" ? go(-1) : go("/intranet/metas"));
  return (
    <div style={{ background: "#eee9f4", minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#120a1c" }}>
      <Helmet><title>{typeof title === "string" ? `${title} — Comercial` : "Comercial"}</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ height: 60, flex: "none", boxSizing: "border-box", padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${LINE2}` }}>
          {back !== null && <div onClick={doBack} style={{ width: 40, height: 40, borderRadius: 20, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IBack /></div>}
          <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 17, letterSpacing: "-0.03em", flex: 1 }}>{title}</div>{right}
        </div>
        <div style={{ flex: 1, padding: pad }}>{children}</div>
        {footer}
        {!noNav && <BottomNav active={nav} />}
      </div>
    </div>
  );
};
export const Foot = ({ note, children }: { note?: ReactNode; children: ReactNode }) => (
  <div style={{ marginTop: 24, borderTop: `1px solid ${LINE}`, padding: "14px 24px 20px" }}>
    {note !== undefined && <div style={{ marginBottom: 10, textAlign: "center", fontSize: 11.5, color: GR2 }}>{note}</div>}
    <div style={{ display: "flex", gap: 10 }}>{children}</div>
  </div>
);

/* ---------- etapas / travado / definir ---------- */
export const STEPS = ["Meta", "Pesos", "Ganho", "Operação", "Projeção"] as const;
export type Step = (typeof STEPS)[number];
export const StepTabs = ({ active, onGo }: { active: Step; onGo?: (s: Step) => void }) => {
  const ai = STEPS.indexOf(active);
  return (
    <div style={{ marginTop: 16, display: "flex" }}>
      {STEPS.map((n, i) => {
        const done = i < ai, on = i === ai;
        const circ = done ? <div style={{ width: 28, height: 28, borderRadius: 14, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center" }}><ICheck /></div>
          : on ? <div style={{ width: 28, height: 28, borderRadius: 14, background: PU, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{i + 1}</div>
          : <div style={{ width: 28, height: 28, boxSizing: "border-box", borderRadius: 14, border: "1.5px solid #d2c5e3", color: GR2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{i + 1}</div>;
        const ln = (c: string, vis: boolean) => <div style={{ flex: 1, height: 2, background: vis ? c : "transparent" }} />;
        return (
          <div key={n} onClick={() => onGo?.(n)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: onGo ? "pointer" : undefined }}>
            <div style={{ width: "100%", display: "flex", alignItems: "center" }}>{ln(i <= ai ? PU : "#e6dcf2", i > 0)}{circ}{ln(i < ai ? PU : "#e6dcf2", i < 4)}</div>
            <div style={{ marginTop: 6, fontSize: 12, ...(on ? { color: PU, fontWeight: 600 } : { color: "#6b6379" }) }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
};
export const TravadoStrip = ({ desde }: { desde: string }) => (
  <div style={{ marginTop: 14, ...HERO_S, borderRadius: 16, height: 48, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ILock />Travado</span><span style={{ color: PU, fontWeight: 600 }}>Desde {desde}</span>
  </div>
);
const DefRow = ({ right, onClick }: { right: ReactNode; onClick?: () => void }) => (
  <div onClick={onClick} style={{ marginTop: 20, border: `1px solid ${LINE}`, borderRadius: 20, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, cursor: onClick ? "pointer" : undefined }}><span>Definir para</span>{right}</div>
);
export const DefinirLock = ({ label }: { label: string }) => <DefRow right={<span style={{ display: "flex", alignItems: "center", gap: 8, color: GR, fontWeight: 600 }}>{label}<ILock /></span>} />;
export type MesOpt = { month: string; label: string; tag?: string; locked?: boolean };
/** "Nov e Dez/2026" */
export const mesesResumo = (ms: string[]) => {
  if (!ms.length) return "Selecione";
  const ab = (m: string) => ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][Number(m.slice(5, 7)) - 1];
  const yrs = [...new Set(ms.map((m) => m.slice(0, 4)))];
  if (yrs.length === 1) return `${ms.length === 1 ? ab(ms[0]) : ms.slice(0, -1).map(ab).join(", ") + " e " + ab(ms[ms.length - 1])}/${yrs[0]}`;
  return ms.length === 1 ? `${ab(ms[0])}/${ms[0].slice(0, 4)}` : `${ms.length} meses`;
};
export const Definir = ({ opts, value, onChange }: { opts: MesOpt[]; value: string[]; onChange: (v: string[]) => void }) => {
  const [open, setOpen] = useState(false); const [q, setQ] = useState(""); const [sel, setSel] = useState(value);
  useEffect(() => setSel(value), [value]);
  const shown = opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <DefRow onClick={() => { setSel(value); setOpen(!open); }} right={<span style={{ display: "flex", alignItems: "center", gap: 6, color: PU, fontWeight: 600 }}>{mesesResumo(value)}<IChev /></span>} />
      {open && (
        <div style={{ marginTop: 8, border: "1px solid #d2c5e3", borderRadius: 20, padding: "0 16px 4px", boxShadow: "0 8px 24px rgba(67,17,113,.10)" }}>
          <div style={{ height: 38, border: `1px solid ${LINE}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontSize: 13, color: GR2, margin: "12px 0 4px" }}>
            <ISearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar mês" style={{ border: "none", outline: "none", flex: 1, fontSize: 13, background: "transparent" }} />
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {shown.map((o, i) => {
              const on = sel.includes(o.month);
              return (
                <div key={o.month} onClick={() => !o.locked && setSel(on ? sel.filter((x) => x !== o.month) : [...sel, o.month].sort())}
                  style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i === shown.length - 1 ? undefined : `1px solid ${LINE2}`, fontSize: 14, cursor: o.locked ? "default" : "pointer" }}>
                  <span>{o.label}{o.tag && <span style={{ fontSize: 11, color: GR2, marginLeft: 6 }}>{o.tag}</span>}</span>
                  {o.locked ? <ILock /> : on ? <div style={{ width: 22, height: 22, borderRadius: 11, background: "#f2ecf8", display: "flex", alignItems: "center", justifyContent: "center" }}><ICheck /></div> : <div style={{ width: 22, height: 22, boxSizing: "border-box", borderRadius: 11, border: "1.5px solid #d2c5e3" }} />}
                </div>
              );
            })}
          </div>
          <div onClick={() => { if (sel.length) { onChange(sel); setOpen(false); } }} style={{ margin: "6px 0 12px", height: 40, borderRadius: 12, background: PU, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: sel.length ? 1 : 0.5 }}>
            Aplicar a {sel.length} {sel.length === 1 ? "Mês" : "Meses"}
          </div>
        </div>
      )}
    </>
  );
};

/* ---------- estados ---------- */
export const Loading = () => <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: GR2 }}>Carregando…</div>;
export const ErrorBox = ({ e }: { e: unknown }) => <div style={{ margin: "24px 0", padding: 16, border: `1px solid ${ROSE}`, borderRadius: 16, fontSize: 13, color: ROSE }}>{(e as Error)?.message ?? "Erro"}</div>;
export const Empty = ({ children }: { children: ReactNode }) => <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: GR2 }}>{children}</div>;
