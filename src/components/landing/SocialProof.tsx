import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const stats = [
  { v: 150, suffix: "%", l: "Aumento médio de receita" },
  { v: 100, suffix: "+", l: "Imóveis sob gestão" },
  { v: 92, suffix: "%", l: "Taxa média de ocupação" },
  { v: 4.9, suffix: "★", l: "Avaliação dos hóspedes", decimal: true },
];

const cases = [
  { local: "Suíte 12m² · Balneário Camboriú", before: "R$ 2.800", after: "R$ 7.200", lift: "+157%" },
  { local: "Casa 3 quartos · Foz do Iguaçu", before: "R$ 6.500", after: "R$ 16.400", lift: "+152%" },
  { local: "Stúdio 35m² · Foz do Iguaçu", before: "R$ 1.900", after: "R$ 5.100", lift: "+168%" },
];

const depoimentos = [
  {
    name: "Patrícia Regina",
    role: "Proprietária · Foz do Iguaçu",
    text: "Pessoal, eu realmente nunca vi nada parecido com este valor que vocês reservaram para este período. Estou impressionada com o resultado.",
    initials: "PR",
  },
  {
    name: "Camila Albuquerque",
    role: "Proprietária · Balneário Camboriú",
    text: "Saí de um aluguel de R$ 3.200 fixo para uma média de R$ 7.800/mês. A operação é impecável e os hóspedes amam o imóvel.",
    initials: "CA",
  },
  {
    name: "Lucas Heinen",
    role: "Aluno da Mentoria · Foz do Iguaçu",
    text: "A mentoria me deu clareza sobre pricing e posicionamento. Em 90 dias estruturei o segundo imóvel com método.",
    initials: "LH",
  },
];

function Counter({ to, suffix = "", decimal = false }: { to: number; suffix?: string; decimal?: boolean }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const dur = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  const display = decimal ? val.toFixed(1) : Math.round(val).toString();
  return (
    <span ref={ref} className="font-display text-2xl md:text-5xl font-bold text-gradient">
      {display}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

export const SocialProof = () => {
  return (
    <section id="prova" className="py-24 md:py-32 relative">
      <div className="container">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto reveal">
          {stats.map((s) => (
            <div key={s.l} className="rounded-3xl glass-strong p-7 text-center gradient-border">
              <Counter to={s.v} suffix={s.suffix} decimal={s.decimal} />
              <div className="text-sm text-muted-foreground mt-3">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Cases */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-10 reveal">
            <h2 className="font-display text-2xl md:text-5xl font-bold tracking-tight">
              Resultados <span className="text-gradient-primary">reais.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {cases.map((c) => (
              <div key={c.local} className="rounded-2xl bg-surface border border-border p-6 reveal hover:border-primary/40 transition-colors">
                <div className="text-xs text-muted-foreground">{c.local}</div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Antes</div>
                    <div className="font-display text-lg font-semibold text-muted-foreground line-through">{c.before}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-primary">Depois</div>
                    <div className="font-display text-2xl font-bold text-gradient-primary">{c.after}</div>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  {c.lift} de receita
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {depoimentos.map((d) => (
              <figure key={d.name} className="rounded-3xl glass p-7 relative reveal">
                <Quote className="size-8 text-primary/40 mb-4" />
                <blockquote className="text-foreground/90 leading-relaxed">"{d.text}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
                  <span className="size-11 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground">
                    {d.initials}
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-primary" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
