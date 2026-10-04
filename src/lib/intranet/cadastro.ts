/** Definição (front) dos itens/campos do cadastro. Quem é obrigatório, desde quando e quem falta preencher
 *  vive no BANCO (required_fields + my_pending) — aqui só ficam rótulos, máscara e onde cada valor é gravado. */
import type { Company } from "./api";
import { cleanRG, dmyToIso, isoToDmy, joinPhone, onlyDigits, splitPhone, validCNPJ, validCPF, validEmail, validPhone, validPix, validRG } from "./masks";
import type { Profile } from "./types";

export type Scope = "user" | "company";
export type DocType = "pf" | "pj";
export type Kind = "name" | "company" | "text" | "cpf" | "cnpj" | "rg" | "date" | "phone" | "email" | "cep" | "uf" | "number" | "digits" | "agency" | "account" | "bank" | "relation" | "regime" | "pixtype" | "pixkey";

/** store: p.<coluna do perfil> · a.<chave do endereço do perfil> · s.<coluna sensível> · c.<coluna da empresa> · ca.<chave do endereço da empresa> */
export interface FieldDef { key: string; label: string; kind: Kind; store: string; docs?: DocType; pjFirst?: boolean; half?: boolean; dateMax?: "today"; dateMin?: string }
export interface GroupDef { id: string; scope: Scope; title: string; sub: string; icon: "id" | "phone" | "pin" | "alert" | "wallet" | "building" | "user"; fields: FieldDef[] }

export const USER_GROUPS: GroupDef[] = [
  { id: "ident", scope: "user", title: "Identificação", sub: "Escolha como você emite a nota", icon: "id", fields: [
    { key: "u_full_name", label: "Nome completo", kind: "name", store: "p.full_name" },
    { key: "u_cpf", label: "CPF", kind: "cpf", store: "s.cpf", docs: "pf" },
    { key: "u_rg", label: "RG", kind: "rg", store: "s.rg", docs: "pf" },
    { key: "u_cnpj", label: "CNPJ", kind: "cnpj", store: "s.cnpj", docs: "pj", pjFirst: true },
    { key: "u_company_name", label: "Razão social", kind: "company", store: "s.company_name", docs: "pj", pjFirst: true },
    { key: "u_trade_name", label: "Nome fantasia", kind: "company", store: "s.trade_name", docs: "pj", pjFirst: true },
    { key: "u_municipal_reg", label: "Inscrição municipal", kind: "digits", store: "s.municipal_reg", docs: "pj", pjFirst: true },
    { key: "u_birth_date", label: "Data de nascimento", kind: "date", store: "p.birth_date", dateMax: "today", dateMin: "1930-01-01" },
    { key: "u_nickname", label: "Como quer ser chamado", kind: "text", store: "p.nickname" },
  ] },
  { id: "contato", scope: "user", title: "Contato", sub: "Celular, WhatsApp e e-mail", icon: "phone", fields: [
    { key: "u_phone", label: "Celular", kind: "phone", store: "p.phone" },
    { key: "u_whatsapp", label: "WhatsApp", kind: "phone", store: "p.whatsapp" },
    { key: "u_personal_email", label: "E-mail pessoal", kind: "email", store: "p.personal_email" },
  ] },
  { id: "endereco", scope: "user", title: "Endereço", sub: "Digite o CEP e o resto vem sozinho", icon: "pin", fields: [
    { key: "u_cep", label: "CEP", kind: "cep", store: "a.cep" },
    { key: "u_street", label: "Rua", kind: "text", store: "a.rua" },
    { key: "u_number", label: "Número", kind: "number", store: "a.numero", half: true },
    { key: "u_complement", label: "Complemento", kind: "text", store: "a.complemento", half: true },
    { key: "u_neighborhood", label: "Bairro", kind: "text", store: "a.bairro" },
    { key: "u_city", label: "Cidade", kind: "text", store: "a.cidade", half: true },
    { key: "u_uf", label: "UF", kind: "uf", store: "a.uf", half: true },
  ] },
  { id: "emerg", scope: "user", title: "Contato de emergência", sub: "Quem avisar se algo acontecer", icon: "alert", fields: [
    { key: "u_emerg_name", label: "Nome do contato", kind: "name", store: "p.emergency_name" },
    { key: "u_emerg_relation", label: "Parentesco", kind: "relation", store: "p.emergency_relation" },
    { key: "u_emerg_phone", label: "Telefone do contato", kind: "phone", store: "p.emergency_phone" },
  ] },
  { id: "pay", scope: "user", title: "Pagamento (PIX e banco)", sub: "Onde você recebe", icon: "wallet", fields: [
    { key: "u_pix_type", label: "Tipo da chave PIX", kind: "pixtype", store: "s.pix_type" },
    { key: "u_pix_key", label: "Chave PIX", kind: "pixkey", store: "s.pix_key" },
    { key: "u_bank", label: "Banco", kind: "bank", store: "s.bank" },
    { key: "u_agency", label: "Agência", kind: "agency", store: "s.agency", half: true },
    { key: "u_account", label: "Conta", kind: "account", store: "s.account", half: true },
  ] },
];

export const COMPANY_GROUPS: GroupDef[] = [
  { id: "ident", scope: "company", title: "Identificação da empresa", sub: "CNPJ consultado na Receita Federal", icon: "building", fields: [
    { key: "c_cnpj", label: "CNPJ", kind: "cnpj", store: "c.cnpj" },
    { key: "c_legal_name", label: "Razão social", kind: "company", store: "c.legal_name" },
    { key: "c_trade_name", label: "Nome fantasia", kind: "company", store: "c.trade_name" },
    { key: "c_municipal_reg", label: "Inscrição municipal", kind: "digits", store: "c.municipal_reg" },
    { key: "c_tax_regime", label: "Regime tributário", kind: "regime", store: "c.tax_regime" },
  ] },
  { id: "endereco", scope: "company", title: "Endereço e contato", sub: "Onde a empresa atende e recebe notas", icon: "pin", fields: [
    { key: "c_cep", label: "CEP", kind: "cep", store: "ca.cep" },
    { key: "c_street", label: "Rua", kind: "text", store: "ca.rua" },
    { key: "c_number", label: "Número", kind: "number", store: "ca.numero", half: true },
    { key: "c_complement", label: "Complemento", kind: "text", store: "ca.complemento", half: true },
    { key: "c_neighborhood", label: "Bairro", kind: "text", store: "ca.bairro" },
    { key: "c_city", label: "Cidade", kind: "text", store: "ca.cidade", half: true },
    { key: "c_uf", label: "UF", kind: "uf", store: "ca.uf", half: true },
    { key: "c_email", label: "E-mail para notas fiscais", kind: "email", store: "c.email" },
    { key: "c_phone", label: "Telefone da empresa", kind: "phone", store: "c.phone" },
  ] },
  { id: "resp", scope: "company", title: "Responsável legal", sub: "Quem assina pela empresa", icon: "user", fields: [
    { key: "c_rep_name", label: "Nome completo", kind: "name", store: "c.rep_name" },
    { key: "c_rep_cpf", label: "CPF", kind: "cpf", store: "c.rep_cpf" },
    { key: "c_rep_birth", label: "Data de nascimento", kind: "date", store: "c.rep_birth", dateMax: "today", dateMin: "1930-01-01" },
    { key: "c_rep_phone", label: "Celular", kind: "phone", store: "c.rep_phone" },
  ] },
  { id: "banc", scope: "company", title: "Dados bancários", sub: "Usados para repasses e conciliação", icon: "wallet", fields: [
    { key: "c_bank", label: "Banco", kind: "bank", store: "c.bank" },
    { key: "c_agency", label: "Agência", kind: "agency", store: "c.agency", half: true },
    { key: "c_account", label: "Conta", kind: "account", store: "c.account", half: true },
  ] },
];

export const groupsOf = (scope: Scope) => (scope === "user" ? USER_GROUPS : COMPANY_GROUPS);
export const allFields = (scope: Scope) => groupsOf(scope).flatMap((g) => g.fields);

/** Campos visíveis do item conforme PF/PJ (CNPJ e razão social vêm primeiro no PJ). */
export const visibleFields = (g: GroupDef, doc: DocType): FieldDef[] => {
  const f = g.fields.filter((x) => !x.docs || x.docs === doc);
  return doc === "pj" ? [...f.filter((x) => x.pjFirst), ...f.filter((x) => !x.pjFirst)] : f;
};
/** Rótulo adaptado: no PJ o "nome completo" vira "Nome do responsável". */
export const labelFor = (f: FieldDef, doc: DocType) => (f.key === "u_full_name" && doc === "pj" ? "Nome do responsável" : f.label);

// ---------- leitura / gravação ----------
export type Values = Record<string, string>;

const normalizeLoaded = (kind: Kind, v: string): string => {
  if (!v) return "";
  switch (kind) {
    case "phone": { const { ddi, national } = splitPhone(v); return joinPhone(ddi, national); }
    case "cpf": case "cnpj": case "cep": case "digits": case "agency": return onlyDigits(v);
    case "rg": return cleanRG(v);
    case "date": return v.slice(0, 10);
    default: return v;
  }
};

export function loadUser(profile: Profile, sens: Record<string, string | null> | null): Values {
  const out: Values = {};
  for (const f of allFields("user")) {
    const [t, c] = f.store.split(".");
    const raw = t === "p" ? (profile as unknown as Record<string, unknown>)[c] : t === "a" ? profile.address?.[c] : sens?.[c];
    out[f.key] = normalizeLoaded(f.kind, raw == null ? "" : String(raw));
  }
  return out;
}
export function loadCompany(c: Company): Values {
  const out: Values = {};
  for (const f of allFields("company")) {
    const [t, k] = f.store.split(".");
    const raw = t === "c" ? c[k] : c.addr?.[k];
    out[f.key] = normalizeLoaded(f.kind, raw == null ? "" : String(raw));
  }
  return out;
}

export interface CnpjResult { status: "ATIVA" | "unverified" | null }
export interface SavePlan {
  profile: Record<string, unknown>;                  // → update_my_profile
  sensitive: Record<string, string | null>;          // → profile_sensitive (upsert)
  company: Record<string, unknown>;                  // → company_info (update)
}

/** Monta o que gravar para os campos de UM item. `cnpjStatus` vem da consulta na Receita feita ao digitar. */
export function planSave(g: GroupDef, values: Values, doc: DocType, base: { address?: Record<string, string>; addr?: Record<string, string> }, cnpjStatus: "ATIVA" | "unverified" | null): SavePlan {
  const plan: SavePlan = { profile: {}, sensitive: {}, company: {} };
  const addr = { ...(base.address ?? {}) }, caddr = { ...(base.addr ?? {}) };
  let touchA = false, touchCA = false;
  for (const f of g.fields) {
    if (f.docs && f.docs !== doc) continue;
    const [t, c] = f.store.split(".");
    const v = values[f.key] ?? "";
    if (t === "p") plan.profile[c] = f.kind === "date" ? v || "" : v;
    else if (t === "a") { addr[c] = v; touchA = true; }
    else if (t === "s") plan.sensitive[c] = v;
    else if (t === "c") plan.company[c] = v;
    else if (t === "ca") { caddr[c] = v; touchCA = true; }
  }
  if (touchA) plan.profile.address = addr;
  if (touchCA) {
    plan.company.addr = caddr;
    plan.company.address = [[caddr.rua, caddr.numero].filter(Boolean).join(", "), caddr.complemento, caddr.bairro, [caddr.cidade, caddr.uf].filter(Boolean).join("/"), caddr.cep && `CEP ${caddr.cep}`].filter(Boolean).join(" - ");
  }
  if (g.scope === "user" && g.id === "ident") plan.sensitive.doc_type = doc;
  const hasCnpj = g.fields.some((f) => f.kind === "cnpj" && (!f.docs || f.docs === doc));
  if (hasCnpj) {
    const key = g.scope === "user" ? "s" : "c";
    const filled = (g.scope === "user" ? values.u_cnpj : values.c_cnpj) ?? "";
    const tgt = key === "s" ? plan.sensitive : plan.company;
    tgt.cnpj_status = filled ? cnpjStatus : null;
    tgt.cnpj_checked_at = filled ? new Date().toISOString() : null;
  }
  return plan;
}

// ---------- validação de formato (campo vazio não é erro: apenas continua pendente) ----------
export function validateField(f: FieldDef, values: Values): string | null {
  const v = values[f.key] ?? "";
  if (!v) return null;
  switch (f.kind) {
    case "cpf": return validCPF(v) ? null : "CPF inválido";
    case "cnpj": return validCNPJ(v) ? null : "CNPJ inválido";
    case "rg": return validRG(v) ? null : "RG incompleto";
    case "phone": return validPhone(v) ? null : "Telefone inválido";
    case "email": return validEmail(v) ? null : "E-mail inválido";
    case "cep": return onlyDigits(v).length === 8 ? null : "CEP incompleto";
    case "date": {
      if (dmyToIso(isoToDmy(v)) !== v.slice(0, 10)) return "Data inválida";
      if (f.dateMax === "today" && v > new Date().toISOString().slice(0, 10)) return "A data não pode ser futura";
      if (f.dateMin && v < f.dateMin) return "Data fora do período";
      return null;
    }
    case "pixkey": { const t = values.u_pix_type; return t && !validPix(t, v) ? "Chave PIX inválida para o tipo" : null; }
    case "agency": return v.length >= 3 ? null : "Agência incompleta";
    default: return null;
  }
}
export const validateGroup = (g: GroupDef, values: Values, doc: DocType) => {
  const errs: Record<string, string> = {};
  for (const f of visibleFields(g, doc)) { const e = validateField(f, values); if (e) errs[f.key] = e; }
  return errs;
};
