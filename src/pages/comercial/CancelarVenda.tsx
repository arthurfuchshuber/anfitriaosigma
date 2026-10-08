import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { cm } from "@/lib/comercial/api";
import { Shell, Foot, Btn, Loading, ErrorBox } from "@/components/comercial/kit";
import { CancelarView, type CancelPreview, type Decision } from "@/components/comercial/vendas/CancelarView";
import type { Sale } from "@/components/comercial/vendas/VendaView";

const BACK = "/intranet/vendas";

/** /intranet/vendas/:id/cancelar — cancelamento depois do congelamento: prévia (cm_cancel_preview) e decisão do gestor (cm_cancel_sale). */
export default function CancelarVenda() {
  const { id = "" } = useParams(); const nav = useNavigate(); const qc = useQueryClient();
  const saleQ = useQuery({ queryKey: ["cm", "sale", id], queryFn: () => cm<Sale>("cm_sale_get", { p_sale: id }) });
  const pvQ = useQuery({ queryKey: ["cm", "cancel-preview", id], queryFn: () => cm<CancelPreview>("cm_cancel_preview", { p_sale: id }) });
  const [decision, setDecision] = useState<Decision>("manter"); const [motivo, setMotivo] = useState("");
  const s = saleQ.data; const pv = pvQ.data; const mgr = !!s?.is_manager;
  const go = useMutation({
    mutationFn: () => cm("cm_cancel_sale", { p_sale: id, p_decision: mgr ? decision : "manter", p_motivo: motivo.trim() || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cm", "sale", id] }); qc.invalidateQueries({ queryKey: ["cm", "sales"] }); nav(BACK); },
  });
  const need = mgr && decision === "ajustar" && !motivo.trim();
  const err = saleQ.error ?? pvQ.error;
  if (s && pv && !pv.congelado) return <Navigate to={`${BACK}/${id}`} replace />;
  return (
    <Shell title="Cancelar Venda" back={BACK} nav="Vendas"
      footer={s && pv ? (
        <Foot note={mgr ? undefined : "O Gestor Revisará o Resultado Congelado"}>
          <Btn kind="outline" w={96} onClick={() => nav(BACK)}>Voltar</Btn>
          <Btn disabled={need || go.isPending || !s.can_cancel} onClick={() => go.mutate()}>{go.isPending ? "Cancelando…" : "Confirmar Cancelamento"}</Btn>
        </Foot>) : undefined}>
      {err ? <ErrorBox e={err} /> : !s || !pv ? <Loading /> : (
        <>
          <CancelarView s={s} pv={pv} isManager={mgr} decision={decision} onDecision={setDecision} motivo={motivo} onMotivo={setMotivo} />
          {go.error && <ErrorBox e={go.error} />}
        </>
      )}
    </Shell>
  );
}
