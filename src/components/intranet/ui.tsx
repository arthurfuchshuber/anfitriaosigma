import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ArrowRight, Loader2, X } from "lucide-react";
import { initials } from "@/lib/intranet/format";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "primary" | "secondary" | "ghost" | "danger"; size?: "md" | "sm"; arrow?: boolean; block?: boolean; busy?: boolean; mfull?: boolean;
};
export const Btn = ({ kind = "primary", size = "md", arrow, block, busy, mfull, children, className = "", disabled, ...r }: BtnProps) => (
  <button {...r} disabled={disabled || busy} className={`ix-btn ${kind} ${size === "sm" ? "sm" : ""} ${block ? "block" : ""} ${mfull ? "mfull" : ""} ${kind === "primary" && !arrow ? "noarrow" : ""} ${className}`}>
    {busy && <Loader2 size={16} className="animate-spin" />}
    {children}
    {kind === "primary" && arrow && <span className="arr"><ArrowRight size={size === "sm" ? 14 : 16} /></span>}
  </button>
);

export const Chip = ({ tone, children }: { tone?: "pending" | "error" | "muted"; children: ReactNode }) => <span className={`ix-chip ${tone ?? ""}`}>{children}</span>;

export const SaleChip = ({ status, floor }: { status: string; floor?: string }) => {
  if (floor === "needs_approval") return <Chip tone="pending">Aguardando piso</Chip>;
  if (status === "pending") return <Chip tone="pending">Pendente</Chip>;
  if (status === "validated") return <Chip>Validada</Chip>;
  return <Chip tone="error">Cancelada</Chip>;
};

export const Card = ({ children, lilac, lg, style, className = "" }: { children: ReactNode; lilac?: boolean; lg?: boolean; style?: React.CSSProperties; className?: string }) => (
  <div className={`ix-card ${lilac ? "lilac" : ""} ${lg ? "pad-lg" : ""} ${className}`} style={style}>{children}</div>
);

export const IconBox = ({ children }: { children: ReactNode }) => <span className="ix-icon">{children}</span>;

export const PageHeader = ({ eyebrow, title, accent, text, right }: { eyebrow: string; title: ReactNode; accent?: string; text?: ReactNode; right?: ReactNode }) => (
  <div className="ix-row ix-between ix-wrapflex" style={{ alignItems: "flex-end", margin: "40px 0 28px", gap: 20 }}>
    <div>
      <span className="ix-eyebrow">{eyebrow}</span>
      <h1 className="ix-h1 hd">{title}{accent && <> <span className="gt">{accent}</span></>}</h1>
      {text && <p className="ix-sub">{text}</p>}
    </div>
    {right}
  </div>
);

export const Field = ({ label, hint, error, children }: { label?: string; hint?: string; error?: string | null; children: ReactNode }) => (
  <div className="ix-field">{label && <label className="ix-label">{label}</label>}{children}{hint && !error && <div className="ix-hint">{hint}</div>}{error && <div className="ix-err">{error}</div>}</div>
);
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`ix-input ${p.className ?? ""}`} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`ix-select ${p.className ?? ""}`} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`ix-textarea ${p.className ?? ""}`} />;

export const Banner = ({ children, error, action }: { children: ReactNode; error?: boolean; action?: ReactNode }) => (
  <div className={`ix-banner ${error ? "error" : ""}`}><span className="grow">{children}</span>{action}</div>
);

export const Modal = ({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) => {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ix-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className="ix-modal">
        <div className="ix-row ix-between" style={{ marginBottom: 18 }}>
          <h2 className="ix-h2 hd">{title}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose} style={{ border: 0, background: "#f2ecf8", color: "#431171", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}><X size={16} style={{ margin: "auto" }} /></button>
        </div>
        {children}
        {footer && <div className="ix-row" style={{ marginTop: 22, justifyContent: "flex-end", flexWrap: "wrap" }}>{footer}</div>}
      </div>
    </div>
  );
};

export const Avatar = ({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) => (
  <span className="ix-avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>{src ? <img src={src} alt="" /> : initials(name)}</span>
);

export const Loading = ({ rows = 3 }: { rows?: number }) => (
  <div style={{ display: "grid", gap: 14 }}>{Array.from({ length: rows }).map((_, i) => <div key={i} className="ix-skel" style={{ height: 64 }} />)}</div>
);
export const Empty = ({ children }: { children: ReactNode }) => <div className="ix-card lilac ix-muted" style={{ textAlign: "center", padding: 36 }}>{children}</div>;
export const ErrorBox = ({ error }: { error: unknown }) => <Banner error>{error instanceof Error ? error.message : "Algo deu errado. Tente novamente."}</Banner>;

/** Anel de atingimento (sem teto visual: 100% fecha o círculo) */
export const Donut = ({ value, size = 150, label }: { value: number; size?: number; label?: string }) => {
  const r = size / 2 - 11, c = 2 * Math.PI * r, v = Math.min(Math.max(value, 0), 1);
  return (
    <div className="ix-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efe8f7" strokeWidth="14" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ixg)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} />
        <defs><linearGradient id="ixg" x1="0" x2="1"><stop offset="0" stopColor="#431171" /><stop offset="1" stopColor="#a68cc4" /></linearGradient></defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="ix-num" style={{ fontSize: size * 0.22 }}>{Math.round(value * 100)}%</span>
        {label && <span className="ix-faint" style={{ fontSize: 12 }}>{label}</span>}
      </div>
    </div>
  );
};

/** Seletor de mês (‹ outubro de 2026 ›) */
export const MonthNav = ({ month, onChange, label }: { month: string; onChange: (m: string) => void; label: string }) => {
  const shift = (k: number) => { const [y, m] = month.split("-").map(Number); const d = new Date(y, m - 1 + k, 1); onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`); };
  return (
    <div className="ix-row" style={{ gap: 6 }}>
      <Btn kind="secondary" size="sm" aria-label="Mês anterior" onClick={() => shift(-1)}>‹</Btn>
      <span className="ix-h3 hd" style={{ minWidth: 150, textAlign: "center" }}>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
      <Btn kind="secondary" size="sm" aria-label="Próximo mês" onClick={() => shift(1)}>›</Btn>
    </div>
  );
};
