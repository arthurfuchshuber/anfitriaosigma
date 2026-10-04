import { useRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldGrid } from "@/components/intranet/CadastroFields";
import { PENDING_KEY, useCadastroForm } from "@/components/intranet/useCadastroForm";
import { Avatar, Btn, Card, ErrorBox, Loading } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileName, uploadAvatar } from "@/lib/intranet/api";
import { USER_GROUPS, visibleFields, type FieldDef, type GroupDef } from "@/lib/intranet/cadastro";
import { dmy } from "@/lib/intranet/format";
import { Top } from "./shared";

const F = (...keys: string[]): FieldDef[] => keys.map((k) => USER_GROUPS.flatMap((g) => g.fields).find((f) => f.key === k)!);
const part = (id: string, fields: FieldDef[]): GroupDef => ({ id, scope: "user", title: id, sub: "", icon: "id", fields });

/** Perfil usa os MESMOS campos (máscara/seleção) do cadastro pendente; o que falta aparece com a tag "Pendente". */
const BASIC = part("perfil", F("u_full_name", "u_nickname", "u_personal_email", "u_phone", "u_whatsapp", "u_birth_date"));
const ADDRESS = part("perfil-end", F("u_cep", "u_street", "u_number", "u_complement", "u_neighborhood", "u_city", "u_uf"));
const EMERG = part("perfil-emerg", F("u_emerg_name", "u_emerg_relation", "u_emerg_phone"));
const SENSITIVE = part("ident", F("u_cpf", "u_rg", "u_cnpj", "u_company_name", "u_trade_name", "u_municipal_reg", "u_pix_type", "u_pix_key", "u_bank", "u_agency", "u_account"));

const Perfil = () => {
  const { profile, refresh } = useAuth();
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const form = useCadastroForm("user");
  const [show, setShow] = useState(false);
  const mgr = useQuery({ queryKey: ["ix-mgr", profile?.manager_id], queryFn: () => getProfileName(profile!.manager_id!), enabled: !!profile?.manager_id, retry: false });

  const after = () => qc.invalidateQueries({ queryKey: [PENDING_KEY] });
  const save = useMutation({
    mutationFn: () => form.save([BASIC, ADDRESS, EMERG]),
    onSuccess: async () => { await refresh(); await after(); toast.success("Perfil salvo"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const saveS = useMutation({
    mutationFn: () => form.save([SENSITIVE]),
    onSuccess: async () => { await after(); toast.success("Dados sensíveis salvos"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const photo = useMutation({
    mutationFn: (x: File) => uploadAvatar(profile!.id, x),
    onSuccess: async () => { await refresh(); toast.success("Foto atualizada"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!profile) return <div style={{ marginTop: 28 }}><Loading /></div>;
  const name = profile.full_name ?? profile.email;
  const RO: [string, string][] = [["Cargo", profile.job_title ?? "—"], ["Senioridade", profile.seniority ?? "—"], ["Regime", profile.regime?.toUpperCase() ?? "—"], ["Início", dmy(profile.start_date)], ["Fim", dmy(profile.end_date)], ["Gestor", mgr.data ?? "—"]];
  const grid = (g: GroupDef) => <FieldGrid fields={visibleFields(g, form.doc)} ctx={form.ctx} />;
  const sensFields = visibleFields(SENSITIVE, form.doc);

  return (
    <div style={{ maxWidth: 900 }}>
      <Top title="Perfil" />
      <Card>
        <div className="ix-row" style={{ gap: 16 }}>
          <Avatar name={name} src={profile.avatar_url} size={72} />
          <div><b>{name}</b><div className="ix-small ix-faint">{profile.email}</div></div>
          <input ref={file} type="file" accept="image/*" hidden aria-label="Escolher foto" onChange={(e) => { const x = e.target.files?.[0]; if (x) photo.mutate(x); e.target.value = ""; }} />
          <Btn kind="secondary" size="sm" busy={photo.isPending} style={{ marginLeft: "auto" }} onClick={() => file.current?.click()}>Trocar foto</Btn>
        </div>
      </Card>

      {form.error ? <div style={{ marginTop: 16 }}><ErrorBox error={form.error} /></div> : !form.ready ? <div style={{ marginTop: 16 }}><Loading rows={3} /></div> : (
        <>
          <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
            <Card style={{ marginTop: 16 }}>
              {grid(BASIC)}
              <h2 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Endereço</h2>
              {grid(ADDRESS)}
              <h2 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Contato de emergência</h2>
              {grid(EMERG)}
              <Btn type="submit" busy={save.isPending} mfull>Salvar</Btn>
            </Card>
          </form>

          <Card lilac style={{ marginTop: 16 }}>
            <div className="ix-grid c3">{RO.map(([l, v]) => <div key={l} className="ix-kpi"><span className="l">{l}</span><b>{v}</b></div>)}</div>
          </Card>

          <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); saveS.mutate(); }}>
            <Card style={{ marginTop: 16 }} className={show ? "" : "ix-hide-values"}>
              <div className="ix-row ix-between" style={{ marginBottom: 16 }}>
                <span className="ix-row"><Lock size={18} color="#431171" /><h2 className="ix-h3 hd">Dados sensíveis — só você pode alterar</h2></span>
                <Btn kind="ghost" size="sm" type="button" aria-label={show ? "Ocultar dados" : "Mostrar dados"} aria-pressed={show} onClick={() => setShow((v) => !v)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</Btn>
              </div>
              <div className="ix-seg2" role="group" aria-label="Como você emite a nota">
                <button type="button" className={form.doc === "pf" ? "on" : ""} aria-pressed={form.doc === "pf"} onClick={() => form.setDoc("pf")}>Pessoa física<span className="sfx"> · CPF</span></button>
                <button type="button" className={form.doc === "pj" ? "on" : ""} aria-pressed={form.doc === "pj"} onClick={() => form.setDoc("pj")}>Pessoa jurídica<span className="sfx"> · CNPJ</span></button>
              </div>
              <FieldGrid fields={sensFields} ctx={form.ctx} />
              <Btn type="submit" busy={saveS.isPending} mfull>Salvar dados sensíveis</Btn>
            </Card>
          </form>
        </>
      )}
    </div>
  );
};
export default Perfil;
