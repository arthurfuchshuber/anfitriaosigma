import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

const links = [
  { label: "Comparativo", href: "#comparativo" },
  { label: "Serviços", href: "#servicos" },
  { label: "Resultados", href: "#prova" },
  { label: "Sobre", href: "#sobre" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div
        className={`container transition-all duration-300 ${
          scrolled ? "glass-strong rounded-full px-4 sm:px-6" : ""
        }`}
      >
        <nav className="flex items-center justify-between h-14">
          <a href="#top" className="flex items-center gap-2 group">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary shadow-glow-sm">
              <span className="font-display text-base font-bold text-primary-foreground">Σ</span>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Anfitrião <span className="text-gradient-primary">Sigma</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openWhatsApp("analise")}
              className="hidden md:inline-flex bg-gradient-primary hover:opacity-90 shadow-glow-sm text-primary-foreground rounded-full px-5"
            >
              Análise gratuita
            </Button>
            <button
              className="md:hidden text-foreground p-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground py-2"
                >
                  {l.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  setOpen(false);
                  openWhatsApp("analise");
                }}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-full mt-2"
              >
                Análise gratuita
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
