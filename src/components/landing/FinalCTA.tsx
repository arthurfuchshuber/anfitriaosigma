import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

export const FinalCTA = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container">
        <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden p-10 md:p-16 text-center reveal">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(316_100%_70%/0.45),transparent_60%)]" />
          <div className="absolute inset-0 noise opacity-50" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-4 py-1.5 text-xs font-medium text-primary-foreground mb-7">
              <Clock className="size-3.5" />
              Vagas limitadas para novos imóveis este mês
            </div>

            <h2 className="font-display text-3xl md:text-6xl font-bold tracking-tight text-primary-foreground leading-[1.05]">
              Seu imóvel pode estar{" "}
              <span className="italic">rendendo mais.</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-primary-foreground/90 max-w-xl mx-auto">
              Análise gratuita e sem compromisso. Em até 24h você sabe quanto
              seu imóvel pode gerar.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => openWhatsApp("analise")}
                className="group bg-background text-foreground hover:bg-background/90 rounded-full h-14 px-8 text-base font-semibold shadow-2xl"
              >
                Quero uma análise gratuita
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp("mentoria")}
                className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 rounded-full h-14 px-8 text-base font-semibold"
              >
                Quero a mentoria
              </Button>
            </div>

            <p className="mt-6 text-xs text-primary-foreground/70">
              Resposta em até 1h em horário comercial · Atendimento humano
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
