import { Fragment } from "react";
import { css } from "@/lib/css";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq";
export const Faq = () => {
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = FAQ_ITEMS.map((f, i) => {
    const open = openIdx === i;
    return { q: f.q, a: f.a, open, sign: open ? "–" : "+", btnBg: open ? "#431171" : "transparent", btnFg: open ? "#fff" : "#431171", toggle: () => setOpenIdx(open ? -1 : i) };
  });
  return (
<>
<section id="faq" style={css('max-width:1240px;margin:0 auto;padding:130px 32px;display:flex;flex-wrap:wrap;gap:56px')}>
<div style={css('flex:1 1 320px;min-width:0')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Perguntas frequentes</div>
<h2 className="hd" style={css('margin:16px 0 0;font-weight:600;font-size:clamp(32px,3.8vw,52px);line-height:1.06;letter-spacing:-0.045em')}>Tudo que você precisa <span className="gt">saber.</span></h2>
</div>
<div style={css('flex:2 1 560px;min-width:0;border-top:1px solid #120A1C')}>
{faqs.map((f, i) => (<Fragment key={i}>
<div style={css('border-bottom:1px solid #E7E2EE')}>
<button onClick={f.toggle} aria-expanded={f.open} className="hd" style={css('width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 0;background:transparent;border:0;cursor:pointer;text-align:left;font-weight:500;font-size:19px;letter-spacing:-0.025em;color:#120A1C')}>
<span>{f.q}</span>
<span style={css(`flex:none;width:34px;height:34px;border-radius:50%;border:1px solid #431171;background:${f.btnBg};color:${f.btnFg};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:400;transition:background .3s,color .3s`)}>{f.sign}</span>
</button>
{f.open && (<>
<div style={css('padding:0 60px 28px 0;color:#5F5870;font-size:17px')}>{f.a}</div>
</>)}
</div>
</Fragment>))}
</div>
</section>
</>
  );
};
