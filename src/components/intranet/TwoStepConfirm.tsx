import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { addMonths, monthLabel, monthStart } from "@/lib/intranet/format";
import { Btn, Field, Modal, Textarea } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: ReactNode;
  onConfirm: (when: "now" | "next", reason: string) => Promise<void>;
  hideWhen?: boolean;
}

/** Confirmação em duas etapas: 1) quando vale + motivo; 2) resumo e "Confirmar alteração". */
export const TwoStepConfirm = ({ open, onClose, title, summary, onConfirm, hideWhen }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [when, setWhen] = useState<"now" | "next">("now");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setStep(1); setWhen("now"); setReason(""); setBusy(false); } }, [open]);

  const cur = monthStart();
  const next = addMonths(cur, 1);
  const opt = (v: "now" | "next", t: string, d: string) => (
    <label key={v} className="ix-card" style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: 16, borderRadius: 18, borderColor: when === v ? "#431171" : undefined }}>
      <input type="radio" name="when" checked={when === v} onChange={() => setWhen(v)} style={{ marginTop: 4, accentColor: "#431171" }} />
      <span><b>{t}</b><br /><span className="ix-muted ix-small">{d}</span></span>
    </label>
  );

  const run = async () => {
    setBusy(true);
    try { await onConfirm(hideWhen ? "now" : when, reason.trim()); onClose(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={step === 1
        ? <><Btn kind="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={() => setStep(2)} arrow>Continuar</Btn></>
        : <><Btn kind="ghost" onClick={() => setStep(1)} disabled={busy}>Voltar</Btn><Btn onClick={run} busy={busy}>Confirmar alteração</Btn></>}>
      {step === 1 ? (
        <>
          {!hideWhen && (
            <div style={{ display: "grid", gap: 10, marginBottom: 16 }} role="radiogroup" aria-label="Quando vale">
              {opt("now", "Agora", `Vale já neste mês (${monthLabel(cur)})`)}
              {opt("next", "Mês seguinte", `Vale a partir de ${monthLabel(next)}`)}
            </div>
          )}
          <Field label="Motivo (opcional)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo" /></Field>
        </>
      ) : (
        <div className="ix-card lilac" style={{ display: "grid", gap: 8 }}>
          {summary}
          {!hideWhen && <div className="ix-small ix-muted">Vale {when === "now" ? `já em ${monthLabel(cur)}` : `a partir de ${monthLabel(next)}`}.</div>}
          {reason.trim() && <div className="ix-small ix-muted">Motivo: {reason.trim()}</div>}
        </div>
      )}
    </Modal>
  );
};
export default TwoStepConfirm;
