import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, Check, Loader2, Search } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { lookupCnpj, type CnpjInfo } from "@/lib/intranet/api";
import { BANKS, RELATIONS, TAX_REGIMES, UFS } from "@/lib/intranet/options";
import {
  DDIS, PIX_TYPES, dmyToIso, isoToDmy, joinPhone, maskAccount, maskAgency, maskCEP, maskCNPJ, maskCPF, maskDate, maskMoney, maskPercent,
  maskPhoneNational, maskPix, maskRG, onlyDigits, pixStore, splitPhone, validCNPJ, validCPF, validEmail, validPhone, validPix, validRG,
} from "@/lib/intranet/masks";
import { Field, Input, Select } from "./ui";

/** Campos do formulário: TODOS têm máscara ou seleção. Valores armazenados em formato "limpo":
 *  CPF/CNPJ/CEP/agência só dígitos · telefone "+<ddi><dígitos>" · data ISO · PIX conforme o tipo. */

type Base = { value: string; onChange: (v: string) => void; label?: string; disabled?: boolean; readOnly?: boolean; required?: boolean; pending?: boolean; hint?: string; error?: string | null; id?: string };

/** Moldura: rótulo + tag "Pendente" + mensagem de erro/ajuda. */
export const FieldBox = ({ label, pending, hint, error, children }: { label?: string; pending?: boolean; hint?: ReactNode; error?: string | null; children: ReactNode }) => (
  <div className="ix-field">
    {label && <div className="ix-label-row"><label className="ix-label">{label}</label>{pending && <span className="ix-chip pending">Pendente</span>}</div>}
    {children}
    {error ? <div className="ix-err">{error}</div> : hint ? <div className="ix-hint">{hint}</div> : null}
  </div>
);

const Adorn = ({ children, right }: { children: ReactNode; right?: ReactNode }) => <div className="ix-adorn">{children}{right && <span className="ix-adorn-r">{right}</span>}</div>;
const OkIcon = () => <Check size={18} color="#431171" aria-label="válido" />;

// ---------- texto com máscara genérica ----------
const Masked = ({ label, value, onChange, show, unmask, inputMode = "text", placeholder, ok, err, hint, pending, disabled, readOnly, autoComplete = "off", right, maxLength }: Base & {
  show: (stored: string) => string; unmask: (typed: string) => string; inputMode?: "text" | "numeric" | "tel" | "email" | "decimal"; placeholder?: string; ok?: boolean; err?: string | null; autoComplete?: string; right?: ReactNode; maxLength?: number;
}) => (
  <FieldBox label={label} pending={pending} hint={hint} error={err}>
    <Adorn right={right ?? (ok ? <OkIcon /> : null)}>
      <Input aria-label={label} inputMode={inputMode} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} readOnly={readOnly} maxLength={maxLength}
        className={err ? "err" : ok ? "ok" : ""} value={show(value)} onChange={(e) => onChange(unmask(e.target.value))} />
    </Adorn>
  </FieldBox>
);

/** Nome de pessoa/empresa: sem dígitos nem símbolos estranhos. */
export const NameInput = (p: Base & { company?: boolean }) => (
  <Masked {...p} show={(v) => v} unmask={(t) => (p.company ? t.replace(/[^\p{L}\p{N} .,&'/-]/gu, "") : t.replace(/[^\p{L} '.-]/gu, "")).replace(/\s{2,}/g, " ").slice(0, 120)} placeholder={p.company ? "Razão social" : "Nome completo"} autoComplete="name" />
);
export const EmailInput = (p: Base) => {
  const bad = p.value.length > 4 && !validEmail(p.value);
  return <Masked {...p} inputMode="email" show={(v) => v} unmask={(t) => t.trim().toLowerCase().slice(0, 120)} placeholder="nome@email.com" ok={!!p.value && !bad} err={bad ? "Informe um e-mail válido" : p.error} />;
};
export const DigitsInput = (p: Base & { max?: number; placeholder?: string }) => <Masked {...p} inputMode="numeric" show={(v) => v} unmask={(t) => onlyDigits(t).slice(0, p.max ?? 15)} />;
export const AgencyInput = (p: Base) => <Masked {...p} inputMode="numeric" show={(v) => v} unmask={maskAgency} placeholder="0000" />;
export const AccountInput = (p: Base) => <Masked {...p} inputMode="text" show={(v) => maskAccount(v)} unmask={(t) => t.replace(/[^0-9xX]/g, "").toUpperCase().slice(0, 13)} placeholder="00000-0" />;
export const NumberInput = (p: Base) => <Masked {...p} inputMode="numeric" show={(v) => v} unmask={(t) => t.replace(/[^\dA-Za-z]/g, "").slice(0, 10)} placeholder="Nº" />;
export const TextInput = (p: Base & { placeholder?: string; max?: number }) => <Masked {...p} show={(v) => v} unmask={(t) => t.slice(0, p.max ?? 120)} />;

export const CpfInput = (p: Base) => {
  const full = onlyDigits(p.value).length === 11;
  const valid = full && validCPF(p.value);
  return <Masked {...p} inputMode="numeric" show={maskCPF} unmask={(t) => onlyDigits(t).slice(0, 11)} placeholder="000.000.000-00" ok={valid}
    err={full && !valid ? "Dígitos não conferem" : p.error} hint={valid ? "CPF válido" : p.hint} />;
};
export const RgInput = (p: Base) => {
  const bad = p.value.length >= 7 && !validRG(p.value);
  return <Masked {...p} show={maskRG} unmask={(t) => t.replace(/[^0-9xX]/g, "").toUpperCase().slice(0, 9)} placeholder="00.000.000-0" err={bad ? "RG incompleto" : p.error} />;
};
export const CepInput = ({ onAddress, ...p }: Base & { onAddress?: (a: { rua: string; bairro: string; cidade: string; uf: string }) => void }) => {
  const [st, setSt] = useState<"idle" | "loading" | "ok" | "nf">("idle");
  const last = useRef("");
  useEffect(() => {
    const d = onlyDigits(p.value);
    if (d.length !== 8) { setSt("idle"); return; }
    if (last.current === d) return;
    last.current = d; setSt("loading");
    let alive = true;
    fetch(`https://viacep.com.br/ws/${d}/json/`).then((r) => r.json()).then((j) => {
      if (!alive) return;
      if (j.erro) { setSt("nf"); return; }
      setSt("ok"); onAddress?.({ rua: j.logradouro ?? "", bairro: j.bairro ?? "", cidade: j.localidade ?? "", uf: j.uf ?? "" });
    }).catch(() => alive && setSt("idle"));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.value]);
  return <Masked {...p} inputMode="numeric" show={maskCEP} unmask={(t) => onlyDigits(t).slice(0, 8)} placeholder="00000-000"
    right={st === "loading" ? <Loader2 size={18} className="animate-spin" color="#431171" /> : st === "ok" ? <OkIcon /> : undefined}
    err={st === "nf" ? "CEP não encontrado — confira os números" : p.error} hint={st === "ok" ? "Endereço preenchido pelo CEP" : p.hint} />;
};

// ---------- CNPJ com consulta em tempo real na Receita Federal ----------
export type CnpjState = "idle" | "invalid" | "checking" | "active" | "inactive" | "unavailable" | "notfound";
export const CnpjInput = ({ onInfo, ...p }: Base & { onInfo?: (state: CnpjState, info: CnpjInfo | null) => void }) => {
  const [state, setState] = useState<CnpjState>("idle");
  const [info, setInfo] = useState<CnpjInfo | null>(null);
  const cb = useRef(onInfo); cb.current = onInfo;
  const d = onlyDigits(p.value);
  useEffect(() => {
    let alive = true;
    const set = (s: CnpjState, i: CnpjInfo | null) => { if (!alive) return; setState(s); setInfo(i); cb.current?.(s, i); };
    if (d.length < 14) { set("idle", null); return; }
    if (!validCNPJ(d)) { set("invalid", null); return; }
    set("checking", null);
    const t = setTimeout(async () => {
      const r = await lookupCnpj(d);
      if (!alive) return;
      if (r.unavailable) set("unavailable", r);
      else if (r.found === false) set("notfound", r);
      else set(r.active ? "active" : "inactive", r);
    }, 350);
    return () => { alive = false; clearTimeout(t); };
  }, [d]);
  const chip = state === "checking" ? <span className="ix-badge"><Loader2 size={14} className="animate-spin" /> Consultando…</span>
    : state === "active" ? <span className="ix-badge ok"><Check size={14} /> Ativa na Receita</span>
    : state === "inactive" ? <span className="ix-badge bad">{(info?.status ?? "Inativa").charAt(0) + (info?.status ?? "Inativa").slice(1).toLowerCase()} na Receita</span> : null;
  const err = state === "invalid" ? "Dígitos não conferem" : state === "inactive" ? `Não é possível salvar: CNPJ ${String(info?.status ?? "inativo").toLowerCase()} na Receita` : state === "notfound" ? "CNPJ não encontrado na Receita Federal" : p.error;
  const hint = state === "active" ? [info?.razao_social, info?.cnae && `CNAE ${info.cnae.split(" · ")[0]}`].filter(Boolean).join(" · ")
    : state === "unavailable" ? "Receita indisponível agora — o CNPJ será salvo sem confirmação de situação" : p.hint ?? "Consulta na Receita Federal em tempo real";
  return <Masked {...p} inputMode="numeric" show={maskCNPJ} unmask={(t) => onlyDigits(t).slice(0, 14)} placeholder="00.000.000/0000-00" right={chip} err={err} hint={hint} />;
};

// ---------- telefone com DDI ----------
export const PhoneInput = (p: Base) => {
  const { ddi, national } = splitPhone(p.value);
  const bad = !!national && (ddi === "55" ? onlyDigits(national).length >= 10 : onlyDigits(national).length >= 6) && !validPhone(p.value);
  const short = !!national && !bad && !validPhone(p.value);
  return (
    <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={bad ? "Número inválido" : short ? "Número incompleto" : p.error}>
      <div className={`ix-phone ${bad || short ? "err" : validPhone(p.value) ? "ok" : ""}`}>
        <select aria-label={`${p.label ?? "Telefone"} — DDI`} disabled={p.disabled} value={ddi} onChange={(e) => p.onChange(joinPhone(e.target.value, national))}>
          {DDIS.map((d) => <option key={d.code} value={d.code}>{d.flag} +{d.code}</option>)}
        </select>
        <input aria-label={p.label} inputMode="tel" autoComplete="tel-national" disabled={p.disabled} readOnly={p.readOnly} placeholder={ddi === "55" ? "(00) 00000-0000" : "Número"}
          value={maskPhoneNational(national, ddi)} onChange={(e) => p.onChange(joinPhone(ddi, e.target.value))} />
        {validPhone(p.value) && <OkIcon />}
      </div>
    </FieldBox>
  );
};

// ---------- data com calendário ----------
export const DateInput = ({ min, max, ...p }: Base & { min?: string; max?: string }) => {
  const [text, setText] = useState(isoToDmy(p.value));
  const [open, setOpen] = useState(false);
  useEffect(() => { setText(isoToDmy(p.value)); }, [p.value]);
  const iso = dmyToIso(text);
  const outOfRange = !!iso && ((min && iso < min) || (max && iso > max));
  const incomplete = text.length === 10 && !iso;
  const err = incomplete ? "Data inexistente" : outOfRange ? "Data fora do período permitido" : p.error;
  const sel = p.value ? new Date(p.value + "T12:00:00") : undefined;
  const thisYear = new Date().getFullYear();
  const minD = min ? new Date(min + "T00:00:00") : undefined, maxD = max ? new Date(max + "T23:59:59") : undefined;
  return (
    <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={err}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild><div><Adorn right={<PopoverTrigger asChild><button type="button" className="ix-adorn-btn" aria-label={`Abrir calendário — ${p.label ?? "data"}`} disabled={p.disabled}><CalendarDays size={18} /></button></PopoverTrigger>}>
          <Input aria-label={p.label} inputMode="numeric" placeholder="dd/mm/aaaa" autoComplete="off" disabled={p.disabled} readOnly={p.readOnly} className={err ? "err" : iso && !outOfRange ? "ok" : ""}
            value={text} onChange={(e) => { const t = maskDate(e.target.value); setText(t); const v = dmyToIso(t); if (v) p.onChange(v); else if (!t) p.onChange(""); }} />
        </Adorn></div></PopoverAnchor>
        <PopoverContent align="start" className="ix-pop w-auto p-0">
          <Calendar mode="single" locale={ptBR} captionLayout="dropdown-buttons" fromYear={minD?.getFullYear() ?? 1930} toYear={maxD?.getFullYear() ?? thisYear + 1}
            defaultMonth={sel ?? maxD ?? new Date()} selected={sel} disabled={(d) => (!!minD && d < minD) || (!!maxD && d > maxD)}
            onSelect={(d) => { if (d) { const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; p.onChange(v); setOpen(false); } }}
            classNames={{
              caption_dropdowns: "flex items-center gap-1", caption_label: "flex items-center gap-1 text-sm font-semibold px-1", vhidden: "hidden",
              dropdown_month: "relative inline-flex items-center", dropdown_year: "relative inline-flex items-center", dropdown: "absolute inset-0 w-full opacity-0 cursor-pointer z-10",
              day_selected: "bg-[#431171] text-white hover:bg-[#431171] hover:text-white focus:bg-[#431171] focus:text-white", day_today: "bg-[#f2ecf8] text-[#431171]",
            }} />
        </PopoverContent>
      </Popover>
    </FieldBox>
  );
};

// ---------- seleções ----------
export const SelectInput = ({ options, placeholder = "Selecione", ...p }: Base & { options: { value: string; label: string }[]; placeholder?: string }) => (
  <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={p.error}>
    <Select aria-label={p.label} disabled={p.disabled} value={p.value} onChange={(e) => p.onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  </FieldBox>
);
export const UfSelect = (p: Base) => <SelectInput {...p} placeholder="UF" options={UFS.map((u) => ({ value: u, label: u }))} />;
export const RelationSelect = (p: Base) => <SelectInput {...p} options={RELATIONS.map((u) => ({ value: u, label: u }))} />;
export const TaxRegimeSelect = (p: Base) => <SelectInput {...p} options={TAX_REGIMES.map((u) => ({ value: u, label: u }))} />;
export const PixTypeSelect = (p: Base) => <SelectInput {...p} options={PIX_TYPES} />;

/** Banco por código/nome: digite para filtrar a lista e escolha. */
export const BankSelect = (p: Base) => {
  const [q, setQ] = useState("");
  const list = BANKS.filter(([c, n]) => !q || c.includes(q) || n.toLowerCase().includes(q.toLowerCase()));
  const cur = BANKS.find(([c]) => c === p.value);
  return (
    <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={p.error}>
      <Adorn right={<Search size={16} color="#8c849c" />}>
        <Input aria-label="Pesquisar banco" placeholder="Pesquisar banco (código ou nome)" autoComplete="off" value={q} disabled={p.disabled} onChange={(e) => setQ(e.target.value)} />
      </Adorn>
      <Select aria-label={p.label} style={{ marginTop: 8 }} disabled={p.disabled} value={cur ? cur[0] : ""} onChange={(e) => { p.onChange(e.target.value); setQ(""); }}>
        <option value="">Selecione o banco</option>
        {list.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}
      </Select>
    </FieldBox>
  );
};

/** Chave PIX: a máscara muda conforme o tipo escolhido. */
export const PixKeyInput = ({ pixType, ...p }: Base & { pixType: string }) => {
  const bad = !!p.value && !validPix(pixType, p.value) && (pixType === "aleatoria" ? p.value.length >= 36 : p.value.length >= 8);
  const ph: Record<string, string> = { cpf: "000.000.000-00", cnpj: "00.000.000/0000-00", celular: "+55 (00) 00000-0000", email: "nome@email.com", aleatoria: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" };
  return <Masked {...p} disabled={p.disabled || !pixType} inputMode={pixType === "email" || pixType === "aleatoria" ? "text" : "numeric"}
    show={(v) => (v ? maskPix(pixType, pixType === "celular" ? v : v) : "")} unmask={(t) => pixStore(pixType, maskPix(pixType, t))}
    placeholder={pixType ? ph[pixType] : "Escolha o tipo da chave primeiro"} ok={!!p.value && validPix(pixType, p.value)} err={bad ? "Chave PIX inválida para o tipo escolhido" : p.error} />;
};

// ---------- dinheiro / percentual ----------
export const MoneyInput = (p: Base) => (
  <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={p.error}>
    <Adorn>
      <span className="ix-adorn-l">R$</span>
      <Input aria-label={p.label} inputMode="numeric" placeholder="0,00" autoComplete="off" disabled={p.disabled} readOnly={p.readOnly} style={{ paddingLeft: 46 }} className={p.error ? "err" : ""}
        value={p.value} onChange={(e) => p.onChange(maskMoney(e.target.value))} />
    </Adorn>
  </FieldBox>
);
export const PercentInput = (p: Base & { max?: number }) => (
  <FieldBox label={p.label} pending={p.pending} hint={p.hint} error={p.error}>
    <Adorn right={<span className="ix-adorn-t">%</span>}>
      <Input aria-label={p.label} inputMode="numeric" placeholder="0,0" autoComplete="off" disabled={p.disabled} value={p.value} onChange={(e) => p.onChange(maskPercent(e.target.value, p.max ?? 100))} />
    </Adorn>
  </FieldBox>
);

/** CPF ou CNPJ conforme a quantidade de dígitos (cliente da venda). Valida dígitos; não consulta a Receita. */
export const DocInput = (p: Base) => {
  const d = onlyDigits(p.value);
  const full = d.length === 11 || d.length === 14;
  const valid = d.length === 11 ? validCPF(d) : d.length === 14 ? validCNPJ(d) : false;
  return <Masked {...p} inputMode="numeric" show={(v) => (onlyDigits(v).length > 11 ? maskCNPJ(v) : maskCPF(v))} unmask={(t) => onlyDigits(t).slice(0, 14)} placeholder="CPF ou CNPJ"
    ok={full && valid} err={full && !valid ? "Dígitos não conferem" : d.length > 11 && d.length < 14 ? "CNPJ incompleto" : p.error} />;
};

/** Número decimal com vírgula (múltiplos, fatores): só dígitos e uma vírgula, até 4 casas. */
export const DecimalInput = (p: Base) => (
  <Masked {...p} inputMode="decimal" show={(v) => v} unmask={(t) => { const c = t.replace(/[^\d,]/g, ""); const [i, ...r] = c.split(","); return r.length ? `${i.slice(0, 6)},${r.join("").slice(0, 4)}` : i.slice(0, 6); }} placeholder="0,00" />
);

export { Field };
