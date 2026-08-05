import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";
import fundadoresAsset from "@/assets/fundadores-transp.png.asset.json";

export const Hero = () => {
  return (
    <section
      id="top"
      className="relative pt-28 md:pt-24 lg:pt-36 pb-12 md:pb-16 overflow-hidden lg:min-h-screen lg:flex lg:items-start"
    >
      {/* Background glows */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container relative w-full">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-20 lg:gap-10 items-start">
          {/* Texto */}
          <div className="lg:col-span-7 flex flex-col gap-8 md:gap-10 lg:gap-12 items-center text-center lg:items-start lg:text-left">
            <div className="shimmer inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-in lg:self-start">
              <Sparkles className="size-3.5 text-primary" />
              Maximização de receita em hospedagem
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.25] lg:leading-[1.15] tracking-tight animate-fade-in-up">
              Transforme seu imóvel em{" "}
              <span className="text-gradient-primary">uma máquina real de receita.</span>
            </h1>

            <p
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-[1.8] animate-fade-in-up"
              style={{ animationDelay: "120ms" }}
            >
              Cuidamos da operação completa — você acompanha os resultados.
              Studios, apartamentos e casas geridos com estratégia validada em
              Foz do Iguaçu, Gramado, Balneário Camboriú e Curitiba.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
              style={{ animationDelay: "240ms" }}
            >
              <Button
                size="lg"
                onClick={() => openWhatsApp("gestao")}
                className="group bg-gradient-primary hover:opacity-95 text-primary-foreground shadow-glow rounded-full px-7 h-12 text-base font-semibold pulse-glow"
              >
                Quero maximizar meu imóvel
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp("mentoria")}
                className="border-border bg-transparent hover:bg-surface text-foreground rounded-full px-7 h-12 text-base font-semibold"
              >
                Quero aprender a faturar
              </Button>
            </div>

            {/* Mini stats */}
            <div
              className="grid grid-cols-3 gap-4 max-w-lg w-full animate-fade-in-up"
              style={{ animationDelay: "360ms" }}
            >
              {[
                { v: "+150%", l: "Receita média" },
                { v: "100+", l: "Imóveis geridos" },
                { v: "4.9★", l: "Avaliação hóspedes" },
              ].map((s) => (
                <div key={s.l} className="text-center lg:text-left">
                  <div className="font-display text-2xl md:text-3xl lg:text-[2rem] font-bold text-gradient">
                    {s.v}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card dos fundadores */}
          <div className="lg:col-span-5 lg:mt-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-3xl" />
              <div className="relative glass-strong rounded-3xl p-6 md:p-8 gradient-border overflow-hidden noise">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Fundadores
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Star className="size-3 fill-primary" />
                    Top performance
                  </span>
                </div>

                {/* Fundadores */}
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative glass border border-white/10">
                  {/* Fundo gelo fosco em degradê */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-primary/[0.10] to-secondary/[0.18]" />
                  <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full bg-primary/25 blur-3xl" />
                  <div className="absolute -bottom-1/3 -left-1/4 w-[90%] aspect-square rounded-full bg-secondary/30 blur-3xl" />
                  <div className="absolute inset-0 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-white/5" />
                  <img
                    src={fundadoresAsset.url}
                    alt="Fundadores da Anfitrião Sigma: gestão e operação completa de hospedagem"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 size-full object-contain object-bottom drop-shadow-[0_25px_45px_hsl(var(--background)/0.9)]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>


                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">Especialistas em</div>
                    <div className="font-semibold mt-1">Hospedagem premium padrão hotelaria</div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">Atendimento</div>
                    <div className="font-semibold mt-1">Personalizado por perfil de hóspede</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
