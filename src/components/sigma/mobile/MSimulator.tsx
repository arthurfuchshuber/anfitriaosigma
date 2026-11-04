import { css } from "@/lib/css";

import { useState } from "react";
import { SIM_MULTIPLIER } from "@/data/sigma";
import { brl } from "@/lib/format";
export const MSimulator = () => {
  const [rent, setRent] = useState(3500);
  const proj = Math.round(rent * SIM_MULTIPLIER);
  const rentFmt = brl(rent);
  const projFmt = brl(proj);
  const diffFmt = brl(proj - rent);
  const wTrad = Math.round((rent / (proj || 1)) * 100);
  const onRent = (e: React.ChangeEvent<HTMLInputElement>) => setRent(Number(e.target.value));
  return (
<>
<section id="simulador" style={css('position:relative;overflow:hidden;color:#2b0a25;background:linear-gradient(180deg,#ffffff 0.0%,#ffffff 1.2%,#fffeff 2.3%,#fffcfe 3.5%,#fefafd 4.7%,#fef6fd 5.8%,#fdf0fb 7.0%,#fceaf9 8.2%,#fbe3f7 9.3%,#fadcf4 10.5%,#f8d5f2 11.7%,#f7ceef 12.8%,#f6c7ed 14.0%,#f6c2ec 15.2%,#f5beeb 16.3%,#f4bbea 17.5%,#f4b9e9 18.7%,#f4b8e6 19.8%,#f4b8e6 21.0%,#f4b8e6 79.0%,#f4b8e6 79.0%,#f4b8e6 80.2%,#f4b9e9 81.3%,#f4bbea 82.5%,#f5beeb 83.7%,#f6c2ec 84.8%,#f6c7ed 86.0%,#f7ceef 87.2%,#f8d5f2 88.3%,#fadcf4 89.5%,#fbe3f7 90.7%,#fceaf9 91.8%,#fdf0fb 93.0%,#fef6fd 94.2%,#fefafd 95.3%,#fffcfe 96.5%,#fffeff 97.7%,#ffffff 98.8%,#ffffff 100.0%)')}>
<div style={css('position:absolute;border-radius:50%;filter:blur(30px);animation:sgAurora 20s ease-in-out infinite;left:-120px;top:34%;width:420px;height:420px;background:radial-gradient(circle,rgba(160,56,141,.5),transparent 68%)')}></div>
<div style={css('position:relative;padding:310px 20px 330px')}>
<div style={css('font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#6b2a5e;')}>Simulador de receita</div><h2 className="hd" style={css('margin: 14px 0 0; font-weight: 600; font-size: 26px; line-height: 1.08; letter-spacing: -0.045em')}>Quanto seu imóvel pode <span className="gtl">render por temporada?</span></h2><p style={css('margin:16px 0 0;font-size:16.5px;line-height:1.6;color:#6b2a5e')}>Arraste até o valor que você recebe (ou receberia) por mês no aluguel tradicional.</p>
<div style={css('margin-top:34px')}><label htmlFor="rng" style={css('display:block;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b2a5e')}>Aluguel mensal atual</label>
<div className="hd" style={css('margin-top: 6px; font-weight: 600; font-size: 40px; letter-spacing: -0.05em; line-height: 1.1')}>{rentFmt}</div>
<input id="rng" type="range" min="1000" max="15000" step="100" value={rent} onChange={onRent} style={css('width:100%;margin-top:18px;accent-color:#d700a6;height:6px')} />
<div style={css('display:flex;justify-content:space-between;font-size:12px;color:#6b2a5e;font-weight:500;margin-top:8px')}><span>R$ 1.000</span><span>R$ 15.000</span></div></div>
<div style={css('margin-top:34px;background:rgba(255,255,255,.6);backdrop-filter:blur(18px);border:1px solid rgba(215,0,166,.22);border-radius:26px;padding:26px 22px')}>
<div style={css('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6b2a5e')}>Potencial por temporada</div>
<div className="hd" style={css('margin-top: 10px; font-weight: 600; font-size: 40px; letter-spacing: -0.05em; line-height: 1')}>{projFmt}<span style={css('font-size:15px;font-weight:500;color:#6b2a5e;letter-spacing:0')}> / mês</span></div>
<div style={css('margin-top:26px;display:flex;flex-direction:column;gap:20px')}>
<div><div style={css('display:flex;justify-content:space-between;font-size:13.5px;color:#6b2a5e;font-weight:500')}><span>Aluguel tradicional</span><span>{rentFmt}</span></div><div style={css('margin-top:8px;height:7px;border-radius:8px;background:rgba(215,0,166,.18)')}><div style={css(`height:7px;border-radius:8px;background:#9a8b97;width:${wTrad}%;transition:width .4s`)}></div></div></div>
<div><div style={css('display:flex;justify-content:space-between;font-size:13.5px;color:#2b0a25;font-weight:600')}><span>Temporada Sigma</span><span>{projFmt}</span></div><div style={css('margin-top:8px;height:7px;border-radius:8px;background:rgba(215,0,166,.18)')}><div style={css('height:7px;border-radius:8px;background:linear-gradient(90deg,#d700a6,#a30080);width:100%')}></div></div></div></div>
<div style={css('margin-top:26px;display:flex;justify-content:space-between;align-items:baseline;gap:10px')}><span style={css('font-size: 13.5px; color: #6b2a5e')}>Diferença mensal estimada</span><span className="hd" style={css('font-weight: 600; font-size: 26px; letter-spacing: -0.045em')}>+{diffFmt}</span></div>
<div style={css('margin-top:24px')}><a className="btn" href="#cta" style={css('display:flex;align-items:center;justify-content:center;background:#fff;color:#1c0a19;font-weight:600;font-size:16.5px;height:54px;border-radius:16px')}>Falar com especialista</a></div></div>
<p style={css('margin:18px 4px 0;font-size:12px;line-height:1.5;color:#6b2a5e')}>Estimativa baseada em multiplicador médio de 2,5x observado em imóveis geridos. <br /><br />Resultados variam por localização, tipo e estratégia.</p>
</div></section>
</>
  );
};
