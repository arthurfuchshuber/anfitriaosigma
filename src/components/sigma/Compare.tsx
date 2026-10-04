import { Fragment } from "react";
import { css } from "@/lib/css";

import { useState } from "react";
import { COMPARE } from "@/data/sigma";
export const Compare = () => {
  const [temp, setTemp] = useState(true);
  const cmp = temp ? COMPARE.temporada : COMPARE.tradicional;
  const indLeft = temp ? "50%" : "5px";
  const fgTrad = temp ? "#431171" : "#fff";
  const fgTemp = temp ? "#fff" : "#431171";
  const setTradFn = () => setTemp(false);
  const setTempFn = () => setTemp(true);
  return (
<>
<section id="comparativo" style={css('position:relative;overflow:hidden;background:linear-gradient(180deg,#fff 0%,#FAF8FC 16%,#FAF8FC 82%,#fff 100%)')}>
<div style={css('position:absolute;left:-200px;top:140px;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.12),transparent 68%);filter:blur(30px);animation:sgAurora 20s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-160px;bottom:60px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(166,140,196,.18),transparent 68%);filter:blur(30px);animation:sgAurora 24s ease-in-out infinite reverse')}></div>
<div style={css('position:relative;max-width:1240px;margin:0 auto;padding:120px 32px;display:flex;flex-wrap:wrap;gap:64px;align-items:center')}>
<div style={css('flex:1 1 420px;min-width:0')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Comparativo de receita</div>
<h2 className="hd" style={css('margin: 16px 0 0; font-weight: 600; font-size: 55px; line-height: 1.05; letter-spacing: -0.045em')}>O que você ganha em 1 mês pode render <span className="gt">em poucos dias.</span></h2>
<p style={css('margin:20px 0 0;color:#5F5870;font-size:18px;max-width:480px')}>Alterne entre os dois modelos e veja a diferença no resultado líquido do mesmo imóvel.</p>
<div style={css('margin-top:34px;position:relative;display:inline-flex;padding:5px;border-radius:999px;background:#fff;border:1px solid #E7E2EE;box-shadow:0 14px 34px -22px rgba(67,17,113,.4)')}>
<div style={css(`position:absolute;top:5px;bottom:5px;left:${indLeft};width:calc(50% - 5px);border-radius:999px;background:#431171;transition:left .45s cubic-bezier(.2,.8,.2,1)`)}></div>
<button onClick={setTradFn} style={css(`position:relative;z-index:1;width:200px;padding:13px 0;border:0;background:transparent;border-radius:999px;font-weight:600;font-size:15px;cursor:pointer;color:${fgTrad};transition:color .3s`)}>Aluguel tradicional</button>
<button onClick={setTempFn} style={css(`position:relative;z-index:1;width:200px;padding:13px 0;border:0;background:transparent;border-radius:999px;font-weight:600;font-size:15px;cursor:pointer;color:${fgTemp};transition:color .3s`)}>Temporada Sigma</button>
</div>
</div>
<div style={css('flex:1 1 480px;min-width:0')}>
<div style={css('position:relative;border-radius:34px;background:#fff;border:1px solid #E7E2EE;padding:40px;box-shadow:0 50px 100px -50px rgba(67,17,113,.45);overflow:hidden')}>
<div style={css('position:absolute;right:-90px;top:-110px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.16),transparent 70%)')}></div>
<div style={css('position:relative;display:flex;justify-content:space-between;align-items:center')}><span className="hd" style={css('font-weight:600;font-size:22px;letter-spacing:-0.03em')}>{cmp.title}</span><span style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#431171;background:#F2ECF8;padding:6px 12px;border-radius:999px')}>{cmp.tag}</span></div>
<div style={css('position:relative;margin-top:26px;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8C849C')}>Receita líquida mensal</div>
<div className="hd" style={css('position:relative;font-weight:600;font-size:clamp(50px,5.4vw,76px);line-height:1.05;letter-spacing:-0.05em')}>{cmp.liq}</div>
<div style={css('position:relative;margin-top:18px;height:12px;border-radius:12px;background:#F0EBF6')}><div style={css(`height:12px;border-radius:12px;background:linear-gradient(90deg,#A68CC4,#431171);width:${cmp.w}%;transition:width .8s cubic-bezier(.2,.8,.2,1)`)}></div></div>
<div style={css('position:relative;margin-top:26px;display:flex;flex-direction:column;font-size:16px')}>
<div style={css('display:flex;justify-content:space-between;padding:13px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Receita bruta</span><b>{cmp.bruta}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:13px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Custos</span><b>{cmp.custos}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:13px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Ocupação</span><b>{cmp.ocup}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:13px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Valorização do ativo</span><b>{cmp.val}</b></div>
</div>
<div style={css('position:relative;margin-top:8px;font-size:14.5px;line-height:1.9;color:#5F5870')}>
{cmp.points.map((p, i) => (<Fragment key={i}><div><span style={css('color:#431171')}>●</span> {p.t}</div></Fragment>))}
</div>
<a className="btn" href="#cta" style={css('position:relative;margin-top:26px;display:flex;align-items:center;justify-content:center;background:#431171;color:#fff;font-weight:600;font-size:16.5px;padding:17px;border-radius:16px')}>Quero essa receita no meu imóvel</a>
</div>
</div>
</div>
</section>
</>
  );
};
