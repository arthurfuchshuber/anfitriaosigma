import { Fragment } from "react";
import { css } from "@/lib/css";

import { OWNER_REVIEWS, initials, starString } from "@/data/reviews";
export const MOwnerReviews = () => {
  const owners = OWNER_REVIEWS.map((r) => ({ ...r, ini: initials(r.name), stars: starString(r.stars) }));
  const ownerCount = owners.length;
  if (!ownerCount) return null;
  return (
<>
<section id="avaliacoes" style={css('padding:80px 20px 24px')}><h2 className="hd" style={css('margin: 0; font-weight: 600; font-size: 22px; line-height: 1.08; letter-spacing: -0.045em')}>Quem confia seu imóvel à Sigma<span className="gt">.</span></h2><div style={css('margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:12px')}><div style={css('font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171;')}>Avaliações · Proprietários</div><div style={css('flex:none;border:1px solid #E7E2EE;border-radius:16px;padding:8px 14px;display:flex;align-items:center;gap:10px')}><span className="hd" style={css('font-weight:600;font-size:26px;letter-spacing:-0.05em;line-height:1')}>{ownerCount}</span><span style={css('font-size:11px;color:#5F5870;font-weight:500;line-height:1.25')}>avaliações</span></div></div><div style={css('margin-top:24px;display:flex;flex-direction:column;gap:14px')}>{owners.map((r, i) => (<Fragment key={i}><figure style={css('margin:0;background:#fff;border:1px solid #E7E2EE;border-radius:24px;padding:24px')}><div style={css('color:#431171;letter-spacing:3px;font-size:13px')}>{r.stars}</div><blockquote style={css('margin:12px 0 0;font-size:16px;line-height:1.6')}>“{r.text}”</blockquote><figcaption style={css('margin-top:18px;padding-top:16px;border-top:1px solid #ECE7F2;display:flex;align-items:center;gap:12px')}><span className="hd" style={css('width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,#5A2394,#2A0A47);color:#fff;font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;flex:none')}>{r.ini}</span><span><b style={css('display:block;font-size:15px')}>{r.name}</b><span style={css('font-size:13px;color:#5F5870')}>{r.where}</span></span></figcaption></figure></Fragment>))}</div></section>
</>
  );
};
