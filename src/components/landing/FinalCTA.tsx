import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

export const FinalCTA = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container">
        <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden p-10 md:p-16 text-center reveal gradient-border">
          {/* Background — gelo fosco na tonalidade da marca */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/10 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
          <div className="absolute inset-0 noise opacity-30" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-7">
              <Clock className="size-3.5 text-primary" />
              Vagas limitadas para novos imóveis
            </div>

            <h2 className="font-display text-2xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
              Seu imóvel pode estar{" "}
              <span className="text-gradient-primary italic">rendendo mais.</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Análise gratuita e sem compromisso. Em até 24h você sabe quanto
              seu imóvel pode gerar.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => openWhatsApp("analise")}
                className="group bg-gradient-primary hover:opacity-95 text-primary-foreground rounded-full h-14 px-8 text-base font-semibold shadow-glow"
              >
                Quero uma análise gratuita
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp("mentoria")}
                className="bg-transparent border-border hover:bg-surface text-foreground rounded-full h-14 px-8 text-base font-semibold"
              >
                Quero a mentoria
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Resposta em até 1h em horário comercial
              <br />
              Atendimento humano
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
