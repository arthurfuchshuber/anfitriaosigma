import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, Btn, Card, ErrorBox, Field, Input, Loading } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { getMySensitive, getProfileName, saveMySensitive, updateMyProfile, uploadAvatar } from "@/lib/intranet/api";
import { dmy } from "@/lib/intranet/format";
import { Top } from "./shared";

const ADDR = ["cep", "rua", "numero", "complemento", "bairro", "cidade", "uf"] as const;
const ADDR_L: Record<string, string> = { cep: "CEP", rua: "Rua", numero: "Número", complemento: "Complemento", bairro: "Bairro", cidade: "Cidade", uf: "UF" };
const SENS = [["cpf", "CPF"], ["cnpj", "CNPJ"], ["rg", "RG"], ["pix_key", "Chave PIX"], ["bank", "Banco"], ["agency", "Agência"], ["account", "Conta"]] as const;

const Perfil = () => {
  const { profile, refresh } = useAuth();
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ nickname: "", phone: "", whatsapp: "", personal_email: "", birth_date: "", emergency_name: "", emergency_phone: "" });
  const [addr, setAddr] = useState<Record<string, string>>({});
  const [sens, setSens] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);

  const sq = useQuery({ queryKey: ["ix-sens", profile?.id], queryFn: () => getMySensitive(profile!.id), enabled: !!profile?.id, gcTime: 0 });
  const mgr = useQuery({ queryKey: ["ix-mgr", profile?.manager_id], queryFn: () => getProfileName(profile!.manager_id!), enabled: !!profile?.manager_id, retry: false });

  useEffect(() => {
    if (!profile) return;
    setF({ nickname: profile.nickname ?? "", phone: profile.phone ?? "", whatsapp: profile.whatsapp ?? "", personal_email: profile.personal_email ?? "", birth_date: profile.birth_date ?? "", emergency_name: profile.emergency_name ?? "", emergency_phone: profile.emergency_phone ?? "" });
    setAddr({ ...(profile.address ?? {}) });
  }, [profile]);
  useEffect(() => { if (sq.data !== undefined) setSens(Object.fromEntries(SENS.map(([k]) => [k, sq.data?.[k] ?? ""]))); }, [sq.data]);

  const save = useMutation({
    mutationFn: () => updateMyProfile({ ...f, address: addr }),
    onSuccess: async () => { await refresh(); toast.success("Perfil salvo"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const saveS = useMutation({
    mutationFn: () => saveMySensitive(profile!.id, sens),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ix-sens"] }); toast.success("Dados sensíveis salvos"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const photo = useMutation({
    mutationFn: (x: File) => uploadAvatar(profile!.id, x),
    onSuccess: async () => { await refresh(); toast.success("Foto atualizada"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!profile) return <div style={{ marginTop: 28 }}><Loading /></div>;
  const name = profile.full_name ?? profile.email;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const RO: [string, string][] = [["Cargo", profile.job_title ?? "—"], ["Senioridade", profile.seniority ?? "—"], ["Regime", profile.regime?.toUpperCase() ?? "—"], ["Início", dmy(profile.start_date)], ["Fim", dmy(profile.end_date)], ["Gestor", mgr.data ?? "—"]];

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

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Card style={{ marginTop: 16 }}>
          <div className="ix-grid c2" style={{ gap: "0 20px" }}>
            <Field label="Apelido"><Input value={f.nickname} onChange={set("nickname")} /></Field>
            <Field label="E-mail pessoal"><Input type="email" value={f.personal_email} onChange={set("personal_email")} /></Field>
            <Field label="Telefone"><Input inputMode="tel" value={f.phone} onChange={set("phone")} /></Field>
            <Field label="WhatsApp"><Input inputMode="tel" value={f.whatsapp} onChange={set("whatsapp")} /></Field>
            <Field label="Nascimento"><Input type="date" value={f.birth_date} onChange={set("birth_date")} /></Field>
          </div>
          <h2 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Endereço</h2>
          <div className="ix-grid c2" style={{ gap: "0 20px" }}>
            {ADDR.map((k) => <Field key={k} label={ADDR_L[k]}><Input value={addr[k] ?? ""} maxLength={k === "uf" ? 2 : undefined} onChange={(e) => setAddr((s) => ({ ...s, [k]: k === "uf" ? e.target.value.toUpperCase() : e.target.value }))} /></Field>)}
          </div>
          <h2 className="ix-h3 hd" style={{ margin: "8px 0 14px" }}>Contato de emergência</h2>
          <div className="ix-grid c2" style={{ gap: "0 20px" }}>
            <Field label="Nome"><Input value={f.emergency_name} onChange={set("emergency_name")} /></Field>
            <Field label="Telefone"><Input inputMode="tel" value={f.emergency_phone} onChange={set("emergency_phone")} /></Field>
          </div>
          <Btn type="submit" busy={save.isPending} mfull>Salvar</Btn>
        </Card>
      </form>

      <Card lilac style={{ marginTop: 16 }}>
        <div className="ix-grid c3">{RO.map(([l, v]) => <div key={l} className="ix-kpi"><span className="l">{l}</span><b>{v}</b></div>)}</div>
      </Card>

      <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); saveS.mutate(); }}>
        <Card style={{ marginTop: 16 }}>
          <div className="ix-row ix-between" style={{ marginBottom: 16 }}>
            <span className="ix-row"><Lock size={18} color="#431171" /><h2 className="ix-h3 hd">Dados sensíveis — só você pode alterar</h2></span>
            <Btn kind="ghost" size="sm" type="button" aria-label={show ? "Ocultar dados" : "Mostrar dados"} aria-pressed={show} onClick={() => setShow((v) => !v)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</Btn>
          </div>
          {sq.isLoading ? <Loading rows={2} /> : sq.error ? <ErrorBox error={sq.error} /> : (
            <>
              <div className="ix-grid c2" style={{ gap: "0 20px" }}>
                {SENS.map(([k, l]) => (
                  <Field key={k} label={l}>
                    <Input type={show ? "text" : "password"} autoComplete="off" value={sens[k] ?? ""} onChange={(e) => setSens((s) => ({ ...s, [k]: e.target.value }))} />
                  </Field>
                ))}
              </div>
              <Btn type="submit" busy={saveS.isPending} mfull>Salvar dados sensíveis</Btn>
            </>
          )}
        </Card>
      </form>
    </div>
  );
};
export default Perfil;
