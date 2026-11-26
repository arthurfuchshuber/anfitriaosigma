import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cm } from "@/lib/comercial/api";
import { decideAccess, setRole } from "@/lib/intranet/api";
import { Btn, Chip, GR, GR2, LINE, ROSE, SORA } from "../kit";
import { Ini } from "./shared";

export type Role = "closer" | "gestor" | "admin";
export type Access = "pending" | "approved" | "denied" | "none";
export type Person = {
  id: string; name: string; email: string; role: Role; access: Access; requested_at: string | null; decided_at: string | null; note: string | null;
  seller_id: string | null; seller_active: boolean | null; cadastro_ok: boolean; protegido: boolean;
};
export type PeopleData = { is_admin: boolean; me: string; people: Person[] };

export const ROLE_LABEL: Record<Role, string> = { closer: "Closer", gestor: "Gestor", admin: "Admin" };
export const ACCESS_LABEL: Record<Access, string> = { pending: "Pendente", approved: "Aprovado", denied: "Negado", none: "Sem Acesso" };

export const usePeople = () => useQuery({ queryKey: ["cm", "people"], queryFn: () => cm<PeopleData>("cm_people_list") });

/** "Há 5 min" · "Há 2 h" · "Há 1 dia" · "Há 3 dias" */
export const haQuanto = (iso: string | null) => {
  if (!iso) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "Agora";
  if (m < 60) return `Há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Há ${h} h`;
  const d = Math.floor(h / 24);
  return `Há ${d} ${d === 1 ? "dia" : "dias"}`;
};

/** Aprovar / negar / trocar papel: atualiza lista e menu. */
export const usePeopleActions = () => {
  const qc = useQueryClient();
  const refresh = () => { qc.invalidateQueries({ queryKey: ["cm", "people"] }); qc.invalidateQueries({ queryKey: ["cm", "hub"] }); };
  const decide = useMutation({ mutationFn: (v: { id: string; approve: boolean; note?: string }) => decideAccess(v.id, "metas", v.approve, v.note), onSuccess: refresh });
  const role = useMutation({ mutationFn: (v: { id: string; role: Role }) => setRole(v.id, v.role), onSuccess: refresh });
  return { decide, role };
};

const SHEET_CSS = `
.cm-ovl{position:fixed;inset:0;z-index:30;background:rgba(18,10,28,.45);display:flex;align-items:flex-end;justify-content:center}
.cm-sheet{width:100%;max-width:430px;background:#fff;border-radius:24px 24px 0 0;padding:12px 24px 28px;box-sizing:border-box}
.cm-grip{width:40px;height:4px;border-radius:2px;background:${LINE};margin:0 auto 16px}
@media(min-width:768px){.cm-ovl{align-items:center}.cm-sheet{max-width:440px;border-radius:24px;padding:24px}.cm-grip{display:none}}
`;

/** Janela "Negar Acesso": painel inferior no mobile, janela centralizada nas telas largas. */
export function NegarAcesso({ person, busy, error, onCancel, onConfirm }: { person: Person; busy?: boolean; error?: ReactNode; onCancel: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState("");
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onCancel(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onCancel]);
  return (
    <div className="cm-ovl" onClick={onCancel}>
      <style>{SHEET_CSS}</style>
      <div className="cm-sheet" role="dialog" aria-label="Negar Acesso" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: "#120a1c" }}>
        <div className="cm-grip" />
        <div style={{ fontFamily: SORA, fontWeight: 600, fontSize: 17, letterSpacing: "-0.03em" }}>Negar Acesso</div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <Ini name={person.name} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</div>
            <div style={{ fontSize: 11.5, color: GR }}>Comercial</div>
          </div>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motivo (Opcional)" maxLength={300}
          style={{ marginTop: 16, width: "100%", height: 96, boxSizing: "border-box", border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 14px", fontSize: 14, fontFamily: "inherit", color: "#120a1c", outline: "none", resize: "none" }} />
        {error && <div style={{ marginTop: 10, fontSize: 12.5, color: ROSE }}>{error}</div>}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Btn kind="outline" onClick={onCancel}>Cancelar</Btn>
          <Btn kind="danger" disabled={busy} onClick={() => onConfirm(note)}>Negar Acesso</Btn>
        </div>
      </div>
    </div>
  );
}

/** Situação de acesso para o canto direito de uma linha. */
export const AcessoChip = ({ a }: { a: Access }) =>
  a === "pending" ? <Chip kind="aguard">Pendente</Chip> : a === "denied" ? <Chip kind="canc">Negado</Chip> : a === "none" ? <Chip kind="sem">Sem Acesso</Chip> : null;

export { GR2 };
