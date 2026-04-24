import { AlertCircle, ShieldCheck, Sparkles, Zap, Clock, TrendingDown, Wrench, BadgeDollarSign } from "lucide-react";

const dores = [
  { icon: TrendingDown, title: "Baixa rentabilidade", desc: "Aluguel fixo que não acompanha o mercado." },
  { icon: AlertCircle, title: "Inadimplência", desc: "Meses sem receber e processo desgastante." },
  { icon: Wrench, title: "Dor de cabeça com inquilinos", desc: "Reformas, queixas e tempo perdido." },
  { icon: Clock, title: "Tempo perdido", desc: "Gestão amadora consome suas noites e fins de semana." },
];

const solucoes = [
  { icon: BadgeDollarSign, title: "Otimização inteligente de preço", desc: "Precificação dinâmica diária baseada em demanda." },
  { icon: ShieldCheck, title: "Pagamento garantido", desc: "Hóspedes pagam antes de entrar. Zero inadimplência." },
  { icon: Sparkles, title: "Experiência premium", desc: "Atendimento concierge, limpeza e check-in impecáveis." },
  { icon: Zap, title: "Automação total", desc: "Você não responde mensagem, não emite recibo, não administra nada." },
];

export const PainSolution = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14 reveal">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Cansado dos problemas do{" "}
            <span className="text-muted-foreground line-through decoration-destructive/60">aluguel comum?</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Existe um caminho mais rentável, mais seguro e livre de esforço.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Dores */}
          <div className="rounded-3xl border border-border bg-surface p-7 md:p-8 reveal">
            <div className="text-xs uppercase tracking-[0.2em] text-destructive/80 mb-5">O problema</div>
            <h3 className="font-display text-2xl font-semibold mb-6">O que te impede de lucrar</h3>
            <ul className="space-y-4">
              {dores.map((d) => (
                <li key={d.title} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
                    <d.icon className="size-5" />
                  </span>
                  <div>
                    <div className="font-semibold">{d.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{d.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Soluções */}
          <div className="relative rounded-3xl bg-surface p-7 md:p-8 gradient-border overflow-hidden reveal">
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-5 relative">A solução Sigma</div>
            <h3 className="font-display text-2xl font-semibold mb-6 relative">Como entregamos resultado</h3>
            <ul className="space-y-4 relative">
              {solucoes.map((s) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shrink-0 shadow-glow-sm">
                    <s.icon className="size-5" />
                  </span>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
