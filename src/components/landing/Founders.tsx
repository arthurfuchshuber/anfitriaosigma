export const Founders = () => {
  return (
    <section id="sobre" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Imagem placeholder */}
          <div className="relative reveal">
            <div className="absolute -inset-6 bg-gradient-primary opacity-15 blur-3xl rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden gradient-border aspect-[4/5] bg-gradient-to-br from-secondary/30 via-background to-primary/15 noise">
              <div className="absolute inset-0 flex items-end p-8">
                <div className="flex -space-x-6">
                  <div className="size-32 md:size-40 rounded-full bg-gradient-to-br from-primary/60 to-secondary border-4 border-background shadow-glow-sm flex items-center justify-center font-display text-3xl font-bold">
                    EM
                  </div>
                  <div className="size-32 md:size-40 rounded-full bg-gradient-to-br from-secondary to-primary/60 border-4 border-background shadow-glow-sm flex items-center justify-center font-display text-3xl font-bold">
                    AS
                  </div>
                </div>
              </div>
              <div className="absolute top-5 left-5 glass rounded-full px-3 py-1 text-[11px]">
                Foto profissional dos fundadores
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="reveal">
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Quem está por trás</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Criamos a Anfitrião Sigma para transformar imóveis comuns em{" "}
              <span className="text-gradient-primary">ativos altamente lucrativos</span>.
            </h2>
            <div className="mt-7 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Depois de operar centenas de hospedagens nas regiões mais
                competitivas do Brasil, percebemos um padrão: imóveis ótimos
                rendendo muito menos do que poderiam — não por falta de demanda,
                mas por falta de estratégia.
              </p>
              <p>
                A Sigma nasceu para corrigir isso. Combinamos operação impecável,
                tecnologia de precificação e experiência premium para hóspedes —
                entregando aos proprietários o que mais importa: <span className="text-foreground font-medium">tranquilidade e lucro real</span>.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="font-display text-3xl font-bold text-gradient">8+</div>
                <div className="text-xs text-muted-foreground mt-1">Anos de mercado</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="font-display text-3xl font-bold text-gradient">R$ 12M+</div>
                <div className="text-xs text-muted-foreground mt-1">Geridos para clientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
