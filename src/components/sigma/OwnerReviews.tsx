import { Fragment } from "react";
import { css } from "@/lib/css";

import { OWNER_REVIEWS, initials, starString } from "@/data/reviews";
export const OwnerReviews = () => {
  const owners = OWNER_REVIEWS.map((r) => ({ ...r, ini: initials(r.name), stars: starString(r.stars) }));
  const ownerCount = owners.length;
  if (!ownerCount) return null;
  return (
<>
<section id="avaliacoes" style={css('max-width:1240px;margin:0 auto;padding:130px 32px 40px')}>
<h2 className="hd" style={css('margin: 16px 0 0; font-weight: 600; font-size: 50px; line-height: 1.04; letter-spacing: -0.045em')}>Quem confia seu imóvel à Sigma<span className="gt">.</span></h2><div style={css('display:flex;flex-wrap:wrap;gap:32px;align-items:flex-end;justify-content:space-between')}>
<div style={css('flex:1 1 560px')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Avaliações · Proprietários</div>

</div>
<div style={css('flex:0 0 auto;border:1px solid #E7E2EE;border-radius:22px;padding:18px 26px;display:flex;align-items:center;gap:16px;background:#fff')}>
<span className="hd" style={css('font-weight:600;font-size:42px;letter-spacing:-0.05em;line-height:1')}>{ownerCount}</span>
<span style={css('font-size:14px;color:#5F5870;font-weight:500;line-height:1.35')}>avaliações de<br />proprietários</span>
</div>
</div>

<div style={css('margin-top:48px;column-count:3;column-gap:20px')}>
{owners.map((r, i) => (<Fragment key={i}>
<figure className="lift" style={css('break-inside:avoid;margin:0 0 20px;background:#fff;border:1px solid #E7E2EE;border-radius:28px;padding:32px;position:relative')}>
<div style={css('color:#431171;letter-spacing:3px;font-size:14px')}>{r.stars}</div>
<blockquote style={css('margin:16px 0 0;font-size:17.5px;line-height:1.65;color:#120A1C')}>“{r.text}”</blockquote>
<figcaption style={css('margin-top:24px;padding-top:20px;border-top:1px solid #ECE7F2;display:flex;align-items:center;gap:12px')}>
<span className="hd" style={css('width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#5A2394,#2A0A47);color:#fff;font-weight:600;font-size:14px;display:flex;align-items:center;justify-content:center')}>{r.ini}</span>
<span><b style={css('display:block;font-size:15.5px')}>{r.name}</b><span style={css('font-size:13.5px;color:#5F5870')}>{r.where}</span></span>
</figcaption>
</figure>
</Fragment>))}
</div>

</section>
</>
  );
};
