/** Logomarca oficial (σ sobre degradê). Fonte única: /public/logo-sigma.png */
export const SigmaLogo = ({ size = 36, radius = 10 }: { size?: number; radius?: number }) => (
  <img
    src="/logo-sigma.png"
    alt="Anfitrião Sigma"
    width={size}
    height={size}
    style={{ width: size, height: size, borderRadius: radius, display: "block", flex: "none" }}
  />
);
