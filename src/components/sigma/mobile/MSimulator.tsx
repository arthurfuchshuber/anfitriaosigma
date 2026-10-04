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
<section id="simulador" style={css('position:relative;overflow:hidden;color:#fff;background:linear-gradient(180deg,#FFFFFF 0.0%,#FFFFFF 1.2%,#FCFCFD 2.3%,#F6F4F9 3.5%,#EDE8F3 4.7%,#DED6E9 5.8%,#CCC0DD 7.0%,#B7A5CF 8.2%,#9F87BF 9.3%,#8668AE 10.5%,#6D499D 11.7%,#573A7D 12.8%,#422C60 14.0%,#312048 15.2%,#241635 16.3%,#1A1028 17.5%,#150C20 18.7%,#120A1D 19.8%,#120A1C 21.0%,#120A1C 79.0%,#120A1C 79.0%,#120A1D 80.2%,#150C20 81.3%,#1A1028 82.5%,#241635 83.7%,#312048 84.8%,#422C60 86.0%,#573A7D 87.2%,#6D499D 88.3%,#8668AE 89.5%,#9F87BF 90.7%,#B7A5CF 91.8%,#CCC0DD 93.0%,#DED6E9 94.2%,#EDE8F3 95.3%,#F6F4F9 96.5%,#FCFCFD 97.7%,#FFFFFF 98.8%,#FFFFFF 100.0%)')}>
<div style={css('position:absolute;border-radius:50%;filter:blur(30px);animation:sgAurora 20s ease-in-out infinite;left:-120px;top:34%;width:420px;height:420px;background:radial-gradient(circle,rgba(101,56,160,.5),transparent 68%)')}></div>
<div style={css('position:relative;padding:310px 20px 330px')}>
<div style={css('font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#C2B1D6;')}>Simulador de receita</div><h2 className="hd" style={css('margin: 14px 0 0; font-weight: 600; font-size: 26px; line-height: 1.08; letter-spacing: -0.045em')}>Quanto seu imóvel pode <span className="gtl">render por temporada?</span></h2><p style={css('margin:16px 0 0;font-size:16.5px;line-height:1.6;color:#C2B1D6')}>Arraste até o valor que você recebe (ou receberia) por mês no aluguel tradicional.</p>
<div style={css('margin-top:34px')}><label htmlFor="rng" style={css('display:block;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#C2B1D6')}>Aluguel mensal atual</label>
<div className="hd" style={css('margin-top: 6px; font-weight: 600; font-size: 40px; letter-spacing: -0.05em; line-height: 1.1')}>{rentFmt}</div>
<input id="rng" type="range" min="1000" max="15000" step="100" value={rent} onChange={onRent} style={css('width:100%;margin-top:18px;accent-color:#fff;height:6px')} />
<div style={css('display:flex;justify-content:space-between;font-size:12px;color:#C2B1D6;font-weight:500;margin-top:8px')}><span>R$ 1.000</span><span>R$ 15.000</span></div></div>
<div style={css('margin-top:34px;background:rgba(255,255,255,.06);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.12);border-radius:26px;padding:26px 22px')}>
<div style={css('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#C2B1D6')}>Potencial por temporada</div>
<div className="hd" style={css('margin-top: 10px; font-weight: 600; font-size: 40px; letter-spacing: -0.05em; line-height: 1')}>{projFmt}<span style={css('font-size:15px;font-weight:500;color:#C2B1D6;letter-spacing:0')}> / mês</span></div>
<div style={css('margin-top:26px;display:flex;flex-direction:column;gap:20px')}>
<div><div style={css('display:flex;justify-content:space-between;font-size:13.5px;color:#C2B1D6;font-weight:500')}><span>Aluguel tradicional</span><span>{rentFmt}</span></div><div style={css('margin-top:8px;height:7px;border-radius:8px;background:rgba(255,255,255,.12)')}><div style={css(`height:7px;border-radius:8px;background:#8F7FA6;width:${wTrad}%;transition:width .4s`)}></div></div></div>
<div><div style={css('display:flex;justify-content:space-between;font-size:13.5px;color:#fff;font-weight:600')}><span>Temporada Sigma</span><span>{projFmt}</span></div><div style={css('margin-top:8px;height:7px;border-radius:8px;background:rgba(255,255,255,.12)')}><div style={css('height:7px;border-radius:8px;background:linear-gradient(90deg,#A68CC4,#fff);width:100%')}></div></div></div></div>
<div style={css('margin-top:26px;display:flex;justify-content:space-between;align-items:baseline;gap:10px')}><span style={css('font-size: 13.5px; color: #C2B1D6')}>Diferença mensal estimada</span><span className="hd" style={css('font-weight: 600; font-size: 26px; letter-spacing: -0.045em')}>+{diffFmt}</span></div>
<div style={css('margin-top:24px')}><a className="btn" href="#cta" style={css('display:flex;align-items:center;justify-content:center;background:#fff;color:#120A1C;font-weight:600;font-size:16.5px;height:54px;border-radius:16px')}>Falar com especialista</a></div></div>
<p style={css('margin:18px 4px 0;font-size:12px;line-height:1.5;color:#D9CCE8')}>Estimativa baseada em multiplicador médio de 2,5x observado em imóveis geridos. <br /><br />Resultados variam por localização, tipo e estratégia.</p>
</div></section>
</>
  );
};
