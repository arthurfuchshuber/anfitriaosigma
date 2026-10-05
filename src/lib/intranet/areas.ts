export interface AreaDef { id: string; title: string; desc: string; icon: "target" | "home" | "wallet" | "grad" | "briefcase"; active: boolean; path: string }

/** Áreas da Intranet. `active: false` mostra "em breve"; ao criar a área, basta virar `true` e ter a rota. */
export const AREAS: AreaDef[] = [
  { id: "metas", title: "Comercial", desc: "Em construção.", icon: "target", active: true, path: "/intranet/metas" },
  { id: "operacao", title: "Operação", desc: "Rotinas e acompanhamento dos imóveis.", icon: "home", active: false, path: "/intranet/operacao" },
  { id: "financeiro", title: "Financeiro", desc: "Repasses, notas e conciliação.", icon: "wallet", active: false, path: "/intranet/financeiro" },
];

export const ROLE_LABEL = { closer: "Closer", gestor: "Gestor", admin: "Admin" } as const;
