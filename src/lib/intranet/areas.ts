export interface AreaDef { id: string; title: string; desc: string; icon: "target" | "home" | "wallet" | "grad" | "briefcase"; active: boolean; path: string }

/** Áreas da Intranet. `active: false` mostra "em breve"; ao criar a área, basta virar `true` e ter a rota. */
export const AREAS: AreaDef[] = [
  { id: "metas", title: "Metas e Vendas", desc: "Acompanhe sua meta, registre vendas, simule resultados e gere a nota fiscal do mês.", icon: "target", active: true, path: "/intranet/metas" },
  { id: "operacao", title: "Operação", desc: "Rotinas e acompanhamento dos imóveis.", icon: "home", active: false, path: "/intranet/operacao" },
  { id: "financeiro", title: "Financeiro", desc: "Repasses, notas e conciliação.", icon: "wallet", active: false, path: "/intranet/financeiro" },
  { id: "treinamento", title: "Treinamento", desc: "Conteúdos e trilhas do time.", icon: "grad", active: false, path: "/intranet/treinamento" },
  { id: "comercial", title: "Comercial", desc: "Funil, propostas e relacionamento com clientes.", icon: "briefcase", active: false, path: "/intranet/comercial" },
];

export const ROLE_LABEL = { closer: "Closer", gestor: "Gestor", admin: "Admin" } as const;
