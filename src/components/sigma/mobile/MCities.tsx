import { Fragment } from "react";
import { css } from "@/lib/css";

import { MARQUEE_CITIES } from "@/data/sigma";
export const MCities = () => {
  const marquee = Array.from({ length: 8 }).flatMap(() => MARQUEE_CITIES.map((t) => ({ t })));
  return (
<>
<section style={css('background:#fff;padding:26px 0 24px')}><div style={css('text-align:center;padding:0 20px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#8C849C')}>OPERANDO EM TODA A REGIÃO SUL!</div>
<div style={css('margin-top:16px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)')}><div style={css('display:flex;width:max-content;animation:sgMarquee 30s linear infinite;white-space:nowrap')}>
{marquee.map((m, i) => (<Fragment key={i}><span className="hd" style={css('display:inline-flex;align-items:center;gap:28px;padding-right:28px;font-weight:500;font-size:21px;letter-spacing:-0.03em;color:#B5ADC4')}>{m.t}<span style={css('width:5px;height:5px;border-radius:50%;background:#D2C5E3')}></span></span></Fragment>))}
</div></div></section>
</>
  );
};
