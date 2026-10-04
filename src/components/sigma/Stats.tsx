import { Fragment } from "react";
import { css } from "@/lib/css";

import { STATS } from "@/data/sigma";
import { useCountUp } from "@/hooks/use-count-up";
export const Stats = () => {
  const [ref, t] = useCountUp<HTMLElement>(2000);
  const stats = STATS.map((s) => ({
    v: s.decimals ? (s.value * t).toFixed(s.decimals).replace(".", ",") : String(Math.round(s.value * t)),
    u: s.unit,
    l: s.label,
  }));
  return (
<>
<section ref={ref} style={css('max-width:1240px;margin:0 auto;padding:60px 32px 20px')}>
<div style={css('display:flex;flex-wrap:nowrap;gap:1px;border:1px solid #E7E2EE;border-radius:32px;background:#ECE7F2;overflow:hidden')}>
{stats.map((s, i) => (<Fragment key={i}>
<div style={css('flex:1 1 0;min-width:0;padding:44px 28px;background:#FCFBFD')}>
<div className="hd gt" style={css('font-weight:600;font-size:clamp(38px,4.4vw,66px);line-height:1;letter-spacing:-0.05em;white-space:nowrap')}>{s.v}{s.u}</div>
<div style={css('margin-top:12px;font-size:16px;font-weight:500;color:#5F5870')}>{s.l}</div>
</div>
</Fragment>))}
</div>
</section>
</>
  );
};
