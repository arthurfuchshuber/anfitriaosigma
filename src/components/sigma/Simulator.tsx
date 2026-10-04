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
<section id="simulador" style={css('position:relative;overflow:hidden;color:#fff;background:linear-gradient(180deg,#FFFFFF 0.0%,#FFFFFF 1.8%,#FDFDFE 3.6%,#FAF9FC 5.5%,#F4F1F8 7.3%,#EBE7F2 9.1%,#E0D8EA 10.9%,#D2C6E1 12.7%,#C1B2D5 14.5%,#AE9AC9 16.4%,#9B82BC 18.2%,#8668AE 20.0%,#724FA0 21.8%,#5F3F88 23.6%,#4D336F 25.5%,#3D2859 27.3%,#301F46 29.1%,#251736 30.9%,#1C112B 32.7%,#170D23 34.5%,#140B1E 36.4%,#120A1C 38.2%,#120A1C 40.0%,#120A1C 60.0%,#120A1C 60.0%,#120A1C 61.8%,#140B1E 63.6%,#170D23 65.5%,#1C112B 67.3%,#251736 69.1%,#301F46 70.9%,#3D2859 72.7%,#4D336F 74.5%,#5F3F88 76.4%,#724FA0 78.2%,#8668AE 80.0%,#9B82BC 81.8%,#AE9AC9 83.6%,#C1B2D5 85.5%,#D2C6E1 87.3%,#E0D8EA 89.1%,#EBE7F2 90.9%,#F4F1F8 92.7%,#FAF9FC 94.5%,#FDFDFE 96.4%,#FFFFFF 98.2%,#FFFFFF 100.0%)')}>
<div style={css('position:absolute;left:-140px;top:38%;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.5),transparent 68%);filter:blur(30px);animation:sgAurora 20s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-160px;top:46%;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(166,140,196,.28),transparent 68%);filter:blur(30px);animation:sgAurora 26s ease-in-out infinite reverse')}></div>
<div style={css('position:relative;max-width:1240px;margin:0 auto;padding:clamp(300px,34vw,640px) 24px clamp(320px,36vw,680px);display:flex;flex-wrap:wrap;gap:96px;align-items:center')}>
<div style={css('flex:1 1 420px;min-width:0')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#C2B1D6')}>Simulador de receita</div>
<h2 className="hd" style={css('margin:20px 0 0;font-weight:600;font-size:clamp(34px,4.2vw,58px);line-height:1.06;letter-spacing:-0.045em')}>Quanto seu imóvel pode <span className="gtl">render por temporada?</span></h2>
<p style={css('margin:24px 0 0;color:#C2B1D6;font-size:18px;max-width:440px')}>Arraste até o valor que você recebe (ou receberia) por mês no aluguel tradicional.</p>
<div style={css('margin-top:56px')}>
<label htmlFor="rng" style={css('display:block;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#C2B1D6')}>Aluguel mensal atual</label>
<div className="hd" style={css('margin-top:8px;font-weight:600;font-size:52px;letter-spacing:-0.05em;line-height:1')}>{rentFmt}</div>
<input id="rng" type="range" min="1000" max="15000" step="100" value={rent} onChange={onRent} style={css('width:100%;margin-top:26px;accent-color:#fff;height:6px')} />
<div style={css('display:flex;justify-content:space-between;font-size:12.5px;color:#C2B1D6;font-weight:500;margin-top:10px')}><span>R$ 1.000</span><span>R$ 15.000</span></div>
</div>
</div>
<div style={css('flex:1 1 440px;min-width:0')}>
<div style={css('background:rgba(255,255,255,.06);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.12);border-radius:32px;padding:52px')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#C2B1D6')}>Potencial por temporada</div>
<div className="hd" style={css('margin-top:14px;font-weight:600;font-size:clamp(48px,5.4vw,76px);letter-spacing:-0.05em;line-height:1')}>{projFmt}<span style={css('font-size:18px;font-weight:500;color:#C2B1D6;letter-spacing:0')}> / mês</span></div>
<div style={css('margin-top:44px;display:flex;flex-direction:column;gap:28px')}>
<div><div style={css('display:flex;justify-content:space-between;font-size:14px;color:#C2B1D6;font-weight:500')}><span>Aluguel tradicional</span><span>{rentFmt}</span></div><div style={css('margin-top:10px;height:8px;border-radius:8px;background:rgba(255,255,255,.12)')}><div style={css(`height:8px;border-radius:8px;background:#8F7FA6;width:${wTrad}%;transition:width .4s`)}></div></div></div>
<div><div style={css('display:flex;justify-content:space-between;font-size:14px;color:#fff;font-weight:600')}><span>Temporada Sigma</span><span>{projFmt}</span></div><div style={css('margin-top:10px;height:8px;border-radius:8px;background:rgba(255,255,255,.12)')}><div style={css('height:8px;border-radius:8px;background:linear-gradient(90deg,#A68CC4,#fff);width:100%')}></div></div></div>
</div>
<div style={css('margin-top:44px;display:flex;justify-content:space-between;align-items:baseline;gap:12px')}>
<span style={css('font-size:15px;color:#C2B1D6')}>Diferença mensal estimada</span>
<span className="hd" style={css('font-weight:600;font-size:32px;letter-spacing:-0.045em')}>+ {diffFmt}</span>
</div>
<a className="btn" href="#cta" style={css('margin-top:36px;display:flex;align-items:center;justify-content:center;background:#fff;color:#120A1C;font-weight:600;font-size:16.5px;padding:18px;border-radius:16px')}>Falar com especialista</a>
</div>
<p style={css('margin:22px 6px 0;font-size:12.5px;line-height:1.5;color:#D9CCE8')}>* Estimativa baseada em multiplicador médio de 2,5x observado em imóveis geridos. Resultados variam por localização, tipo e estratégia.</p>
</div>
</div>
</section>
</>
  );
};
