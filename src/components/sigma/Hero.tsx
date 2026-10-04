import { css } from "@/lib/css";

import { useState } from "react";
export const Hero = () => {
  const [pos, setPos] = useState({ x: 50, y: 22 });
  const spot = `radial-gradient(520px circle at ${pos.x}% ${pos.y}%, rgba(101,56,160,.14), transparent 60%)`;
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.round(((e.clientX - r.left) / r.width) * 100),
      y: Math.round(((e.clientY - r.top) / Math.min(r.height, 900)) * 100),
    });
  };
  return (
<>
<section id="top" onMouseMove={onMove} style={css('position:relative;overflow:hidden;padding:clamp(120px,12vw,150px) 24px 0')}>
<div style={css('position:absolute;inset:0;background-image:linear-gradient(rgba(67,17,113,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(67,17,113,.07) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 30%,#000 10%,transparent 78%);mask-image:radial-gradient(ellipse 60% 55% at 50% 30%,#000 10%,transparent 78%)')}></div>
<div style={css(`position:absolute;inset:0;background:${spot};pointer-events:none`)}></div>
<div style={css('position:absolute;left:50%;top:-220px;margin-left:-480px;width:960px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.22),transparent 68%);filter:blur(30px);animation:sgAurora 16s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-160px;top:180px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(215,0,166,.10),transparent 68%);filter:blur(40px);animation:sgAurora 22s ease-in-out infinite reverse')}></div>

<div style={css('position:absolute;left:0;right:0;bottom:0;height:440px;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 40%,#000 68%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 40%,#000 68%,transparent 100%)')}>
<svg width="100%" height="100%" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
<defs><pattern id="pH" width="14" height="18" patternUnits="userSpaceOnUse"><rect width="14" height="18" fill="#EFE8F7"></rect><rect x="3" y="4" width="6" height="8" rx="1" fill="#fff" opacity=".85"></rect></pattern></defs>
<g fill="url(#pH)">
<rect x="0" y="170" width="90" height="130"></rect><rect x="90" y="110" width="70" height="190"></rect><rect x="160" y="200" width="110" height="100"></rect><rect x="270" y="70" width="80" height="230"></rect><rect x="350" y="150" width="100" height="150"></rect><rect x="450" y="40" width="60" height="260"></rect><rect x="510" y="180" width="120" height="120"></rect><rect x="630" y="100" width="90" height="200"></rect><rect x="720" y="20" width="70" height="280"></rect><rect x="790" y="160" width="110" height="140"></rect><rect x="900" y="80" width="80" height="220"></rect><rect x="980" y="190" width="100" height="110"></rect><rect x="1080" y="50" width="70" height="250"></rect><rect x="1150" y="130" width="120" height="170"></rect><rect x="1270" y="90" width="80" height="210"></rect><rect x="1350" y="150" width="90" height="150"></rect>
</g>
</svg>
</div>

<div style={css('position:relative;max-width:1240px;margin:0 auto;text-align:center')}>
<div style={css('display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(67,17,113,.14);background:rgba(255,255,255,.75);backdrop-filter:blur(10px);border-radius:999px;padding:7px 18px 7px 12px;font-size:13.5px;font-weight:600;color:#431171;animation:sgFadeUp .8s both')}>
<span style={css('width:8px;height:8px;border-radius:50%;background:#FF4700;animation:sgPulse 2s infinite')}></span>
Gestão de hospedagem de alta performance
</div>
<h1 className="hd" style={css('margin: 30px auto 0; max-width: 1176px; text-align: center; font-weight: 600; font-size: clamp(40px, 6vw, 80px); line-height: 1.02; letter-spacing: -0.045em; animation: sgFadeUp .9s .1s both')}>Seu imóvel gerenciado como <span className="gt">um ativo de alta receita.</span></h1>
<p style={css('margin:30px auto 0;max-width:640px;font-size:20px;line-height:1.65;color:#5F5870;animation:sgFadeUp .9s .2s both')}>
Operação completa, padrão hoteleiro e precificação dinâmica. Você acompanha os resultados — nós cuidamos de tudo em Foz do Iguaçu, Gramado, Balneário Camboriú e Curitiba.
</p>
<div style={css('margin-top:40px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;animation:sgFadeUp .9s .3s both')}>
<a className="btn" href="#cta" style={css('display:inline-flex;align-items:center;gap:12px;background:#431171;color:#fff;font-weight:600;font-size:17px;padding:17px 18px 17px 30px;border-radius:999px;box-shadow:0 18px 40px -18px rgba(67,17,113,.7)')}>
Quero maximizar meu imóvel
<span style={css('width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></span>
</a>
<a className="btn" href="#servicos" style={css('display:inline-flex;align-items:center;color:#120A1C;font-weight:600;font-size:17px;padding:16px 28px;border-radius:999px;border:1px solid #D2C5E3;background:rgba(255,255,255,.8)')}>Quero aprender a faturar</a>
</div>
</div>


<div style={css('position:relative;max-width:1080px;margin:84px auto 0;animation:sgFadeUp 1.2s .35s both')}>
<div style={css('position:absolute;left:8%;right:8%;top:30px;bottom:-40px;background:radial-gradient(ellipse at 50% 40%,rgba(101,56,160,.30),transparent 70%);filter:blur(40px)')}></div>
<div style={css('position:relative;border-radius:30px 30px 0 0;background:rgba(255,255,255,.78);backdrop-filter:blur(18px);border:1px solid rgba(67,17,113,.12);border-bottom:0;padding:26px 30px 0;box-shadow:0 -10px 90px -30px rgba(67,17,113,.35);transform:perspective(1800px) rotateX(5deg);transform-origin:50% 100%;-webkit-mask-image:linear-gradient(180deg,#000 72%,transparent 100%);mask-image:linear-gradient(180deg,#000 72%,transparent 100%)')}>
<div style={css('display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:18px;border-bottom:1px solid #ECE7F2')}>
<div style={css('display:flex;align-items:center;gap:8px')}><span style={css('width: 10px; height: 10px; border-radius: 50%; background: rgb(228, 222, 236)')}></span><span style={css('width: 10px; height: 10px; border-radius: 50%; background: rgb(228, 222, 236)')}></span><span style={css('width: 10px; height: 10px; border-radius: 50%; background: rgb(228, 222, 236)')}></span><span style={css('margin-left: 14px; font-size: 13px; font-weight: 600; color: rgb(95, 88, 112)')}>Painel Anfitrião Sigma · Studio 35m² · Foz do Iguaçu</span></div>
<span style={css('font-size:12px;font-weight:600;color:#431171;background:#F2ECF8;padding:5px 12px;border-radius:999px')}>Exemplo real do portfólio</span>
</div>
<div style={css('display:flex;flex-wrap:wrap;gap:30px;padding:26px 0 90px')}>
<div style={css('flex:2 1 520px;min-width:0')}>
<div style={css('display:flex;align-items:baseline;gap:14px;flex-wrap:wrap')}>
<span style={css('font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#5F5870')}>Receita mensal</span>
<span className="hd" style={css('font-weight:600;font-size:46px;letter-spacing:-0.045em;line-height:1')}>R$ 5.100</span>
<span style={css('font-size:15px;color:#8C849C;text-decoration:line-through')}>R$ 1.900</span>
<span style={css('font-size:13px;font-weight:700;color:#431171;background:#F2ECF8;padding:4px 10px;border-radius:999px')}>+168%</span>
</div>
<div style={css('position:relative;margin-top:16px;height:230px')}>
<svg width="100%" height="230" viewBox="0 0 800 230" preserveAspectRatio="none" fill="none" style={css('position:absolute;inset:0')}>
<defs>
<linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#431171" stopOpacity=".22"></stop><stop offset="1" stopColor="#431171" stopOpacity="0"></stop></linearGradient>
<linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A68CC4"></stop><stop offset="1" stopColor="#431171"></stop></linearGradient>
</defs>
<g stroke="#ECE7F2" strokeWidth="1"><path d="M0 57H800M0 115H800M0 172H800"></path></g>
<path d="M0 200 C 80 196, 130 180, 200 168 S 320 146, 380 118 S 500 100, 560 74 S 700 34, 800 18 L800 230 L0 230 Z" fill="url(#ar)" style={css('animation:sgFade 1.6s .8s both')}></path>
<path d="M0 200 C 80 196, 130 180, 200 168 S 320 146, 380 118 S 500 100, 560 74 S 700 34, 800 18" stroke="url(#ln)" strokeWidth="3.5" strokeLinecap="round" pathLength="1" style={css('stroke-dasharray:1;animation:sgDraw 2.2s .5s cubic-bezier(.4,0,.2,1) both;vector-effect:non-scaling-stroke')}></path>
</svg>
<div style={css('position:absolute;right:0;top:0;width:12px;height:12px;border-radius:50%;background:#431171;box-shadow:0 0 0 6px rgba(67,17,113,.15);animation:sgFade .6s 2.6s both')}></div>
</div>
</div>
<div style={css('flex:1 1 240px;min-width:0;display:flex;flex-direction:column;gap:14px')}>
<div style={css('border:1px solid #ECE7F2;border-radius:18px;padding:16px 20px;background:#fff')}><div style={css('font-size:12px;font-weight:600;color:#8C849C;letter-spacing:.1em;text-transform:uppercase')}>Ocupação</div><div className="hd" style={css('font-weight:600;font-size:30px;letter-spacing:-0.04em')}>92%</div></div>
<div style={css('border:1px solid #ECE7F2;border-radius:18px;padding:16px 20px;background:#fff')}><div style={css('font-size:12px;font-weight:600;color:#8C849C;letter-spacing:.1em;text-transform:uppercase')}>VALOR DE DIÁRIA</div><div className="hd" style={css('font-weight:600;font-size:22px;letter-spacing:-0.03em;margin-top:4px')}>Ajustado todos os dias</div></div>
<div style={css('border:1px solid #ECE7F2;border-radius:18px;padding:16px 20px;background:#fff')}><div style={css('font-size:12px;font-weight:600;color:#8C849C;letter-spacing:.1em;text-transform:uppercase')}>Avaliação</div><div className="hd" style={css('font-weight:600;font-size:30px;letter-spacing:-0.04em')}>4.9 <span style={css('color:#FF4700;font-size:20px')}>★</span></div></div>
</div>
</div>
</div>


</div>
</section>
</>
  );
};
