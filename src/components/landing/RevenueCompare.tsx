import { useMemo, useState } from "react";
import { Check, X, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openWhatsApp } from "@/lib/whatsapp";

const tradicional = {
  receita: 3500,
  custos: 450,
  liquido: 3050,
  ocupacao: "12 meses fixos",
  valorizacao: "Baixa",
};

const temporada = {
  receita: 11800,
  custos: 2400,
  liquido: 9400,
  ocupacao: "78% médio",
  valorizacao: "Alta (premium)",
};

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const RevenueCompare = () => {
  const [valor, setValor] = useState<string>("3500");
  const projetado = useMemo(() => {
    const n = Number(valor.replace(/\D/g, "")) || 0;
    return Math.round(n * 2.5);
  }, [valor]);

  return (
    <section id="comparativo" className="relative py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
            <TrendingUp className="size-3.5 text-primary" />
            Comparativo de receita
          </div>
          <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tight">
            O que você ganha em <span className="text-gradient-primary">1 mês,</span>{" "}
            pode render em <span className="text-gradient-primary">poucos dias.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Compare lado a lado: aluguel tradicional e estratégia de temporada
            operada por nós.
          </p>
        </div>

        {/* Tabela comparativa */}
        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto reveal">
          {/* Tradicional */}
          <div className="rounded-3xl border border-border bg-surface p-7 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">Aluguel tradicional</h3>
              <span className="text-xs text-muted-foreground">Mensal fixo</span>
            </div>
            <div className="space-y-4">
              <Row label="Receita bruta" value={formatBRL(tradicional.receita)} />
              <Row label="Custos" value={`- ${formatBRL(tradicional.custos)}`} />
              <Row label="Receita líquida" value={formatBRL(tradicional.liquido)} highlight muted />
              <Row label="Ocupação" value={tradicional.ocupacao} text />
              <Row label="Valorização do ativo" value={tradicional.valorizacao} text />
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <Bad>Inadimplência e calote</Bad>
              <Bad>Dor de cabeça com inquilinos</Bad>
              <Bad>Receita estagnada por anos</Bad>
            </ul>
          </div>

          {/* Temporada */}
          <div className="relative rounded-3xl p-7 md:p-8 bg-surface gradient-border shadow-elegant overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="font-display text-xl font-semibold">
                Aluguel por temporada
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-primary text-primary-foreground shadow-glow-sm">
                Recomendado
              </span>
            </div>
            <div className="space-y-4 relative">
              <Row label="Receita bruta" value={formatBRL(temporada.receita)} />
              <Row label="Custos" value={`- ${formatBRL(temporada.custos)}`} />
              <Row
                label="Receita líquida"
                value={formatBRL(temporada.liquido)}
                highlight
              />
              <Row label="Ocupação" value={temporada.ocupacao} text />
              <Row label="Valorização do ativo" value={temporada.valorizacao} text />
            </div>
            <ul className="mt-6 space-y-2 text-sm relative">
              <Good>Pagamento antecipado por hóspede</Good>
              <Good>Precificação dinâmica diária</Good>
              <Good>Crescimento contínuo de receita</Good>
            </ul>
            <div className="mt-7 relative">
              <Button
                onClick={() => openWhatsApp("analise")}
                className="w-full bg-gradient-primary hover:opacity-95 text-primary-foreground rounded-full h-11 shadow-glow-sm font-semibold"
              >
                Quero essa receita no meu imóvel
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Calculadora */}
        <div className="max-w-3xl mx-auto mt-16 reveal">
          <div className="glass-strong rounded-3xl p-7 md:p-10 gradient-border relative overflow-hidden noise">
            <div className="absolute -top-32 -left-20 h-64 w-64 bg-secondary/30 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <span className="size-1.5 rounded-full bg-primary" />
                Simulador de receita
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold">
                Quanto seu imóvel pode <span className="text-gradient-primary">render por temporada</span>?
              </h3>
              <p className="text-muted-foreground mt-2">
                Insira o valor que você recebe hoje (ou receberia) por mês no aluguel tradicional.
              </p>

              <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="h-14 pl-10 text-lg bg-background border-border rounded-2xl"
                    placeholder="3.500"
                  />
                </div>
                <Button
                  onClick={() => openWhatsApp("calculadora")}
                  className="h-14 px-7 bg-gradient-primary hover:opacity-95 text-primary-foreground rounded-2xl font-semibold shadow-glow-sm"
                >
                  Falar com especialista
                </Button>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-background/50 p-5">
                  <div className="text-xs text-muted-foreground">Hoje (tradicional)</div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {formatBRL(Number(valor.replace(/\D/g, "")) || 0)}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-glow-sm">
                  <div className="text-xs opacity-90">Potencial por temporada</div>
                  <div className="font-display text-2xl md:text-3xl font-bold mt-1">
                    {formatBRL(projetado)}
                    <span className="text-sm font-medium opacity-90 ml-2">/ mês</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                * Estimativa baseada em multiplicador médio de 2,5x observado em imóveis geridos. Resultados variam por localização, tipo e estratégia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Row({
  label,
  value,
  highlight,
  muted,
  text,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
  text?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`font-display font-semibold ${
          highlight && !muted
            ? "text-gradient-primary text-xl"
            : highlight
            ? "text-foreground text-xl"
            : text
            ? "text-foreground/80 text-sm font-medium"
            : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Good({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="size-3" />
      </span>
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}
function Bad({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <X className="size-3" />
      </span>
      <span>{children}</span>
    </li>
  );
}
