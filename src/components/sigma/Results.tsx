import { Fragment } from "react";
import { css } from "@/lib/css";

import { CASES } from "@/data/sigma";
export const Results = () => {
  const cases = CASES;
  return (
<>
<section id="resultados" style={css('max-width:1240px;margin:0 auto;padding:0 32px 130px')}>
<div style={css('max-width:800px')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Resultados reais</div>
<h2 className="hd" style={css('margin: 16px 0 0; font-weight: 600; font-size: clamp(34px,4.4vw,62px); line-height: 1.04; letter-spacing: -0.045em; width: 1175px')}>Antes e depois da <span className="gt">gestão Sigma.</span></h2>
</div>
<div style={css('margin-top:52px;display:flex;flex-wrap:wrap;gap:20px')}>
{cases.map((c, i) => (<Fragment key={i}>
<div className="lift" style={css('flex:1 1 320px;min-width:0;background:#fff;border:1px solid #E7E2EE;border-radius:30px;padding:34px;position:relative;overflow:hidden')}>
<div style={css('font-size:14px;font-weight:500;color:#5F5870')}>{c.local}</div>
<div className="hd gt" style={css('margin-top:18px;font-weight:600;font-size:60px;line-height:1;letter-spacing:-0.05em')}>{c.lift}</div>
<svg width="100%" height="54" viewBox="0 0 300 54" preserveAspectRatio="none" fill="none" style={css('margin-top:20px;display:block')}><path d={c.path} stroke="#431171" strokeWidth="2.5" strokeLinecap="round" pathLength="1" style={css('stroke-dasharray:1;animation:sgDraw 2s .4s both;vector-effect:non-scaling-stroke')}></path></svg>
<div style={css('margin-top:22px;padding-top:20px;border-top:1px solid #ECE7F2;display:flex;justify-content:space-between;align-items:flex-end')}>
<div><div style={css('font-size:12px;color:#8C849C;font-weight:600')}>Antes</div><div className="hd" style={css('font-weight:500;font-size:19px;color:#8C849C;text-decoration:line-through;letter-spacing:-0.02em')}>{c.before}</div></div>
<div style={css('text-align:right')}><div style={css('font-size:12px;color:#8C849C;font-weight:600')}>Depois</div><div className="hd" style={css('font-weight:600;font-size:28px;letter-spacing:-0.04em')}>{c.after}</div></div>
</div>
</div>
</Fragment>))}
</div>
</section>
</>
  );
};
