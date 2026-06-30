import { useReveal } from "@/hooks/use-reveal";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { RevenueCompare } from "@/components/landing/RevenueCompare";
import { PainSolution } from "@/components/landing/PainSolution";
import { Services } from "@/components/landing/Services";
import { SocialProof } from "@/components/landing/SocialProof";
import { Founders } from "@/components/landing/Founders";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const Index = () => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="relative min-h-screen overflow-x-hidden">
      <Helmet>
        <title>Anfitrião Sigma — Maximize a receita do seu imóvel</title>
        <meta name="description" content="Gestão completa e mentoria premium para anfitriões. Transforme seu imóvel em uma máquina de renda com a Anfitrião Sigma. Análise gratuita." />
        <link rel="canonical" href="https://anfitriaosigma.com.br/" />
        <meta property="og:url" content="https://anfitriaosigma.com.br/" />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <RevenueCompare />
        <PainSolution />
        <Services />
        <SocialProof />
        <Founders />
        <FinalCTA />
        <FAQ />
      </main>
      <Footer />

      {/* WhatsApp flutuante */}
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

export default Index;
