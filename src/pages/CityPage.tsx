import { ArrowRight, MapPin, MessageCircle, CheckCircle2, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FAQ } from "@/components/landing/FAQ";
import { Services } from "@/components/landing/Services";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl, openWhatsApp } from "@/lib/whatsapp";

export type CityContent = {
  slug: string;
  city: string;
  state: string;
  stateAbbr: string;
  region: string;
  intro: string;
  highlights: string[];
  stats: { v: string; l: string }[];
  testimonial: { quote: string; author: string; role: string };
  neighborhoods: string[];
};

type Props = { content: CityContent };

export const CityPage = ({ content }: Props) => {
  const url = `https://anfitriaosigma.com.br/gestao-airbnb-${content.slug}`;
  const title = `Gestão de Airbnb em ${content.city} (${content.stateAbbr}) | Anfitrião Sigma`;
  const description = `Anfitrião profissional em ${content.city}: gestão completa de Airbnb e temporada com hospedagem premium, +150% de receita média e atendimento humano. Análise gratuita.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Anfitrião Sigma — ${content.city}`,
    description,
    url,
    areaServed: { "@type": "City", name: content.city, containedInPlace: content.state },
    address: { "@type": "PostalAddress", addressLocality: content.city, addressRegion: content.stateAbbr, addressCountry: "BR" },
    serviceType: "Gestão de aluguel por temporada e Airbnb",
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-28 md:pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="container relative">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
              <RouterLink to="/" className="hover:text-foreground">Início</RouterLink>
              <span className="mx-2">/</span>
              <span className="text-foreground">Gestão de Airbnb em {content.city}</span>
            </nav>

            <div className="max-w-3xl flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground self-start">
                <MapPin className="size-3.5 text-primary" />
                Anfitrião profissional em {content.city} — {content.stateAbbr}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] tracking-tight">
                Gestão de Airbnb em {content.city}{" "}
                <span className="text-gradient-primary">com hospedagem padrão hotelaria.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-[1.8]">{content.intro}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => openWhatsApp("gestao")}
                  className="group bg-gradient-primary hover:opacity-95 text-primary-foreground shadow-glow rounded-full px-7 h-12 text-base font-semibold pulse-glow"
                >
                  Quero anfitrião em {content.city}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => openWhatsApp("mentoria")}
                  className="border-border bg-transparent hover:bg-surface text-foreground rounded-full px-7 h-12 text-base font-semibold"
                >
                  Aprender a faturar sozinho
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg w-full pt-4">
                {content.stats.map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{s.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Por que */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">
                Por que escolher um anfitrião profissional em {content.city}?
              </h2>
              <p className="text-muted-foreground leading-[1.8] mb-8">
                {content.city} ({content.stateAbbr}) é um dos destinos mais competitivos do {content.region}.
                Para se destacar entre milhares de anúncios e cobrar diárias premium, é preciso operação,
                precificação dinâmica e atendimento padrão hotelaria. É exatamente o que a Anfitrião Sigma entrega.
              </p>
              <ul className="grid sm:grid-cols-2 gap-4">
                {content.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 glass rounded-xl p-4">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Bairros */}
        <section className="py-16 md:py-20 bg-surface/30">
          <div className="container">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">
                Regiões atendidas em {content.city}
              </h2>
              <p className="text-muted-foreground leading-[1.8] mb-6">
                Operamos em diversas regiões da cidade, com foco em imóveis de alto giro e diárias premium:
              </p>
              <div className="flex flex-wrap gap-2">
                {content.neighborhoods.map((n) => (
                  <span key={n} className="glass rounded-full px-4 py-2 text-sm">{n}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Depoimento */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="max-w-3xl glass-strong rounded-3xl p-8 md:p-10 gradient-border">
              <div className="flex items-center gap-1 mb-4 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-primary" />)}
              </div>
              <p className="text-lg md:text-xl leading-[1.7] mb-6">"{content.testimonial.quote}"</p>
              <div>
                <div className="font-semibold">{content.testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{content.testimonial.role} · {content.city}</div>
              </div>
            </div>
          </div>
        </section>

        <Services />

        {/* Outras cidades */}
        <section className="py-16 md:py-20 bg-surface/30">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">
              Anfitrião Sigma em outras cidades
            </h2>
            <div className="flex flex-wrap gap-3">
              {OTHER_CITIES.filter((c) => c.slug !== content.slug).map((c) => (
                <RouterLink
                  key={c.slug}
                  to={`/gestao-airbnb-${c.slug}`}
                  className="glass rounded-full px-5 py-2.5 text-sm hover:bg-surface transition-colors"
                >
                  Gestão de Airbnb em {c.city}
                </RouterLink>
              ))}
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />

      <a
        href={getWhatsAppUrl("geral")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center size-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow pulse-glow hover:scale-105 transition-transform"
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  );
};

const OTHER_CITIES = [
  { slug: "foz-do-iguacu", city: "Foz do Iguaçu" },
  { slug: "gramado", city: "Gramado" },
  { slug: "balneario-camboriu", city: "Balneário Camboriú" },
  { slug: "curitiba", city: "Curitiba" },
];

export default CityPage;
