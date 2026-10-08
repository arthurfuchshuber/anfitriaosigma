import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cm } from "@/lib/comercial/api";
import { Shell, Foot, Btn, Loading, ErrorBox, Empty } from "@/components/comercial/kit";
import { VendasView, type SalesList } from "@/components/comercial/vendas/VendasView";

/** /intranet/vendas — vendedor vê o próprio mês; gestor/admin escolhe "Todos" ou um vendedor. Mês opcional em ?mes=AAAA-MM-01. */
export default function Vendas() {
  const nav = useNavigate();
  const { isManager } = useAuth();
  const [sp] = useSearchParams();
  const mes = sp.get("mes");
  const [sel, setSel] = useState<string>("auto");
  const q = useQuery({
    queryKey: ["cm", "sales", sel, mes],
    queryFn: () => cm<SalesList>("cm_sales_list", { p_seller: sel === "auto" || sel === "todos" ? null : sel, p_month: mes, p_todos: isManager && sel === "todos" }),
    placeholderData: (p) => p,
  });
  const d = q.data;
  return (
    <Shell title="Vendas" back={null} nav="Vendas" footer={<Foot><Btn onClick={() => nav("/intranet/vendas/nova")}>Registrar Venda</Btn></Foot>}>
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox e={q.error} />
        : !d || d.sem_vendedor ? <Empty>Seu usuário ainda não está cadastrado como vendedor.</Empty>
        : <VendasView data={d} isManager={isManager} selected={sel} onSelect={setSel} onOpen={(id) => nav(`/intranet/vendas/${id}`)} />}
    </Shell>
  );
}
