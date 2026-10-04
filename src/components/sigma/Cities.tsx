import { Fragment } from "react";
import { css } from "@/lib/css";

import { MARQUEE_CITIES } from "@/data/sigma";
export const Cities = () => {
  const marquee = Array.from({ length: 8 }).flatMap(() => MARQUEE_CITIES.map((t) => ({ t })));
  return (
<>
<section style={css('background:#fff;padding:34px 0 30px')}>
<div style={css('max-width:1240px;margin:0 auto;padding:0 32px')}>
<div style={css('text-align:center;font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#8C849C')}>Operando nas regiões de maior demanda do Sul</div>
<div style={css('margin-top:20px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)')}>
<div style={css('display:flex;width:max-content;animation:sgMarquee 38s linear infinite;white-space:nowrap')}>
{marquee.map((m, i) => (<Fragment key={i}>
<span className="hd" style={css('display:inline-flex;align-items:center;gap:40px;padding-right:40px;font-weight:500;font-size:26px;letter-spacing:-0.03em;color:#B5ADC4')}>{m.t}<span style={css('width:6px;height:6px;border-radius:50%;background:#D2C5E3')}></span></span>
</Fragment>))}
</div>
</div>
</div>
</section>
</>
  );
};
