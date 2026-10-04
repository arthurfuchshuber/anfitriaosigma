import { Fragment } from "react";
import { css } from "@/lib/css";

import { GUEST_REVIEWS, starString } from "@/data/reviews";
export const GuestReviews = () => {
  const guests = GUEST_REVIEWS.map((r) => ({ ...r, stars: starString(r.stars) }));
  if (!guests.length) return null;
  return (
<>
<section style={css('position:relative;overflow:hidden;background:linear-gradient(180deg,#fff 0%,#F6F2FA 14%,#F1ECF7 100%);margin-top:90px')}>

<div style={css('position:absolute;left:0;right:0;bottom:0;height:420px;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 45%,#000 75%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 45%,#000 75%,transparent 100%)')}>
<svg width="100%" height="100%" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
<path d="M0 300 L0 170 C 120 130, 200 90, 320 120 S 520 50, 640 92 S 860 30, 980 80 S 1240 50, 1440 110 L1440 300 Z" fill="#E7DEF1"></path>
<path d="M0 300 L0 215 C 160 175, 300 155, 460 190 S 760 140, 920 180 S 1250 160, 1440 200 L1440 300 Z" fill="#DDD0EC"></path>
<path d="M0 300 L0 262 C 200 232, 380 230, 560 252 S 980 226, 1180 248 S 1380 244, 1440 250 L1440 300 Z" fill="#D2C3E5"></path>
</svg>
</div>
<div style={css('position:relative;max-width:1240px;margin:0 auto;padding:120px 32px 170px')}>
<div style={css('display:flex;flex-wrap:wrap;gap:32px;align-items:flex-end;justify-content:space-between')}>
<div style={css('flex:1 1 560px')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Avaliações · Hóspedes</div>
<h2 className="hd" style={css('margin: 16px 0 0; font-weight: 600; font-size: 50px; line-height: 1.04; letter-spacing: -0.045em')}>A experiência que os hóspedes <span className="gt">avaliam.</span></h2>
</div>
<div style={css('flex:0 0 auto;background:#fff;border:1px solid #E7E2EE;border-radius:22px;padding:18px 26px;display:flex;align-items:center;gap:16px')}>
<span className="hd" style={css('font-weight:600;font-size:42px;letter-spacing:-0.05em;line-height:1')}>4.9<span style={css('color:#FF4700;font-size:26px')}> ★</span></span>
<span style={css('font-size:14px;color:#5F5870;font-weight:500;line-height:1.35')}>avaliação média<br />dos hóspedes</span>
</div>
</div>

<div className="rail" style={css('margin-top:48px;display:flex;gap:20px;overflow-x:auto;padding:6px 6px 24px;scroll-snap-type:x mandatory;scroll-padding:0 6px')}>
{guests.map((g, i) => (<Fragment key={i}>
<figure className="lift" style={css('flex:0 0 360px;scroll-snap-align:start;margin:0;background:#fff;border:1px solid #E7E2EE;border-radius:28px;padding:30px;position:relative;box-sizing:border-box')}>
<div style={css('display:flex;align-items:center;gap:10px')}><span style={css('color:#431171;letter-spacing:3px;font-size:14px')}>{g.stars}</span><span style={css('font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#431171;background:#F2ECF8;padding:4px 10px;border-radius:999px')}>{g.src}</span></div>
<blockquote style={css('margin:16px 0 0;font-size:16.5px;line-height:1.65')}>“{g.text}”</blockquote>
<figcaption style={css('margin-top:20px;font-size:14px;color:#5F5870')}><b style={css('color:#120A1C;font-size:15px')}>{g.name}</b><br />{g.where}</figcaption>
</figure>
</Fragment>))}
</div>

</div>
</section>
</>
  );
};
