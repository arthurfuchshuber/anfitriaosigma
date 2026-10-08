export type Sen = { id: string; name: string; weight: number; salary: number };
export type Rules = {
  custo: number; pct: number; seniorities: Sen[];
  gatilho: { entrada: number; m1: number; m2: number; m3: number; m4: number };
  regua: { on: boolean; leve: number; padrao: number; acel: number; max: number; acel_de: number; max_de: number };
  pesos: Record<string, number>;
  valores: Record<string, { bruto: number | null; liquido: number | null }>;
  operacao: { corte: number; folha: number; bonus: number; prazo: number };
};
export type MonthStatus = "em_vigor" | "encerrado" | "programado" | "sem_regras";
export type RulesGet = {
  month: string; rules: Rules; draft: boolean; locked: boolean; locked_since: string; pending_unlock: boolean;
  months: { month: string; status: MonthStatus; locked: boolean; draft: boolean }[];
  calendar: { month: string; dias_uteis: number; feriados: { dia: string; nome: string }[] }[];
  empresas: { id: string; name: string; linha: string }[];
  variacoes: { cobranca_id: string; produto: string; label: string; gera_caixa: boolean; bruto: number | null; liquido: number | null; taxa: number }[];
};
export type Preview = {
  month: string; objetivo: number; custo: number; pct: number; peso_total: number; meta_total: number;
  sellers: { id: string; name: string; seniority: string; weight: number; salary: number; meta: number; gatilho: number }[];
  empresas: { id: string; linha: string; empresa: string; peso: number; pontos: number; pts_venda: number | null; qtd: number | null }[];
  cobrancas: { id: string; pts: number | null }[];
};
export type MonthsList = { atual: string; objetivo_atual: number; rows: { month: string; status: MonthStatus; locked: boolean; objetivo: number | null }[] };
export type Projecao = {
  meta: number;
  bars: { month: string; value: number | null; kind: "realizado" | "parcial" | "projetado" }[];
  seguintes: { month: string; projetado: number | null; atingimento: number | null }[];
  bonus: { month: string; valor: number | null; pct_caixa: number | null }[];
};
export type Cenario = { pct: number; objetivo: number; atingimento: number | null; bonus: number | null };
export type Sugestao = {
  month: string; sem_historico: boolean; atual: number; sugerido?: number; aliviar?: number; confianca?: string; meses?: number[];
  motivos?: { label: string; value: string }[]; vendedor?: string | null; cenarios?: Record<"atual" | "sugerido" | "aliviar", Cenario>;
};
export const ETAPAS = ["meta", "pesos", "ganho", "operacao", "projecao"] as const;
export type Etapa = (typeof ETAPAS)[number];
