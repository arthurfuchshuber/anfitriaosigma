import { SigmaLogo } from "@/components/sigma/SigmaLogo";
import { css } from "@/lib/css";

export const MFooter = () => {
  return (
<>
<footer style={css('background:#120A1C;color:#C2B1D6;padding:0 20px 44px')}><div style={css('padding-top:36px;border-top:1px solid rgba(255,255,255,.12)')}>
<div style={css('display:flex;align-items:center;gap:11px')}><SigmaLogo size={36} /><span className="hd" style={css('font-weight:600;font-size:17px;color:#fff;letter-spacing:-0.02em')}>Anfitrião Sigma</span></div>
<p style={css('margin:16px 0 0;font-size:14.5px')}>Gestão completa e mentoria premium para anfitriões que querem transformar imóveis em ativos de alta renda.</p>
<div style={css('margin-top:24px;font-size:14.5px;line-height:1.95')}><b style={css('color:#fff')}>Contato</b><br />WhatsApp (47) 99675-9381<br />sigma@anfitriaosigma.com.br</div>
<div style={css('margin-top:20px;font-size:14.5px;line-height:1.95')}><b style={css('color:#fff')}>Cidades</b><br />Foz do Iguaçu · Gramado<br />Balneário Camboriú · Curitiba</div>
<div style={css('margin-top:28px;font-size:11.5px;color:#8F7FA6')}>FUCHSHUBER THIS GESTÃO E TECNOLOGIA LTDA · CNPJ 57.851.613/0001-50</div></div></footer>
</>
  );
};
