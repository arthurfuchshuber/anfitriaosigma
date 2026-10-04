import { css } from "@/lib/css";

import { useCountUp } from "@/hooks/use-count-up";
export const MStats = () => {
  const [ref, t] = useCountUp<HTMLElement>(2000);
  const n = (v: number, dec = 0) => (dec ? (v * t).toFixed(dec).replace(".", ",") : String(Math.round(v * t)));
  return (
<>
<section ref={ref} style={css('padding:36px 20px 8px')}><div style={css('display:grid;grid-template-columns:1fr 1fr;gap:1px;border:1px solid #E7E2EE;border-radius:24px;background:#ECE7F2;overflow:hidden')}><div style={css('padding:26px 18px;background:#FCFBFD')}><div className="hd gt" style={css('font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.05em; white-space: nowrap')}>{n(150)}%</div><div style={css('margin-top: 8px; font-size: 13px; font-weight: 500; color: #5F5870; line-height: 1.35')}>Aumento de receita</div></div><div style={css('padding:26px 18px;background:#FCFBFD')}><div className="hd gt" style={css('font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.05em; white-space: nowrap')}>{n(100)}+</div><div style={css('margin-top:8px;font-size:13.5px;font-weight:500;color:#5F5870;line-height:1.35')}>Imóveis sob gestão</div></div><div style={css('padding:26px 18px;background:#FCFBFD')}><div className="hd gt" style={css('font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.05em; white-space: nowrap')}>{n(92)}%</div><div style={css('margin-top: 8px; font-size: 13px; font-weight: 500; color: #5F5870; line-height: 1.35')}>Taxa de ocupação</div></div><div style={css('padding:26px 18px;background:#FCFBFD')}><div className="hd gt" style={css('font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.05em; white-space: nowrap')}>{n(4.9, 1)}★</div><div style={css('margin-top: 8px; font-size: 13px; font-weight: 500; color: #5F5870; line-height: 1.35')}>Avaliação média</div></div></div></section>
</>
  );
};
