export const brl = (n: number | null | undefined, digits = 0) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits });
export const num = (n: number | null | undefined) => (n ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
export const pct = (n: number | null | undefined, d = 0) => `${((n ?? 0) * 100).toLocaleString("pt-BR", { maximumFractionDigits: d })}%`;
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const monthStart = (d = new Date()) => iso(new Date(d.getFullYear(), d.getMonth(), 1));
export const addMonths = (m: string, k: number) => { const [y, mo] = m.split("-").map(Number); return iso(new Date(y, mo - 1 + k, 1)); };
export const monthLabel = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${MONTHS[mo - 1]} de ${y}`; };
export const monthShort = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${MONTHS[mo - 1].slice(0, 3)}/${String(y).slice(2)}`; };
export const dmy = (s: string | null | undefined) => (s ? new Date(s.length === 10 ? s + "T12:00:00" : s).toLocaleDateString("pt-BR") : "—");
export const dmyHm = (s: string) => new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
export const firstName = (p?: { nickname?: string | null; full_name?: string | null; email?: string } | null) =>
  p?.nickname || p?.full_name?.split(" ")[0] || p?.email?.split("@")[0] || "";
export const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "σ";
export const digits = (s: string) => s.replace(/\D/g, "");
export const maskDoc = (s: string) => { const d = digits(s); if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"); return s; };
export const toNumber = (s: string) => Number(String(s).replace(/\./g, "").replace(",", ".")) || 0;
export const PAY_LABEL: Record<string, string> = { boleto: "Boleto", cartao: "Cartão", pix: "PIX", transferencia: "Transferência" };

export const monthTitle = (m: string) => { const t = monthLabel(m); return t.charAt(0).toUpperCase() + t.slice(1); };
