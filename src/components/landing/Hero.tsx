import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const compute = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const content = contentRef.current;
      if (!content) return;

      if (!isDesktop) {
        setScale(1);
        setSectionHeight(null);
        return;
      }

      // Measure natural height at scale=1
      const navOffset = 96; // espaço pro navbar
      const viewport = window.innerHeight - navOffset;
      // Reset before measuring
      content.style.transform = "scale(1)";
      const natural = content.scrollHeight;

      const next = natural > viewport ? Math.max(0.6, viewport / natural) : 1;
      setScale(next);
      setSectionHeight(natural * next + navOffset);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative pt-24 md:pt-24 lg:pt-28 pb-16 md:pb-20 overflow-hidden"
      style={sectionHeight ? { minHeight: `${sectionHeight}px` } : undefined}
    >
      {/* Background glows */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container relative">
        <div
          ref={contentRef}
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center lg:origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Texto */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-5">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-in">
              <Sparkles className="size-3.5 text-primary" />
              Maximização de receita em hospedagem
            </div>

            <h1 className="font-display text-[1.75rem] sm:text-4xl md:text-[2.6rem] lg:text-[3.25rem] xl:text-6xl font-bold leading-[1.1] tracking-tight animate-fade-in-up">
              Transforme seu imóvel em uma{" "}
              <span className="text-gradient-primary">máquina real de receita.</span>
            </h1>

            <p
              className="text-lg md:text-xl lg:text-[1.35rem] text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "120ms" }}
            >
              Cuidamos da operação completa — você acompanha os resultados.
              Studios, apartamentos e casas geridos com estratégia validada em
              Foz do Iguaçu, Gramado, Balneário Camboriú e Curitiba.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-up"
              style={{ animationDelay: "240ms" }}
            >
              <Button
                size="lg"
                onClick={() => openWhatsApp("gestao")}
                className="group bg-gradient-primary hover:opacity-95 text-primary-foreground shadow-glow rounded-full px-8 h-14 text-base lg:text-lg font-semibold pulse-glow"
              >
                Quero maximizar meu imóvel
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp("mentoria")}
                className="border-border bg-transparent hover:bg-surface text-foreground rounded-full px-8 h-14 text-base lg:text-lg font-semibold"
              >
                Quero aprender a faturar
              </Button>
            </div>

            {/* Mini stats */}
            <div
              className="grid grid-cols-3 gap-4 pt-8 lg:pt-6 max-w-xl animate-fade-in-up"
              style={{ animationDelay: "360ms" }}
            >
              {[
                { v: "+150%", l: "Receita média" },
                { v: "100+", l: "Imóveis geridos" },
                { v: "4.9★", l: "Avaliação hóspedes" },
              ].map((s) => (
                <div key={s.l} className="text-left">
                  <div className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gradient">
                    {s.v}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card dos fundadores */}
          <div className="lg:col-span-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
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

                {/* Placeholder dos cofundadores — substituir pelas fotos reais */}
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative bg-gradient-to-br from-secondary/40 via-background to-primary/20">
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="flex -space-x-4">
                      <div className="size-24 md:size-28 rounded-full bg-gradient-to-br from-primary/60 to-secondary border-2 border-background shadow-glow-sm flex items-center justify-center font-display text-2xl font-bold">
                        AT
                      </div>
                      <div className="size-24 md:size-28 rounded-full bg-gradient-to-br from-secondary to-primary/60 border-2 border-background shadow-glow-sm flex items-center justify-center font-display text-2xl font-bold">
                        JT
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 glass rounded-full px-3 py-1 text-[11px]">
                    Foto dos fundadores
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">Especialistas em</div>
                    <div className="font-semibold mt-1">Hospedagem premium</div>
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
