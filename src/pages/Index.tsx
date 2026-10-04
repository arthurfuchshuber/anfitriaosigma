import { Helmet } from "react-helmet-async";
import { MessageCircle } from "lucide-react";
import "@/styles/sigma.css";
import { Navbar } from "@/components/sigma/Navbar";
import { Hero } from "@/components/sigma/Hero";
import { Cities } from "@/components/sigma/Cities";
import { Stats } from "@/components/sigma/Stats";
import { Simulator } from "@/components/sigma/Simulator";
import { Solution } from "@/components/sigma/Solution";
import { Compare } from "@/components/sigma/Compare";
import { Process } from "@/components/sigma/Process";
import { Care } from "@/components/sigma/Care";
import { Services } from "@/components/sigma/Services";
import { Results } from "@/components/sigma/Results";
import { About } from "@/components/sigma/About";
import { OwnerReviews } from "@/components/sigma/OwnerReviews";
import { GuestReviews } from "@/components/sigma/GuestReviews";
import { Faq } from "@/components/sigma/Faq";
import { FinalCta } from "@/components/sigma/FinalCta";
import { Footer } from "@/components/sigma/Footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MHero } from "@/components/sigma/mobile/MHero";
import { MCities } from "@/components/sigma/mobile/MCities";
import { MStats } from "@/components/sigma/mobile/MStats";
import { MSimulator } from "@/components/sigma/mobile/MSimulator";
import { MSolution } from "@/components/sigma/mobile/MSolution";
import { MCompare } from "@/components/sigma/mobile/MCompare";
import { MProcess } from "@/components/sigma/mobile/MProcess";
import { MCare } from "@/components/sigma/mobile/MCare";
import { MServices } from "@/components/sigma/mobile/MServices";
import { MResults } from "@/components/sigma/mobile/MResults";
import { MAbout } from "@/components/sigma/mobile/MAbout";
import { MOwnerReviews } from "@/components/sigma/mobile/MOwnerReviews";
import { MGuestReviews } from "@/components/sigma/mobile/MGuestReviews";
import { MFaq } from "@/components/sigma/mobile/MFaq";
import { MFinalCta } from "@/components/sigma/mobile/MFinalCta";
import { MFooter } from "@/components/sigma/mobile/MFooter";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { css } from "@/lib/css";

const Index = () => {
  const mobile = useMediaQuery("(max-width: 767px)");
  return (
  <div className="sg min-h-screen">
    <Helmet>
      <title>Anfitrião Sigma — Maximize a receita do seu imóvel</title>
      <meta name="description" content="Gestão completa e mentoria premium para anfitriões. Transforme seu imóvel em uma máquina de renda com a Anfitrião Sigma. Análise gratuita." />
      <meta name="theme-color" content="#ffffff" />
      <link rel="canonical" href="https://anfitriaosigma.com.br/" />
      <meta property="og:url" content="https://anfitriaosigma.com.br/" />
    </Helmet>

    <Navbar />
    {mobile ? (
      <>
        <main>
          <MHero />
          <MCities />
          <MStats />
          <MSimulator />
          <MSolution />
          <MCompare />
          <MProcess />
          <MCare />
          <MServices />
          <MResults />
          <MAbout />
          <MOwnerReviews />
          <MGuestReviews />
          <MFaq />
          <MFinalCta />
        </main>
        <MFooter />
      </>
    ) : (
      <>
        <main>
          <Hero />
          <Cities />
          <Stats />
          <Simulator />
          <Solution />
          <Compare />
          <Process />
          <Care />
          <Services />
          <Results />
          <About />
          <OwnerReviews />
          <GuestReviews />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </>
    )}

    {/* WhatsApp flutuante */}
    <a
      href={getWhatsAppUrl("geral")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="btn"
      style={css("position:fixed;bottom:20px;right:20px;z-index:50;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#5A2394,#2A0A47);color:#fff;box-shadow:0 18px 40px -14px rgba(67,17,113,.7)")}
    >
      <MessageCircle size={24} />
    </a>
  </div>
  );
};

export default Index;
