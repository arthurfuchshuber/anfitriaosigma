import { Fragment } from "react";
import { css } from "@/lib/css";

import { useState } from "react";
import { COMPARE } from "@/data/sigma";
export const MCompare = () => {
  const [temp, setTemp] = useState(true);
  const cmp = temp ? COMPARE.temporada : COMPARE.tradicional;
  const indLeft = temp ? "50%" : "4px";
  const fgTrad = temp ? "#431171" : "#fff";
  const fgTemp = temp ? "#fff" : "#431171";
  const setTradFn = () => setTemp(false);
  const setTempFn = () => setTemp(true);
  return (
<>
<section id="comparativo" style={css('position:relative;overflow:hidden;background:linear-gradient(180deg,#fff 0%,#FAF8FC 14%,#FAF8FC 86%,#fff 100%)')}>
<div style={css('position:absolute;border-radius:50%;filter:blur(30px);animation:sgAurora 20s ease-in-out infinite;right:-140px;bottom:40px;width:380px;height:380px;background:radial-gradient(circle,rgba(166,140,196,.2),transparent 68%)')}></div><div style={css('position:relative;padding:72px 20px')}><div style={css('font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171;')}>Comparativo de receita</div><h2 className="hd" style={css('margin: 14px 0 0; font-weight: 600; font-size: 26px; line-height: 1.08; letter-spacing: -0.045em; width: 359px')}>O que você ganha em 1 mês, pode render <span className="gt">em poucos dias.</span></h2><p style={css('margin: 14px 0 0; font-size: 16.5px; line-height: 1.6; color: #5F5870; width: 345px')}>Alterne entre os modelos e veja a diferença no resultado líquido do mesmo imóvel.</p>
<div style={css('margin-top:26px;position:relative;display:flex;padding:4px;border-radius:999px;background:#fff;border:1px solid #E7E2EE;box-shadow:0 14px 34px -22px rgba(67,17,113,.4)')}>
<div style={css(`position:absolute;top:4px;bottom:4px;left:${indLeft};width:calc(50% - 4px);border-radius:999px;background:#431171;transition:left .45s cubic-bezier(.2,.8,.2,1)`)}></div>
<button onClick={setTradFn} style={css(`position:relative;z-index:1;flex:1;padding:12px 0;border:0;background:transparent;border-radius:999px;font-weight:600;font-size:14px;cursor:pointer;color:${fgTrad};transition:color .3s`)}>Aluguel tradicional</button>
<button onClick={setTempFn} style={css(`position:relative;z-index:1;flex:1;padding:12px 0;border:0;background:transparent;border-radius:999px;font-weight:600;font-size:14px;cursor:pointer;color:${fgTemp};transition:color .3s`)}>Temporada Sigma</button></div>
<div style={css('position:relative;margin-top:20px;border-radius:26px;background:#fff;border:1px solid #E7E2EE;padding:26px 22px;box-shadow:0 40px 80px -50px rgba(67,17,113,.45);overflow:hidden')}>
<div style={css('display:flex;justify-content:space-between;align-items:center;gap:8px')}><span className="hd" style={css('font-weight:600;font-size:19px;letter-spacing:-0.03em')}>{cmp.title}</span><span style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#431171;background:#F2ECF8;padding:5px 10px;border-radius:999px;white-space:nowrap')}>{cmp.tag}</span></div>
<div style={css('margin-top:20px;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8C849C')}>RECEITA BRUTA MENSAL</div>
<div className="hd" style={css('font-weight: 600; font-size: 40px; line-height: 1.1; letter-spacing: -0.05em')}>{cmp.liq}</div>
<div style={css('margin-top:14px;height:10px;border-radius:10px;background:#F0EBF6')}><div style={css(`height:10px;border-radius:10px;background:linear-gradient(90deg,#A68CC4,#431171);width:${cmp.w}%;transition:width .8s cubic-bezier(.2,.8,.2,1)`)}></div></div>
<div style={css('margin-top:20px;display:flex;flex-direction:column;font-size:15px')}>
<div style={css('display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Receita bruta</span><b>{cmp.bruta}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Custos</span><b>{cmp.custos}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Ocupação</span><b>{cmp.ocup}</b></div>
<div style={css('display:flex;justify-content:space-between;padding:11px 0;border-top:1px solid #ECE7F2')}><span style={css('color:#5F5870')}>Valorização do ativo</span><b>{cmp.val}</b></div></div>
<div style={css('margin-top:6px;font-size:14px;line-height:1.9;color:#5F5870')}>{cmp.points.map((p, i) => (<Fragment key={i}><div><span style={css('color:#431171')}>●</span> {p.t}</div></Fragment>))}</div>
<div style={css('margin-top:20px')}><a className="btn" href="#cta" style={css('display:flex;align-items:center;justify-content:center;background:#431171;color:#fff;font-weight:600;font-size:16.5px;height:54px;border-radius:16px;box-shadow:0 18px 40px -20px rgba(67,17,113,.7)')}>Quero essa receita no meu imóvel</a></div></div></div></section>
</>
  );
};
