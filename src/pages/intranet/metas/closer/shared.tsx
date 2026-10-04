import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Copy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Btn, Field, Modal, Textarea } from "@/components/intranet/ui";
import { useAuth } from "@/contexts/AuthContext";
import { cancelSale, getParams, listProducts, monthSummary, type ProductRow } from "@/lib/intranet/api";
import { iso } from "@/lib/intranet/format";
import type { Sale } from "@/lib/intranet/types";
import type { SimProduct } from "@/lib/intranet/calc";

export const BASE = "/intranet/metas";

export const useMyRow = (month: string) => {
  const { profile } = useAuth();
  const q = useQuery({ queryKey: ["ix-ms", month], queryFn: () => monthSummary(month) });
  const row = q.data ? q.data.find((r) => r.user_id === profile?.id) ?? q.data[0] ?? null : null;
  return { q, row };
};
export const useProducts = () => useQuery({ queryKey: ["ix-products"], queryFn: listProducts });
export const useParams_ = () => useQuery({ queryKey: ["ix-params"], queryFn: getParams });

export const toSim = (ps: ProductRow[]): SimProduct[] => ps.filter((p) => p.active && p.version).map((p) => ({ id: p.id, name: p.name, points: Number(p.version?.points ?? 0) }));

export const salePoints = (s: Sale, ps: ProductRow[]) =>
  (s.sale_items ?? []).reduce((a, it) => a + (it.qty_override ?? it.qty) * Number(ps.find((p) => p.id === it.product_id)?.version?.points ?? 0), 0);

export const saleProductsText = (s: Sale, ps: ProductRow[]) =>
  (s.sale_items ?? []).map((it) => `${it.qty}× ${ps.find((p) => p.id === it.product_id)?.name ?? "Produto"}`).join(", ") || "—";

export const addDaysIso = (d: string, n: number) => { const x = new Date(d.slice(0, 10) + "T12:00:00"); x.setDate(x.getDate() + n); return iso(x); };

/** dias úteis (seg–sex) de hoje até o fim do mês, hoje incluso */
export const weekdaysLeft = (now = new Date()) => {
  let n = 0;
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let d = now.getDate(); d <= end; d++) { const w = new Date(now.getFullYear(), now.getMonth(), d).getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
};

export const Top = ({ title, back, right }: { title: ReactNode; back?: string; right?: ReactNode }) => (
  <div className="ix-row ix-between ix-wrapflex" style={{ margin: "28px 0 20px", gap: 14 }}>
    <div className="ix-row" style={{ gap: 10 }}>
      {back && <Link to={back} aria-label="Voltar" className="ix-icon" style={{ width: 40, height: 40 }}><ChevronLeft size={20} /></Link>}
      <h1 className="ix-h2 hd" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>{title}</h1>
    </div>
    {right}
  </div>
);

export const InfoTip = ({ text }: { text: string }) => {
  const [o, setO] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)}>
      <button type="button" aria-label="Como é calculado" aria-expanded={o} onClick={() => setO((v) => !v)} onBlur={() => setO(false)}
        style={{ width: 13, height: 13, borderRadius: "50%", background: "#FF4700", color: "#fff", border: 0, fontSize: 9, fontWeight: 700, lineHeight: "13px", padding: 0, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>i</button>
      {o && <span role="tooltip" style={{ position: "absolute", top: 20, right: -4, zIndex: 20, width: 240, maxWidth: "70vw", background: "#fff", border: "1px solid #e7e2ee", borderRadius: 14, padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#120a1c", textTransform: "none", letterSpacing: 0, boxShadow: "0 20px 40px -20px rgba(67,17,113,.4)" }}>{text}</span>}
    </span>
  );
};

export const CopyBtn = ({ value, label }: { value: string; label: string }) => (
  <Btn kind="ghost" size="sm" type="button" aria-label={`Copiar ${label}`} disabled={!value}
    onClick={() => { navigator.clipboard?.writeText(value).then(() => toast.success("Copiado"), () => toast.error("Não foi possível copiar")); }}>
    <Copy size={15} />
  </Btn>
);

export const Kpi = ({ l, v }: { l: string; v: ReactNode }) => <div className="ix-kpi"><span className="l">{l}</span><span className="v">{v}</span></div>;

export const CancelModal = ({ sale, onClose }: { sale: Sale | null; onClose: () => void }) => {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const m = useMutation({
    mutationFn: () => cancelSale(sale!.id, reason.trim()),
    onSuccess: () => { toast.success("Venda cancelada"); setReason(""); qc.invalidateQueries({ queryKey: ["ix-sales"] }); qc.invalidateQueries({ queryKey: ["ix-sale"] }); qc.invalidateQueries({ queryKey: ["ix-ms"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Modal open={!!sale} onClose={onClose} title="Cancelar venda"
      footer={<><Btn kind="secondary" onClick={onClose}>Voltar</Btn><Btn kind="danger" busy={m.isPending} disabled={reason.trim().length < 3} onClick={() => m.mutate()}>Cancelar venda</Btn></>}>
      <Field label="Motivo"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo do cancelamento" /></Field>
    </Modal>
  );
};
