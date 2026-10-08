import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cm } from "@/lib/comercial/api";
import { Shell, Foot, Btn, Loading, ErrorBox } from "@/components/comercial/kit";
import { RegistrarView, type Preview, type ProdOpt, type RegForm } from "@/components/comercial/vendas/RegistrarView";
import { formaPayload, formasOk, type FormaIn } from "@/components/comercial/vendas/FormasEditor";
import { uploadComprovante } from "@/components/comercial/vendas/comprovante";

type Me = { is_manager: boolean; seller_id: string | null; today: string; sellers: { id: string; name: string }[] };
const key = () => Math.random().toString(36).slice(2);

/** /intranet/vendas/nova — cm_products_options + cm_me; prévia dos pontos por cm_sale_preview; grava com cm_register_sale. */
export default function RegistrarVenda() {
  const nav = useNavigate(); const qc = useQueryClient(); const { session } = useAuth();
  const meQ = useQuery({ queryKey: ["cm", "me"], queryFn: () => cm<Me>("cm_me"), staleTime: 60_000 });
  const optQ = useQuery({ queryKey: ["cm", "products-options"], queryFn: () => cm<{ products: (ProdOpt & { active: boolean })[] }>("cm_products_options"), staleTime: 60_000 });
  const me = meQ.data;
  const products = useMemo(() => (optQ.data?.products ?? []).filter((p) => p.active && p.cobrancas.length > 0), [optQ.data]);

  const [form, setForm] = useState<RegForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uerr, setUerr] = useState<unknown>(null);
  const set = (p: Partial<RegForm>) => setForm((f) => (f ? { ...f, ...p } : f));

  const seedFormas = (prod: ProdOpt | undefined, cobId: string, data: string): FormaIn[] => {
    const c = prod?.cobrancas.find((x) => x.id === cobId);
    const f0 = prod?.formas[0];
    return f0 ? [{ key: key(), forma: f0.forma, bruto: Number(c?.bruto ?? 0), parcelas: 1, data }] : [];
  };
  useEffect(() => {
    if (form || !me || !products.length) return;
    const p = products[0];
    setForm({ seller: me.seller_id ?? me.sellers[0]?.id ?? "", product: p.id, cobranca: p.cobrancas[0].id, cliente: "", formas: seedFormas(p, p.cobrancas[0].id, me.today), pago: true, data: me.today, comprovante: "" });
  }, [me, products, form]);

  const onProduct = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    set({ product: id, cobranca: p.cobrancas[0].id, formas: seedFormas(p, p.cobrancas[0].id, form!.data) });
  };
  const onCobranca = (id: string) => {
    const p = products.find((x) => x.id === form!.product)!;
    const c = p.cobrancas.find((x) => x.id === id);
    set({ cobranca: id, formas: form!.formas.length === 1 ? [{ ...form!.formas[0], bruto: Number(c?.bruto ?? form!.formas[0].bruto) }] : form!.formas });
  };
  const onData = (d: string) => set({ data: d, formas: form!.formas.map((f) => (f.touched ? f : { ...f, data: d })) });

  const payload = (f: RegForm) => ({
    seller_id: me?.is_manager ? f.seller || null : undefined, product_id: f.product, cobranca_id: f.cobranca, cliente: f.cliente.trim(),
    pago: f.pago, data_pagamento: f.data, comprovante: f.comprovante || undefined, formas: f.formas.map(formaPayload),
  });
  const valid = !!form && !!form.product && !!form.cobranca && !!form.data && formasOk(form.formas);
  const prevQ = useQuery({
    queryKey: ["cm", "sale-preview", form && JSON.stringify(payload({ ...form, cliente: "", comprovante: "" }))],
    enabled: valid, placeholderData: keepPreviousData, retry: false,
    queryFn: () => cm<Preview>("cm_sale_preview", { p: payload({ ...form!, cliente: "", comprovante: "" }) }),
  });
  const save = useMutation({
    mutationFn: () => cm<string>("cm_register_sale", { p: payload(form!) }),
    onSuccess: (id) => { qc.invalidateQueries({ queryKey: ["cm", "sales"] }); nav(`/intranet/vendas/${id}`); },
  });
  const onFile = async (file: File) => {
    if (!session?.user.id) return;
    setUploading(true); setUerr(null);
    try { set({ comprovante: await uploadComprovante(file, session.user.id) }); } catch (e) { setUerr(e); } finally { setUploading(false); }
  };

  const ready = valid && form!.cliente.trim().length > 0 && !save.isPending && !uploading;
  return (
    <Shell title="Registrar Venda" back="/intranet/vendas" nav="Vendas"
      footer={<Foot><Btn kind="outline" w={96} onClick={() => nav("/intranet/vendas")}>Voltar</Btn><Btn disabled={!ready} onClick={() => save.mutate()}>{save.isPending ? "Registrando…" : "Registrar Venda"}</Btn></Foot>}>
      {meQ.error || optQ.error ? <ErrorBox e={meQ.error ?? optQ.error} /> : !form || !me ? <Loading /> : (
        <>
          <RegistrarView form={form} set={(p) => {
              if (p.product !== undefined && p.product !== form.product) return onProduct(p.product);
              if (p.cobranca !== undefined && p.cobranca !== form.cobranca) return onCobranca(p.cobranca);
              if (p.data !== undefined && p.data !== form.data) return onData(p.data);
              set(p);
            }}
            products={products} sellers={me.sellers} canPickSeller={me.is_manager && me.sellers.length > 0} preview={valid ? prevQ.data : undefined}
            previewLoading={prevQ.isFetching} previewError={valid ? prevQ.error : null} uploading={uploading} onFile={onFile} today={me.today} />
          {(uerr || save.error) && <ErrorBox e={uerr ?? save.error} />}
        </>
      )}
    </Shell>
  );
}
