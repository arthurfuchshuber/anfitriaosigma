import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { css } from "@/lib/css";
import { SigmaLogo } from "@/components/sigma/SigmaLogo";
import { useMediaQuery } from "@/hooks/use-media-query";

const LINKS = [
  { label: "Solução", href: "#solucao" },
  { label: "Comparativo", href: "#comparativo" },
  { label: "Processo", href: "#processo" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "FAQ", href: "#faq" },
];

// Áreas de acesso. Intranet ligada (/intranet). "Proprietário" segue desativado até existir a página.
const ACCESS = [
  { label: "Intranet", href: "/intranet", enabled: true },
  { label: "Proprietário", href: "", enabled: false },
];

/**
 * Navbar fixa com efeito ao rolar:
 *  topo   → pílula clara de vidro, ampla
 *  rolando → pílula escura (roxo profundo) mais compacta, com mais blur e sombra
 */
export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = scrolled || open;
  const textColor = dark ? "#E9E1F4" : "#5F5870";
  const brandColor = dark ? "#fff" : "#120A1C";

  const header = css(
    `position:fixed;left:50%;transform:translateX(-50%);z-index:50;
     top:${isMobile ? (dark ? 10 : 12) : dark ? 10 : 18}px;
     width:min(${dark ? 1240 : 1320}px,calc(100% - 24px));
     display:flex;align-items:center;justify-content:space-between;gap:16px;
     padding:${isMobile ? "8px 8px 8px 14px" : dark ? "8px 10px 8px 18px" : "10px 12px 10px 20px"};
     border-radius:${isMobile ? 15 : 999}px;
     background:${dark ? "rgba(18,10,28,.82)" : "rgba(255,255,255,.72)"};
     backdrop-filter:blur(${dark ? 24 : 20}px) saturate(1.5);-webkit-backdrop-filter:blur(${dark ? 24 : 20}px) saturate(1.5);
     border:1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(67,17,113,.10)"};
     box-shadow:${dark ? "0 24px 60px -24px rgba(18,10,28,.7)" : "0 20px 50px -28px rgba(67,17,113,.35)"};
     transition:all .45s cubic-bezier(.2,.8,.2,1)`.replace(/\s*\n\s*/g, ""),
  );

  return (
    <>
      <header style={header}>
        <a href="#top" style={css(`display:flex;align-items:center;gap:11px;color:${brandColor};transition:color .3s`)}>
          <SigmaLogo size={36} variant="tile" />
          <span className="hd" style={css("font-weight:600;font-size:16px;letter-spacing:-0.02em")}>Anfitrião Sigma</span>
        </a>

        <nav className="sg-nav-links" style={css(`gap:28px;font-size:14.5px;font-weight:500;color:${textColor};transition:color .3s`)}>
          {LINKS.map((l) => (
            <a key={l.href} className={`navlink ${dark ? "navlink-dark" : ""}`} href={l.href} style={css("color:inherit")}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="sg-nav-desktop" style={css("align-items:center;gap:8px")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                style={css(
                  `display:inline-flex;align-items:center;gap:6px;cursor:pointer;background:transparent;border-radius:999px;padding:10px 16px;font-weight:600;font-size:14.5px;color:${dark ? "#fff" : "#120A1C"};border:1px solid ${dark ? "rgba(255,255,255,.28)" : "#D2C5E3"};transition:all .3s`,
                )}
              >
                Entrar <ChevronDown size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} style={css("min-width:210px;border-radius:16px;padding:6px;background:#fff;border:1px solid #E7E2EE;box-shadow:0 24px 50px -20px rgba(67,17,113,.45);font-family:'DM Sans',sans-serif")}>
              {ACCESS.map((a) => (
                <DropdownMenuItem
                  key={a.label}
                  disabled={!a.enabled}
                  onSelect={() => a.enabled && a.href && navigate(a.href)}
                  style={css("display:flex;justify-content:space-between;gap:16px;padding:11px 12px;border-radius:10px;font-size:14.5px;font-weight:600;color:#120A1C")}
                >
                  {a.label}
                  {!a.enabled && <span style={css("font-size:11px;font-weight:600;color:#8C849C")}>em breve</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a
            className="btn"
            href="#cta"
            style={css(
              `background:${dark ? "#fff" : "#431171"};color:${dark ? "#431171" : "#fff"};font-weight:600;font-size:14.5px;padding:11px 22px;border-radius:999px;transition:background .3s,color .3s`,
            )}
          >
            Análise gratuita
          </a>
        </div>

        <button
          type="button"
          className="sg-menu-btn"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={css(`align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;border:0;cursor:pointer;background:transparent;color:${brandColor}`)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {open && (
        <div
          style={css("position:fixed;z-index:49;left:12px;right:12px;top:72px;background:rgba(18,10,28,.97);backdrop-filter:blur(20px);border-radius:15px;padding:14px 18px 18px;color:#fff;box-shadow:0 30px 70px -30px rgba(0,0,0,.7)")}
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={css("display:block;padding:13px 4px;font-weight:500;font-size:17px;color:#E9E1F4;border-bottom:1px solid rgba(255,255,255,.07)")}>
              {l.label}
            </a>
          ))}
          <div style={css("margin-top:14px")}>
            {ACCESS.map((a, i) =>
              a.enabled ? (
                <a
                  key={a.label}
                  href={a.href}
                  onClick={(e) => { e.preventDefault(); setOpen(false); navigate(a.href); }}
                  style={css(`display:flex;justify-content:space-between;align-items:center;padding:12px 4px;font-weight:600;font-size:16px;color:#fff;${i < ACCESS.length - 1 ? "border-bottom:1px solid rgba(255,255,255,.07)" : ""}`)}
                >
                  {a.label}
                </a>
              ) : (
                <span
                  key={a.label}
                  style={css(`display:flex;justify-content:space-between;align-items:center;padding:12px 4px;font-weight:600;font-size:16px;color:#8F7FA6;${i < ACCESS.length - 1 ? "border-bottom:1px solid rgba(255,255,255,.07)" : ""}`)}
                >
                  {a.label}
                  <span style={css("font-size:11px;font-weight:600")}>em breve</span>
                </span>
              ),
            )}
          </div>
          <a className="btn" href="#cta" onClick={() => setOpen(false)} style={css("margin-top:12px;display:flex;align-items:center;justify-content:center;background:#fff;color:#431171;font-weight:600;font-size:16.5px;height:54px;border-radius:999px")}>
            Análise gratuita
          </a>
        </div>
      )}
    </>
  );
};
