import { SigmaLogo } from "@/components/sigma/SigmaLogo";
import { css } from "@/lib/css";

export const Footer = () => {
  return (
<>
<footer style={css('background:#120A1C;color:#C2B1D6;padding:0 32px 56px;position:relative')}>
<div style={css('max-width:1240px;margin:0 auto;padding-top:56px;border-top:1px solid rgba(255,255,255,.12);display:flex;flex-wrap:wrap;gap:40px;justify-content:space-between')}>
<div style={css('flex:1 1 320px;max-width:400px')}>
<div style={css('display:flex;align-items:center;gap:12px')}><SigmaLogo size={38} /><span className="hd" style={css('font-weight:600;font-size:18px;color:#fff;letter-spacing:-0.02em')}>Anfitrião Sigma</span></div>
<p style={css('margin:18px 0 0;font-size:15px')}>Gestão completa e mentoria premium para anfitriões que querem transformar imóveis em ativos de alta renda.</p>
</div>
<div style={css('flex:1 1 200px;font-size:15px;line-height:2')}><b style={css('color:#fff')}>Contato</b><br />WhatsApp (47) 99675-9381<br />sigma@anfitriaosigma.com.br</div>
<div style={css('flex:1 1 200px;font-size:15px;line-height:2')}><b style={css('color:#fff')}>Cidades</b><br />Foz do Iguaçu · Gramado<br />Balneário Camboriú · Curitiba</div>
</div>
<div style={css('max-width:1240px;margin:36px auto 0;font-size:12.5px;color:#8F7FA6')}>FUCHSHUBER THIS GESTÃO E TECNOLOGIA LTDA · CNPJ 57.851.613/0001-50</div>
</footer>
</>
  );
};
