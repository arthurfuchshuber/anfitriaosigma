import { Fragment } from "react";
import { css } from "@/lib/css";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq";
export const MFaq = () => {
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = FAQ_ITEMS.map((f, i) => {
    const open = openIdx === i;
    return { q: f.q, a: f.a, open, sign: open ? "–" : "+", btnBg: open ? "#431171" : "transparent", btnFg: open ? "#fff" : "#431171", toggle: () => setOpenIdx(open ? -1 : i) };
  });
  return (
<>
<section id="faq" style={css('padding:72px 20px 80px')}><div style={css('font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171;')}>Perguntas frequentes</div><h2 className="hd" style={css('margin: 14px 0 0; font-weight: 600; font-size: 23px; line-height: 1.08; letter-spacing: -0.045em')}>Tudo que você precisa <span className="gt">saber.</span></h2><div style={css('margin-top:24px;border-top:1px solid #E7E2EE')}>
{faqs.map((f, i) => (<Fragment key={i}>
<div style={css('border-bottom:1px solid #E7E2EE')}>
<button onClick={f.toggle} aria-expanded={f.open} className="hd" style={css('width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;background:transparent;border:0;cursor:pointer;text-align:left;font-weight:500;font-size:16.5px;line-height:1.3;letter-spacing:-0.02em;color:#120A1C')}>
<span>{f.q}</span>
<span style={css(`flex:none;width:32px;height:32px;border-radius:50%;border:1px solid #431171;background:${f.btnBg};color:${f.btnFg};display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:400;transition:background .3s,color .3s`)}>{f.sign}</span>
</button>
{f.open && (<><div style={css('padding:0 6px 22px 0;color:#5F5870;font-size:15.5px')}>{f.a}</div></>)}
</div>
</Fragment>))}
</div></section>
</>
  );
};
