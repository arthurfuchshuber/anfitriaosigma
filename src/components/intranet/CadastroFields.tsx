import type { CnpjInfo } from "@/lib/intranet/api";
import { labelFor, type DocType, type FieldDef, type Values } from "@/lib/intranet/cadastro";
import {
  AccountInput, AgencyInput, BankSelect, CepInput, CnpjInput, CpfInput, DateInput, DigitsInput, EmailInput, NameInput, NumberInput, PhoneInput,
  PixKeyInput, PixTypeSelect, RelationSelect, RgInput, TaxRegimeSelect, TextInput, UfSelect, type CnpjState,
} from "./fields";

export interface FieldCtx {
  values: Values;
  set: (patch: Values) => void;                  // grava um ou mais campos
  doc: DocType;
  missing: string[];                             // chaves ainda pendentes (vem do banco)
  errors: Record<string, string>;
  cnpj: { state: CnpjState; info: CnpjInfo | null };
  onCnpj: (key: string, state: CnpjState, info: CnpjInfo | null) => void;
  /** campos preenchidos pela Receita ficam travados enquanto o CNPJ estiver ATIVO */
  locked?: (key: string) => boolean;
  /** nome completo vem do Google: travado quando já existe */
  lockName?: boolean;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

/** Renderiza UM campo conforme o tipo (máscara/seleção). Usado no cadastro pendente, no Perfil e em Cadastros → Empresa. */
export const FieldRenderer = ({ f, ctx }: { f: FieldDef; ctx: FieldCtx }) => {
  const v = ctx.values[f.key] ?? "";
  const label = labelFor(f, ctx.doc);
  const base = { label, value: v, pending: ctx.missing.includes(f.key), error: ctx.errors[f.key] ?? null, onChange: (x: string) => ctx.set({ [f.key]: x }) };
  const lockedByRfb = ctx.locked?.(f.key) ?? false;
  switch (f.kind) {
    case "name": return <NameInput {...base} disabled={f.key === "u_full_name" && !!ctx.lockName && !!v} hint={f.key === "u_full_name" && ctx.lockName && v ? "Vem da sua conta Google" : undefined} />;
    case "company": return <NameInput {...base} company readOnly={lockedByRfb} hint={lockedByRfb ? "Preenchida pela Receita" : undefined} />;
    case "text": return <TextInput {...base} />;
    case "cpf": return <CpfInput {...base} />;
    case "rg": return <RgInput {...base} />;
    case "cnpj": return <CnpjInput {...base} onInfo={(s, i) => ctx.onCnpj(f.key, s, i)} />;
    case "date": return <DateInput {...base} min={f.dateMin} max={f.dateMax === "today" ? TODAY() : undefined} />;
    case "phone": return <PhoneInput {...base} />;
    case "email": return <EmailInput {...base} />;
    case "cep": return <CepInput {...base} onAddress={(a) => {
      const pre = f.key === "u_cep" ? "u_" : "c_";
      ctx.set({ [`${pre}street`]: a.rua, [`${pre}neighborhood`]: a.bairro, [`${pre}city`]: a.cidade, [`${pre}uf`]: a.uf });
    }} />;
    case "uf": return <UfSelect {...base} />;
    case "number": return <NumberInput {...base} />;
    case "digits": return <DigitsInput {...base} hint="Somente números" />;
    case "agency": return <AgencyInput {...base} />;
    case "account": return <AccountInput {...base} />;
    case "bank": return <BankSelect {...base} />;
    case "relation": return <RelationSelect {...base} />;
    case "regime": return <TaxRegimeSelect {...base} />;
    case "pixtype": return <PixTypeSelect {...base} onChange={(x) => ctx.set({ u_pix_type: x, u_pix_key: "" })} />;
    case "pixkey": return <PixKeyInput {...base} pixType={ctx.values.u_pix_type ?? ""} hint="A máscara muda conforme o tipo da chave" />;
  }
};

/** Grade de campos: "half" ocupa meia linha (Número+Complemento, Cidade+UF, Agência+Conta). */
export const FieldGrid = ({ fields, ctx }: { fields: FieldDef[]; ctx: FieldCtx }) => (
  <div className="ix-grid c2">
    {fields.map((f) => (
      <div key={f.key} style={f.half ? undefined : { gridColumn: "1 / -1" }}>
        <FieldRenderer f={f} ctx={ctx} />
      </div>
    ))}
  </div>
);
