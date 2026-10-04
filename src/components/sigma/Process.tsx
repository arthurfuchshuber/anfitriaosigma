import { Fragment } from "react";
import { css } from "@/lib/css";

import { STEPS } from "@/data/sigma";
export const Process = () => {
  const steps = STEPS;
  return (
<>
<section id="processo" style={css('max-width:1240px;margin:0 auto;padding:60px 32px 120px')}>
<div style={css('text-align:center;max-width:800px;margin:0 auto')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Como funciona</div>
<h2 className="hd" style={css('margin:16px 0 0;font-weight:600;font-size:clamp(34px,4.4vw,62px);line-height:1.04;letter-spacing:-0.045em')}>Da análise à primeira reserva em <span className="gt">7 a 14 dias.</span></h2>
</div>
<div style={css('margin-top:72px;position:relative;display:flex;flex-wrap:wrap;gap:20px')}>
<div style={css('position:absolute;left:6%;right:6%;top:31px;height:1px;background:linear-gradient(90deg,transparent,#431171 20%,#A68CC4 80%,transparent)')}></div>
{steps.map((s, i) => (<Fragment key={i}>
<div className="lift" style={css('position:relative;flex:1 1 240px;min-width:0;background:rgba(255,255,255,.85);backdrop-filter:blur(8px);border:1px solid #E7E2EE;border-radius:28px;padding:30px')}>
<div className="hd" style={css('width:62px;height:62px;border-radius:50%;background:#fff;border:1px solid #D2C5E3;box-shadow:0 0 0 8px #fff,0 10px 30px -10px rgba(67,17,113,.4);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:18px;color:#431171;position:relative')}>{s.n}</div>
<div className="hd" style={css('margin-top:26px;font-weight:600;font-size:21px;line-height:1.2;letter-spacing:-0.03em')}>{s.t}</div>
<div style={css('margin-top:10px;color:#5F5870;font-size:15.5px')}>{s.d}</div>
</div>
</Fragment>))}
</div>
</section>
</>
  );
};
