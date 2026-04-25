import { ArrowRight, Camera, Tag, MessageSquare, Sparkles, Wrench, BarChart3, GraduationCap, Target, Rocket, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

const gestaoFeatures = [
  { icon: Camera, label: "Fotos profissionais & anúncios" },
  { icon: Tag, label: "Precificação dinâmica diária" },
  { icon: MessageSquare, label: "Atendimento 24/7 ao hóspede" },
  { icon: Sparkles, label: "Limpeza e enxoval premium" },
  { icon: Wrench, label: "Manutenção preventiva" },
  { icon: BarChart3, label: "Relatórios mensais transparentes" },
];

const mentoriaFeatures = [
  { icon: Target, label: "Posicionamento de alto valor" },
  { icon: BarChart3, label: "Pricing e revenue management" },
  { icon: BrainCircuit, label: "Estratégias validadas e cases reais" },
  { icon: Rocket, label: "Plano de escala 90 dias" },
  { icon: MessageSquare, label: "Comunidade exclusiva de anfitriões" },
  { icon: GraduationCap, label: "Mentoria 1:1 com fundadores" },
];

export const Services = () => {
  return (
    <section id="servicos" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
            Dois caminhos. Um destino.
          </div>
          <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tight">
            Escolha como quer{" "}
            <span className="text-gradient-primary">aumentar sua receita.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Gestão */}
          <div className="group relative rounded-3xl bg-surface border border-border p-8 md:p-10 transition-all duration-500 hover:border-primary/40 hover:shadow-elegant reveal overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">01 — Gestão completa</div>
              <h3 className="font-display text-xl md:text-4xl font-bold leading-tight">
                Você não faz nada.{" "}
                <span className="text-gradient-primary">Nós fazemos tudo.</span>
              </h3>
              <p className="mt-4 text-muted-foreground">
                Do anúncio ao repasse mensal na sua conta. Operamos seu imóvel
                — studio, apartamento ou casa — com padrão hoteleiro.
              </p>

              <ul className="mt-7 space-y-3">
                {gestaoFeatures.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-4" />
                    </span>
                    <span className="text-sm">{f.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => openWhatsApp("gestao")}
                className="mt-8 w-full bg-gradient-primary hover:opacity-95 text-primary-foreground rounded-full h-12 font-semibold shadow-glow-sm group/btn"
              >
                Quero gestão completa
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Mentoria */}
          <div className="group relative rounded-3xl bg-surface border border-border p-8 md:p-10 transition-all duration-500 hover:border-primary/40 hover:shadow-elegant reveal overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">02 — Mentoria Sigma</div>
              <h3 className="font-display text-xl md:text-4xl font-bold leading-tight">
                Aprenda a fazer sozinho como um{" "}
                <span className="text-gradient-primary">profissional.</span>
              </h3>
              <p className="mt-4 text-muted-foreground">
                Para anfitriões que querem dominar o jogo: estratégia,
                automação e crescimento previsível.
              </p>

              <ul className="mt-7 space-y-3">
                {mentoriaFeatures.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-4" />
                    </span>
                    <span className="text-sm">{f.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => openWhatsApp("mentoria")}
                variant="outline"
                className="mt-8 w-full bg-transparent border-border hover:bg-surface-elevated rounded-full h-12 font-semibold group/btn"
              >
                Quero entrar para a mentoria
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
