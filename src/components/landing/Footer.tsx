import { Instagram, MessageCircle, Mail } from "lucide-react";
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 py-14 mt-10">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary shadow-glow-sm">
                <span className="font-display text-base font-bold text-primary-foreground">Σ</span>
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Anfitrião <span className="text-gradient-primary">Sigma</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Maximização de receita para imóveis em plataformas de hospedagem.
              Operação premium, lucro real.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Navegação</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#comparativo" className="hover:text-primary transition-colors">Comparativo</a></li>
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#prova" className="hover:text-primary transition-colors">Resultados</a></li>
              <li><a href="#sobre" className="hover:text-primary transition-colors">Sobre</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contato</div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={getWhatsAppUrl("geral")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a href="mailto:contato@anfitriaosigma.com" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="size-4" />
                  contato@anfitriaosigma.com
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram className="size-4" />
                  @anfitriaosigma
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Anfitrião Sigma. Todos os direitos reservados.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
