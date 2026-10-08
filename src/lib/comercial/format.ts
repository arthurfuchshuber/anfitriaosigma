const nf = (d = 0) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
/** "7.500" */
export const n0 = (v: number | string | null | undefined) => nf(0).format(Number(v ?? 0));
/** "10,50" */
export const n2 = (v: number | string | null | undefined) => nf(2).format(Number(v ?? 0));
/** "1,5" */
export const n1 = (v: number | string | null | undefined) => nf(1).format(Number(v ?? 0));
/** "R$ 5.140" */
export const rs = (v: number | string | null | undefined) => `R$ ${n0(v)}`;
/** "R$ 1.919,28" (centavos só quando existem) */
export const rsc = (v: number | string | null | undefined) => {
  const x = Number(v ?? 0);
  return `R$ ${nf(Math.abs(x % 1) > 0.004 ? 2 : 0).format(x)}`;
};
/** 0.7 -> "70%" ; 1.055 -> "105,5%" */
export const pc = (f: number | string | null | undefined, d = 1) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d }).format(Number(f ?? 0) * 100)}%`;
/** "2026-10-14" -> "14/10" */
export const dm = (s?: string | null) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "—");
export const dmy = (s?: string | null) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : "—");
const MES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const mesNome = (m: string) => MES[Number(m.slice(5, 7)) - 1];
/** "Outubro de 2026" */
export const mesLabel = (m: string) => `${mesNome(m)} de ${m.slice(0, 4)}`;
/** "Out/2026" */
export const mesCurto = (m: string) => `${mesNome(m).slice(0, 3)}/${m.slice(0, 4)}`;
export const mesSigla = (m: string) => mesNome(m).slice(0, 3).toUpperCase();
export const toNum = (s: string) => Number(String(s).replace(/\./g, "").replace(",", ".")) || 0;
export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
