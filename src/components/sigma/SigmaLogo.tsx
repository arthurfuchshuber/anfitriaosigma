/**
 * Logomarca oficial (σ).
 *  - variant "color": quadrado com degradê laranja→roxo (/logo-sigma.png) — usado na Intranet, favicon, OG.
 *  - variant "tile": formato clássico da landing (quadrado roxo profundo) com o σ branco oficial sem fundo (/logo-sigma-mark.png).
 */
export const SigmaLogo = ({ size = 36, radius = 10, variant = "color" }: { size?: number; radius?: number; variant?: "color" | "tile" }) =>
  variant === "tile" ? (
    <span
      role="img"
      aria-label="Anfitrião Sigma"
      style={{ width: size, height: size, borderRadius: radius, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#5A2394,#2A0A47)" }}
    >
      <img src="/logo-sigma-mark.png" alt="" width={size * 0.6} style={{ width: size * 0.6, height: "auto", display: "block" }} />
    </span>
  ) : (
    <img src="/logo-sigma.png" alt="Anfitrião Sigma" width={size} height={size} style={{ width: size, height: size, borderRadius: radius, display: "block", flex: "none" }} />
  );
