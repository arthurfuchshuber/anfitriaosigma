const years = [
  { y: "2023", h: 22, current: false, projected: false },
  { y: "2024", h: 42, current: false, projected: false },
  { y: "2025", h: 78, current: true, projected: false },
  { y: "2026", h: 96, current: false, projected: true },
];

export const Founders = () => {
  return (
    <section id="sobre" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Gráfico de receita */}
          <div className="relative reveal order-2 lg:order-1">
            <div className="absolute -inset-6 bg-gradient-primary opacity-15 blur-3xl rounded-3xl" />
            <div className="relative rounded-3xl gradient-border bg-surface p-7 md:p-9 noise overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Receita Anual
                </div>
                <div className="text-[11px] glass rounded-full px-3 py-1 text-muted-foreground whitespace-nowrap">
                  Stúdio 35m² · Foz do Iguaçu
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-6">
                Crescimento composto + projeção 2026
              </div>

              {/* Chart */}
              <div className="relative h-56 md:h-64">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-border/40" />
                  ))}
                </div>
                {/* Bars */}
                <div className="relative h-full flex items-end justify-between gap-3 md:gap-5 px-1">
                  {years.map((b) => (
                    <div key={b.y} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 ${
                          b.projected
                            ? "bg-gradient-to-t from-primary/40 to-primary/70 border border-primary/60 shadow-glow-sm"
                            : "bg-gradient-to-t from-secondary to-primary shadow-glow-sm"
                        }`}
                        style={{ height: `${b.h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Labels */}
              <div className="mt-3 flex items-center justify-between gap-3 md:gap-5 px-1">
                {years.map((b) => (
                  <div key={b.y} className="flex-1 flex justify-center">
                    <span
                      className={`text-xs md:text-sm font-medium ${
                        b.current
                          ? "px-3 py-1 rounded-full bg-foreground text-background"
                          : "text-muted-foreground"
                      }`}
                    >
                      {b.y}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-7 pt-6 border-t border-border/60 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary/60" />
                    Projeção 2026
                  </div>
                  <div className="font-display text-xl md:text-2xl font-bold mt-1">R$ 18M+</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">Total acumulado (BRL) até 5 de maio de 2026</div>
                  <div className="font-display text-xl md:text-2xl font-bold mt-1 text-gradient-primary">
                    R$ 42.180.500
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="reveal order-1 lg:order-2">
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Quem está por trás</div>
            <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tight leading-tight">
              O Anfitrião Sigma nasceu para transformar imóveis em{" "}
              <span className="text-gradient-primary">ativos rentáveis.</span>
            </h2>
            <div className="mt-7 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Operamos hospedagens nas regiões de maior demanda do Sul do
                Brasil — Foz do Iguaçu, Gramado, Balneário Camboriú e Curitiba —
                de studios urbanos a casas de alto padrão.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">3 Estados</div>
                <div className="text-xs text-muted-foreground mt-1">SC, PR e RS</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">100+</div>
                <div className="text-xs text-muted-foreground mt-1">Imóveis sob gestão</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
