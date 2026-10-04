/** Máscaras e validações brasileiras. Funções puras (testadas em masks.test.ts).
 *  Convenção de armazenamento: CPF/CNPJ/CEP/agência só dígitos · telefone "+<ddi><dígitos>" · data ISO (yyyy-mm-dd). */

export const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");

export const maskCPF = (s: string) => {
  const d = onlyDigits(s).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
};
export const maskCNPJ = (s: string) => {
  const d = onlyDigits(s).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
};
export const maskCEP = (s: string) => onlyDigits(s).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

export const validCPF = (s: string) => {
  const d = onlyDigits(s);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (n: number) => { let t = 0; for (let i = 0; i < n; i++) t += Number(d[i]) * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
};
export const validCNPJ = (s: string) => {
  const d = onlyDigits(s);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const dv = (n: number) => {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let t = 0; for (let i = 0; i < n; i++) t += Number(d[i]) * w[i];
    const r = t % 11; return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === Number(d[12]) && dv(13) === Number(d[13]);
};
export const validEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test((s ?? "").trim());

// ---------- RG (formato mais comum 00.000.000-0; aceita X no dígito final) ----------
export const cleanRG = (s: string) => (s ?? "").replace(/[^0-9xX]/g, "").toUpperCase().slice(0, 9);
export const maskRG = (s: string) => {
  const c = cleanRG(s);
  return c.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})([\dX])$/, ".$1-$2");
};
export const validRG = (s: string) => cleanRG(s).length >= 7;

// ---------- telefone ----------
export interface Ddi { code: string; label: string; flag: string }
export const DDIS: Ddi[] = [
  { code: "55", label: "Brasil", flag: "🇧🇷" }, { code: "351", label: "Portugal", flag: "🇵🇹" }, { code: "1", label: "EUA/Canadá", flag: "🇺🇸" },
  { code: "595", label: "Paraguai", flag: "🇵🇾" }, { code: "54", label: "Argentina", flag: "🇦🇷" }, { code: "598", label: "Uruguai", flag: "🇺🇾" },
  { code: "56", label: "Chile", flag: "🇨🇱" }, { code: "591", label: "Bolívia", flag: "🇧🇴" }, { code: "57", label: "Colômbia", flag: "🇨🇴" },
  { code: "34", label: "Espanha", flag: "🇪🇸" }, { code: "39", label: "Itália", flag: "🇮🇹" }, { code: "44", label: "Reino Unido", flag: "🇬🇧" },
  { code: "49", label: "Alemanha", flag: "🇩🇪" }, { code: "33", label: "França", flag: "🇫🇷" },
];
/** Separa "+5545999999999" em { ddi:"55", national:"45999999999" }. Sem "+", assume Brasil. */
export const splitPhone = (v: string | null | undefined): { ddi: string; national: string } => {
  const raw = (v ?? "").trim();
  const d = onlyDigits(raw);
  if (!raw.startsWith("+")) return { ddi: "55", national: d.length > 11 && d.startsWith("55") ? d.slice(2) : d };
  const hit = [...DDIS].sort((a, b) => b.code.length - a.code.length).find((x) => d.startsWith(x.code));
  return hit ? { ddi: hit.code, national: d.slice(hit.code.length) } : { ddi: "55", national: d };
};
export const joinPhone = (ddi: string, national: string) => { const n = onlyDigits(national); return n ? `+${ddi}${n}` : ""; };
export const maskPhoneNational = (national: string, ddi = "55") => {
  const d = onlyDigits(national);
  if (ddi !== "55") return d.slice(0, 14).replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  const x = d.slice(0, 11);
  if (x.length <= 2) return x.length ? `(${x}` : "";
  if (x.length <= 6) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
  if (x.length <= 10) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`;
  return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`;
};
export const validPhone = (v: string) => {
  const { ddi, national } = splitPhone(v);
  if (ddi === "55") return /^[1-9]{2}9?\d{8}$/.test(national) && (national.length === 10 || national[2] === "9");
  return national.length >= 6 && national.length <= 14;
};
export const formatPhone = (v: string | null | undefined) => {
  if (!v) return "";
  const { ddi, national } = splitPhone(v);
  return `+${ddi} ${maskPhoneNational(national, ddi)}`;
};

// ---------- data ----------
/** "14031992" → "14/03/1992" (digitando). */
export const maskDate = (s: string) => onlyDigits(s).slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
/** dd/mm/aaaa → ISO (ou "" se incompleta/inexistente). */
export const dmyToIso = (s: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return "";
  const [, dd, mm, yy] = m; const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
  return d.getFullYear() === Number(yy) && d.getMonth() === Number(mm) - 1 && d.getDate() === Number(dd) ? `${yy}-${mm}-${dd}` : "";
};
export const isoToDmy = (s: string | null | undefined) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : ""; };

// ---------- dinheiro / percentual / número ----------
/** Digitação estilo caixa: "230000" → "2.300,00". Valor em centavos implícitos. */
export const maskMoney = (s: string) => {
  const d = onlyDigits(s).replace(/^0+(?=\d)/, "");
  if (!d) return "";
  const p = d.padStart(3, "0");
  return `${p.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${p.slice(-2)}`;
};
export const moneyToNumber = (s: string) => Number(onlyDigits(s)) / 100 || 0;
export const numberToMoney = (n: number | string | null | undefined) => (n === null || n === undefined || n === "" ? "" : maskMoney(String(Math.round(Number(n) * 100))));
/** Percentual 0–100 com até 1 casa: "655" → "65,5". */
export const maskPercent = (s: string, max = 100) => {
  const d = onlyDigits(s).replace(/^0+(?=\d)/, "").slice(0, 4);
  if (!d) return "";
  const v = Number(d) / 10;
  return (v > max ? max : v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};
export const percentToNumber = (s: string) => Number((s ?? "").replace(/\./g, "").replace(",", ".")) || 0;

// ---------- PIX ----------
export type PixType = "cpf" | "cnpj" | "celular" | "email" | "aleatoria";
export const PIX_TYPES: { value: PixType; label: string }[] = [
  { value: "cpf", label: "CPF" }, { value: "cnpj", label: "CNPJ" }, { value: "celular", label: "Celular" },
  { value: "email", label: "E-mail" }, { value: "aleatoria", label: "Chave aleatória" },
];
export const maskPix = (type: PixType | string, v: string) => {
  switch (type) {
    case "cpf": return maskCPF(v);
    case "cnpj": return maskCNPJ(v);
    case "celular": { const { ddi, national } = splitPhone(v.startsWith("+") ? v : `+55${onlyDigits(v)}`); return `+${ddi} ${maskPhoneNational(national, ddi)}`; }
    case "email": return v.trim().toLowerCase();
    default: return v.replace(/[^0-9a-fA-F-]/g, "").toLowerCase().slice(0, 36);
  }
};
/** Valor armazenado da chave PIX: cpf/cnpj só dígitos · celular "+55…" · e-mail minúsculo · aleatória como digitada. */
export const pixStore = (type: PixType | string, masked: string) => {
  switch (type) {
    case "cpf": case "cnpj": return onlyDigits(masked);
    case "celular": { const d = onlyDigits(masked); return d.length > 2 ? `+${d}` : ""; }
    default: return masked.trim();
  }
};
export const validPix = (type: PixType | string, stored: string) => {
  switch (type) {
    case "cpf": return validCPF(stored);
    case "cnpj": return validCNPJ(stored);
    case "celular": return validPhone(stored);
    case "email": return validEmail(stored);
    default: return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored);
  }
};
export const pixDisplay = (type: PixType | string, stored: string) => (type === "celular" ? maskPix("celular", stored) : maskPix(type, stored));

// ---------- conta bancária ----------
export const maskAgency = (s: string) => onlyDigits(s).slice(0, 5);
/** Conta com dígito verificador: "123456" → "12345-6" (até 12 dígitos + dv, aceita X). */
export const maskAccount = (s: string) => {
  const c = (s ?? "").replace(/[^0-9xX]/g, "").toUpperCase().slice(0, 13);
  return c.length > 1 ? `${c.slice(0, -1)}-${c.slice(-1)}` : c;
};
