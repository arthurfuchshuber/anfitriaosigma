import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { cm } from "@/lib/comercial/api";
import { ErrorBox, Loading, Shell } from "@/components/comercial/kit";
import { Editor } from "@/components/comercial/parametros/Editor";
import { ETAPAS, type Etapa, type MonthsList, type RulesGet } from "@/components/comercial/parametros/types";

/** /intranet/parametros/:etapa?meses=2026-11-01,2026-12-01 */
export default function Parametros() {
  const { etapa } = useParams();
  const [sp] = useSearchParams();
  const list = useQuery({ queryKey: ["cm", "months"], queryFn: () => cm<MonthsList>("cm_months_list") });
  const fromUrl = (sp.get("meses") ?? "").split(",").map((s) => s.trim()).filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)).sort();
  const months = fromUrl.length ? fromUrl : list.data ? [(list.data.rows.find((r) => !r.locked) ?? list.data.rows[1] ?? list.data.rows[0]).month] : [];
  const rg = useQuery({ queryKey: ["cm", "rules", months.join()], enabled: months.length > 0, queryFn: () => cm<RulesGet>("cm_rules_get", { p_months: months }) });

  if (!etapa || !ETAPAS.includes(etapa as Etapa)) return <Navigate to={`/intranet/parametros/meta${sp.toString() ? `?${sp.toString()}` : ""}`} replace />;
  const err = list.error ?? rg.error;
  if (err) return <Shell title="Parâmetros das Metas" back="/intranet/metas"><ErrorBox e={err} /></Shell>;
  if (!list.data || !rg.data) return <Shell title="Parâmetros das Metas" back="/intranet/metas"><Loading /></Shell>;
  return <Editor key={months.join()} etapa={etapa as Etapa} months={months} rg={rg.data} list={list.data} />;
}
