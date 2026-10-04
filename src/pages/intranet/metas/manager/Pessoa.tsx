import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { Avatar, Btn, Card, Chip, ErrorBox, Field, Input, Loading, PageHeader, Select, Textarea } from "@/components/intranet/ui";
import { addSalary, decideAccess, getMasked, listAccessRows, listProfiles, listSalaries, setRole, updateProfile } from "@/lib/intranet/api";
import { useAuth } from "@/contexts/AuthContext";
import { AREAS, ROLE_LABEL } from "@/lib/intranet/areas";
import { brl, dmy, toNumber } from "@/lib/intranet/format";
import type { Profile } from "@/lib/intranet/types";

const B = "/intranet/metas";
type Form = Record<string, string>;
const ADDR: [string, string][] = [["cep", "CEP"], ["rua", "Rua"], ["numero", "Número"], ["complemento", "Complemento"], ["bairro", "Bairro"], ["cidade", "Cidade"], ["uf", "UF"]];
const SENS: [string, string][] = [["cpf", "CPF"], ["cnpj", "CNPJ"], ["rg", "RG"], ["pix_key", "Chave PIX"], ["bank", "Banco"], ["agency", "Agência"], ["account", "Conta"]];
const nz = (s: string) => (s.trim() === "" ? null : s.trim());

const Pessoa = () => {
  const { id = "" } = useParams();
  const { role: myRole } = useAuth();
  const qc = useQueryClient();
  const people = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const salaries = useQuery({ queryKey: ["salaries", id], queryFn: () => listSalaries(id) });
  const access = useQuery({ queryKey: ["access-rows"], queryFn: listAccessRows });
  const masked = useQuery({ queryKey: ["masked", id], queryFn: () => getMasked(id) });
  const person = (people.data ?? []).find((p) => p.id === id);

  const [f, setF] = useState<Form>({});
  const [active, setActive] = useState(true);
  const [google, setGoogle] = useState(true);
  const [roleSel, setRoleSel] = useState("closer");
  const [sal, setSal] = useState({ from: "", amount: "" });

  useEffect(() => {
    if (!person) return;
    const a = (person.address ?? {}) as Record<string, string>;
    setF({
      full_name: person.full_name ?? "", nickname: person.nickname ?? "", personal_email: person.personal_email ?? "", phone: person.phone ?? "", whatsapp: person.whatsapp ?? "",
      birth_date: person.birth_date ?? "", job_title: person.job_title ?? "", seniority: person.seniority ?? "", manager_id: person.manager_id ?? "", regime: person.regime ?? "",
      start_date: person.start_date ?? "", end_date: person.end_date ?? "", emergency_name: person.emergency_name ?? "", emergency_phone: person.emergency_phone ?? "", notes: person.notes ?? "",
      ...Object.fromEntries(ADDR.map(([k]) => [`addr_${k}`, a[k] ?? ""])),
    });
    setActive(person.active); setGoogle(person.google_login); setRoleSel(person.role);
  }, [person]);

  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const err = (e: Error) => toast.error(e.message);

  const save = useMutation({
    mutationFn: () => {
      const address = Object.fromEntries(ADDR.map(([k]) => [k, f[`addr_${k}`] ?? ""]).filter(([, v]) => v));
      const patch: Partial<Profile> = {
        full_name: nz(f.full_name), nickname: nz(f.nickname), personal_email: nz(f.personal_email), phone: nz(f.phone), whatsapp: nz(f.whatsapp), birth_date: nz(f.birth_date),
        address, job_title: nz(f.job_title), seniority: nz(f.seniority), manager_id: nz(f.manager_id), regime: (nz(f.regime) as Profile["regime"]),
        start_date: nz(f.start_date), end_date: nz(f.end_date), active, google_login: google, emergency_name: nz(f.emergency_name), emergency_phone: nz(f.emergency_phone), notes: nz(f.notes),
      };
      return updateProfile(id, patch);
    },
    onSuccess: () => { toast.success("Perfil salvo."); qc.invalidateQueries({ queryKey: ["profiles"] }); },
    onError: err,
  });
  const saveRole = useMutation({ mutationFn: () => setRole(id, roleSel), onSuccess: () => { toast.success("Papel atualizado."); qc.invalidateQueries({ queryKey: ["profiles"] }); }, onError: err });
  const addSal = useMutation({
    mutationFn: () => addSalary(id, sal.from, toNumber(sal.amount)),
    onSuccess: () => { toast.success("Reajuste salvo."); setSal({ from: "", amount: "" }); qc.invalidateQueries({ queryKey: ["salaries", id] }); qc.invalidateQueries({ queryKey: ["profiles"] }); },
    onError: err,
  });
  const decide = useMutation({
    mutationFn: (v: { area: string; ok: boolean }) => decideAccess(id, v.area, v.ok),
    onSuccess: () => { toast.success("Acesso atualizado."); qc.invalidateQueries({ queryKey: ["access-rows"] }); },
    onError: err,
  });

  if (people.isLoading) return <div style={{ marginTop: 40 }}><Loading rows={4} /></div>;
  if (people.error) return <ErrorBox error={people.error} />;
  if (!person) return <div style={{ marginTop: 40 }}><ErrorBox error={new Error("Pessoa não encontrada.")} /></div>;

  const managers = (people.data ?? []).filter((p) => p.role !== "closer" && p.id !== id);
  const mine = (access.data ?? []).filter((r) => r.user_id === id);
  const inp = (k: string, label: string, type = "text") => <Field label={label}><Input type={type} value={f[k] ?? ""} onChange={set(k)} aria-label={label} /></Field>;
  const name = person.full_name || person.email;

  return (
    <>
      <div style={{ marginTop: 28 }}><Link to={`${B}/pessoas`} className="ix-row ix-muted ix-small" style={{ gap: 6 }}><ArrowLeft size={14} /> Pessoas</Link></div>
      <PageHeader eyebrow="Gestor" title={name} right={<div className="ix-row"><Avatar name={name} src={person.avatar_url} size={52} /><Chip>{ROLE_LABEL[person.role]}</Chip></div>} />

      <div style={{ display: "grid", gap: 20 }}>
        <Card>
          <h2 className="ix-h2 hd" style={{ marginBottom: 18 }}>Dados pessoais</h2>
          <div className="ix-grid c3">
            {inp("full_name", "Nome completo")}{inp("nickname", "Apelido")}
            <Field label="E-mail de login"><Input value={person.email} readOnly aria-label="E-mail de login" /></Field>
            {inp("personal_email", "E-mail pessoal", "email")}{inp("phone", "Telefone")}{inp("whatsapp", "WhatsApp")}
            {inp("birth_date", "Nascimento", "date")}
          </div>
          <h3 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Endereço</h3>
          <div className="ix-grid c4">{ADDR.map(([k, l]) => inp(`addr_${k}`, l))}</div>
          <h3 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Contato de emergência</h3>
          <div className="ix-grid c2">{inp("emergency_name", "Nome")}{inp("emergency_phone", "Telefone")}</div>
        </Card>

        <Card>
          <h2 className="ix-h2 hd" style={{ marginBottom: 18 }}>Trabalho</h2>
          <div className="ix-grid c3">
            {inp("job_title", "Cargo")}{inp("seniority", "Senioridade (informativa)")}
            <Field label="Gestor direto"><Select value={f.manager_id ?? ""} onChange={set("manager_id")} aria-label="Gestor direto"><option value="">—</option>{managers.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}</Select></Field>
            <Field label="Regime"><Select value={f.regime ?? ""} onChange={set("regime")} aria-label="Regime"><option value="">—</option><option value="clt">CLT</option><option value="pj">PJ</option></Select></Field>
            {inp("start_date", "Data de início", "date")}{inp("end_date", "Data de saída", "date")}
          </div>
          <div className="ix-row ix-wrapflex" style={{ gap: 28, margin: "4px 0 16px" }}>
            <label className="ix-row" style={{ gap: 8 }}><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#431171" }} />Ativo</label>
            <label className="ix-row" style={{ gap: 8 }}><input type="checkbox" checked={google} onChange={(e) => setGoogle(e.target.checked)} style={{ accentColor: "#431171" }} />Login Google</label>
          </div>
          <Field label="Observações"><Textarea value={f.notes ?? ""} onChange={set("notes")} aria-label="Observações" /></Field>
          <div className="ix-row" style={{ justifyContent: "flex-end" }}><Btn busy={save.isPending} onClick={() => save.mutate()}>Salvar perfil</Btn></div>
        </Card>

        <div className="ix-grid c2">
          <Card>
            <h2 className="ix-h2 hd" style={{ marginBottom: 18 }}>Papel</h2>
            <Field hint={myRole === "admin" ? undefined : "Só administradores alteram o papel."}>
              <Select value={roleSel} onChange={(e) => setRoleSel(e.target.value)} disabled={myRole !== "admin"} aria-label="Papel">
                {(["closer", "gestor", "admin"] as const).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </Select>
            </Field>
            {myRole === "admin" && <Btn size="sm" busy={saveRole.isPending} disabled={roleSel === person.role} onClick={() => saveRole.mutate()}>Salvar papel</Btn>}
          </Card>

          <Card>
            <h2 className="ix-h2 hd" style={{ marginBottom: 18 }}>Salário</h2>
            {(salaries.data ?? []).length === 0 ? <p className="ix-muted ix-small" style={{ marginTop: 0 }}>Sem histórico.</p> : (
              <div style={{ marginBottom: 14 }}>
                {salaries.data!.map((s) => <div key={s.valid_from} className="ix-row ix-between ix-small" style={{ padding: "7px 0", borderBottom: "1px solid #ece7f2" }}><span>a partir de {dmy(s.valid_from)}</span><b>{brl(s.amount)}</b></div>)}
              </div>
            )}
            <div className="ix-grid c2">
              <Field label="Vigência"><Input type="date" value={sal.from} onChange={(e) => setSal({ ...sal, from: e.target.value })} aria-label="Vigência do reajuste" /></Field>
              <Field label="Novo salário"><Input inputMode="decimal" value={sal.amount} onChange={(e) => setSal({ ...sal, amount: e.target.value })} aria-label="Novo salário" /></Field>
            </div>
            <div className="ix-hint" style={{ margin: "-8px 0 12px" }}>Vale a partir da data, não retroativo.</div>
            <Btn size="sm" busy={addSal.isPending} disabled={!sal.from || toNumber(sal.amount) <= 0} onClick={() => addSal.mutate()}>Adicionar reajuste</Btn>
          </Card>
        </div>

        <Card>
          <h2 className="ix-h2 hd" style={{ marginBottom: 14 }}>Acesso por área</h2>
          {AREAS.map((a) => {
            const r = mine.find((x) => x.area === a.id);
            return (
              <div key={a.id} className="ix-row ix-between ix-wrapflex" style={{ padding: "11px 0", borderBottom: "1px solid #ece7f2" }}>
                <div><b>{a.title}</b></div>
                <div className="ix-row">
                  {!r ? <Chip tone="muted">Sem pedido</Chip> : <Chip tone={r.status === "pending" ? "pending" : r.status === "denied" ? "error" : undefined}>{r.status === "pending" ? "Pendente" : r.status === "approved" ? "Aprovado" : "Negado"}</Chip>}
                  {r && r.status !== "approved" && <Btn size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ area: a.id, ok: true })}>Aprovar</Btn>}
                  {r && r.status !== "denied" && <Btn kind="danger" size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ area: a.id, ok: false })}>{r.status === "approved" ? "Revogar" : "Negar"}</Btn>}
                </div>
              </div>
            );
          })}
        </Card>

        <Card lilac>
          <h2 className="ix-h2 hd" style={{ marginBottom: 6 }}>Dados sensíveis</h2>
          <p className="ix-muted ix-small" style={{ marginTop: 0 }}>Só a própria pessoa altera. Você vê apenas valores mascarados.</p>
          {masked.isLoading ? <Loading rows={1} /> : masked.error ? <ErrorBox error={masked.error} /> : (
            <div className="ix-grid c4">
              {SENS.map(([k, l]) => (
                <div key={k}>
                  <div className="ix-label">{l}</div>
                  <div className="ix-row ix-small" style={{ background: "#f7f5fa", border: "1.5px solid #e7e2ee", borderRadius: 14, padding: "0 14px", height: 48, color: "#8c849c" }} aria-label={`${l} (bloqueado)`}>
                    <Lock size={14} /><span>{masked.data?.[k] || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
export default Pessoa;
