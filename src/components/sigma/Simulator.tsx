import { css } from "@/lib/css";

import { useState } from "react";
import { SIM_MULTIPLIER } from "@/data/sigma";
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const Simulator = () => {
  const [rent, setRent] = useState(3500);
  const proj = Math.round(rent * SIM_MULTIPLIER);
  const rentFmt = brl(rent);
  const projFmt = brl(proj);
  const diffFmt = brl(proj - rent);
  const wTrad = Math.round((rent / (proj || 1)) * 100);
  const onRent = (e: React.ChangeEvent<HTMLInputElement>) => setRent(Number(e.target.value));
  return (
<>
<section id="simulador" style={css('position:relative;overflow:hidden;color:#2b0a25;background:linear-gradient(180deg,#ffffff 0.0%,#ffffff 1.8%,#ffffff 3.6%,#fffeff 5.5%,#fffcfe 7.3%,#fef9fd 9.1%,#fef6fd 10.9%,#fdf2fb 12.7%,#fcedf9 14.5%,#fbe8f7 16.4%,#fbe2f6 18.2%,#fadcf4 20.0%,#f9d6f3 21.8%,#f8d0f1 23.6%,#f7cbef 25.5%,#f6c6ed 27.3%,#f5c1eb 29.1%,#f5beeb 30.9%,#f5bbea 32.7%,#f4bae9 34.5%,#f4b8e6 36.4%,#f4b8e6 38.2%,#f4b8e6 40.0%,#f4b8e6 60.0%,#f4b8e6 60.0%,#f4b8e6 61.8%,#f4b8e6 63.6%,#f4bae9 65.5%,#f5bbea 67.3%,#f5beeb 69.1%,#f5c1eb 70.9%,#f6c6ed 72.7%,#f7cbef 74.5%,#f8d0f1 76.4%,#f9d6f3 78.2%,#fadcf4 80.0%,#fbe2f6 81.8%,#fbe8f7 83.6%,#fcedf9 85.5%,#fdf2fb 87.3%,#fef6fd 89.1%,#fef9fd 90.9%,#fffcfe 92.7%,#fffeff 94.5%,#ffffff 96.4%,#ffffff 98.2%,#ffffff 100.0%)')}>
<div style={css('position:absolute;left:-140px;top:38%;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(160,56,141,.5),transparent 68%);filter:blur(30px);animation:sgAurora 20s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-160px;top:46%;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(196,140,186,.28),transparent 68%);filter:blur(30px);animation:sgAurora 26s ease-in-out infinite reverse')}></div>
<div style={css('position:relative;max-width:1240px;margin:0 auto;padding:clamp(300px,34vw,640px) 24px clamp(320px,36vw,680px);display:flex;flex-wrap:wrap;gap:96px;align-items:center')}>
<div style={css('flex:1 1 420px;min-width:0')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#6b2a5e')}>Simulador de receita</div>
<h2 className="hd" style={css('margin:20px 0 0;font-weight:600;font-size:clamp(34px,4.2vw,58px);line-height:1.06;letter-spacing:-0.045em')}>Quanto seu imóvel pode <span className="gtl">render por temporada?</span></h2>
<p style={css('margin:24px 0 0;color:#6b2a5e;font-size:18px;max-width:440px')}>Arraste até o valor que você recebe (ou receberia) por mês no aluguel tradicional.</p>
<div style={css('margin-top:56px')}>
<label htmlFor="rng" style={css('display:block;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b2a5e')}>Aluguel mensal atual</label>
<div className="hd" style={css('margin-top:8px;font-weight:600;font-size:52px;letter-spacing:-0.05em;line-height:1')}>{rentFmt}</div>
<input id="rng" type="range" min="1000" max="15000" step="100" value={rent} onChange={onRent} style={css('width:100%;margin-top:26px;accent-color:#d700a6;height:6px')} />
<div style={css('display:flex;justify-content:space-between;font-size:12.5px;color:#6b2a5e;font-weight:500;margin-top:10px')}><span>R$ 1.000</span><span>R$ 15.000</span></div>
</div>
</div>
<div style={css('flex:1 1 440px;min-width:0')}>
<div style={css('background:rgba(255,255,255,.6);backdrop-filter:blur(18px);border:1px solid rgba(215,0,166,.22);border-radius:32px;padding:52px')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6b2a5e')}>Potencial por temporada</div>
<div className="hd" style={css('margin-top:14px;font-weight:600;font-size:clamp(48px,5.4vw,76px);letter-spacing:-0.05em;line-height:1')}>{projFmt}<span style={css('font-size:18px;font-weight:500;color:#6b2a5e;letter-spacing:0')}> / mês</span></div>
<div style={css('margin-top:44px;display:flex;flex-direction:column;gap:28px')}>
<div><div style={css('display:flex;justify-content:space-between;font-size:14px;color:#6b2a5e;font-weight:500')}><span>Aluguel tradicional</span><span>{rentFmt}</span></div><div style={css('margin-top:10px;height:8px;border-radius:8px;background:rgba(215,0,166,.18)')}><div style={css(`height:8px;border-radius:8px;background:#9a8b97;width:${wTrad}%;transition:width .4s`)}></div></div></div>
<div><div style={css('display:flex;justify-content:space-between;font-size:14px;color:#2b0a25;font-weight:600')}><span>Temporada Sigma</span><span>{projFmt}</span></div><div style={css('margin-top:10px;height:8px;border-radius:8px;background:rgba(215,0,166,.18)')}><div style={css('height:8px;border-radius:8px;background:linear-gradient(90deg,#d700a6,#a30080);width:100%')}></div></div></div>
</div>
<div style={css('margin-top:44px;display:flex;justify-content:space-between;align-items:baseline;gap:12px')}>
<span style={css('font-size:15px;color:#6b2a5e')}>Diferença mensal estimada</span>
<span className="hd" style={css('font-weight:600;font-size:32px;letter-spacing:-0.045em')}>+ {diffFmt}</span>
</div>
<a className="btn" href="#cta" style={css('margin-top:36px;display:flex;align-items:center;justify-content:center;background:#fff;color:#1c0a19;font-weight:600;font-size:16.5px;padding:18px;border-radius:16px')}>Falar com especialista</a>
</div>
<p style={css('margin:22px 6px 0;font-size:12.5px;line-height:1.5;color:#6b2a5e')}>* Estimativa baseada em multiplicador médio de 2,5x observado em imóveis geridos. Resultados variam por localização, tipo e estratégia.</p>
</div>
</div>
</section>
</>
  );
};
