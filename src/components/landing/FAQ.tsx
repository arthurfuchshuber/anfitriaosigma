import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona a gestão completa?",
    a: "Cuidamos de absolutamente tudo: fotos profissionais, criação dos anúncios em múltiplas plataformas, precificação dinâmica diária, atendimento ao hóspede 24/7, check-in, limpeza, enxoval e manutenção. Você recebe um relatório mensal e o repasse na sua conta.",
  },
  {
    q: "Qual a comissão cobrada?",
    a: "Trabalhamos com modelo de performance: só ganhamos quando você ganha. A taxa é apresentada na análise gratuita e varia conforme tipo de imóvel, localização e nível de serviço escolhido.",
  },
  {
    q: "Em quais regiões vocês atuam?",
    a: "Atuamos atualmente em Foz do Iguaçu, Gramado, Balneário Camboriú e Curitiba — gerindo studios, apartamentos e casas. Consulte sua cidade no contato para avaliarmos seu imóvel.",
  },
  {
    q: "Quanto tempo até meu imóvel começar a faturar?",
    a: "O processo completo (vistoria, fotos, anúncios e otimização) leva em média 7 a 14 dias. Em cidades de alta demanda, as primeiras reservas costumam acontecer já na primeira semana de anúncio publicado.",
  },
  {
    q: "A mentoria é online ou presencial?",
    a: "A Mentoria Sigma é 100% online, com aulas gravadas, encontros ao vivo semanais, comunidade exclusiva e mentorias 1:1 com os fundadores. Você acessa de qualquer lugar.",
  },
  {
    q: "E se meu imóvel não for adequado para temporada?",
    a: "Na análise gratuita avaliamos o potencial real. Se não fizer sentido, somos transparentes e dizemos. Não trabalhamos com imóveis que não têm potencial de gerar resultado de verdade.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 reveal">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-5">
              Perguntas frequentes
            </div>
            <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tight">
              Tudo que você precisa saber.
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3 reveal">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-2xl bg-surface px-6 hover:border-primary/30 transition-colors data-[state=open]:border-primary/40 data-[state=open]:shadow-glow-sm"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-base md:text-lg hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
