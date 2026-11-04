import { Fragment } from "react";
import { css } from "@/lib/css";
import { useLeadForm } from "@/hooks/use-lead-form";

export const FinalCta = () => {
  const { form, setForm, set, sugg, show, setShow, error, onAddress, pick, submit } = useLeadForm();
  return (
<>
<section id="cta" style={css('position:relative;overflow:hidden;color:#2b0a25;background:linear-gradient(180deg,#ffffff 0.0%,#ffffff 2.2%,#ffffff 4.4%,#fffeff 6.5%,#fffcfe 8.7%,#fef9fd 10.9%,#fef6fd 13.1%,#fdf2fb 15.3%,#fcedf9 17.5%,#fbe8f7 19.6%,#fbe2f6 21.8%,#fadcf4 24.0%,#f9d6f3 26.2%,#f8d0f1 28.4%,#f7cbef 30.5%,#f6c6ed 32.7%,#f5c1eb 34.9%,#f5beeb 37.1%,#f5bbea 39.3%,#f4bae9 41.5%,#f4b8e6 43.6%,#f4b8e6 45.8%,#f4b8e6 48.0%,#f4b8e6 100%);padding:clamp(300px,38vw,560px) 24px 120px')}>
<div style={css('max-width:1240px;margin:0 auto;padding:0 64px;display:flex;flex-wrap:wrap;gap:56px;align-items:center')}>
<div style={css('position:absolute;left:-140px;bottom:-220px;width:680px;height:680px;border-radius:50%;background:radial-gradient(circle,rgba(160,56,141,.85),transparent 68%);animation:sgAurora 18s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-80px;top:22%;width:460px;height:460px;border-radius:50%;background:radial-gradient(circle,rgba(196,140,186,.3),transparent 68%);animation:sgAurora 24s ease-in-out infinite reverse')}></div>
<div style={css('position:absolute;left:0;right:0;bottom:0;height:300px;pointer-events:none;opacity:.7;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 55%,#000 75%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 55%,#000 75%,transparent 100%)')}>
<svg width="100%" height="100%" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
<defs><pattern id="pC" width="14" height="18" patternUnits="userSpaceOnUse"><rect width="14" height="18" fill="#c4009a"></rect><rect x="3" y="4" width="6" height="8" rx="1" fill="#c48cba" opacity=".45"></rect></pattern></defs>
<g fill="url(#pC)">
<rect x="0" y="170" width="120" height="130"></rect><rect x="120" y="110" width="90" height="190"></rect><rect x="210" y="200" width="130" height="100"></rect><rect x="340" y="80" width="90" height="220"></rect><rect x="430" y="160" width="120" height="140"></rect><rect x="550" y="50" width="80" height="250"></rect><rect x="630" y="190" width="140" height="110"></rect><rect x="770" y="100" width="90" height="200"></rect><rect x="860" y="30" width="80" height="270"></rect><rect x="940" y="160" width="130" height="140"></rect><rect x="1070" y="90" width="90" height="210"></rect><rect x="1160" y="180" width="120" height="120"></rect><rect x="1280" y="120" width="160" height="180"></rect>
</g>
</svg>
</div>
<div style={css('position:relative;flex:1 1 440px;min-width:0')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#6b2a5e')}>Análise gratuita</div>
<h2 className="hd" style={css('margin:16px 0 0;font-weight:600;font-size:clamp(36px,4.6vw,64px);line-height:1.04;letter-spacing:-0.045em')}>Descubra quanto seu imóvel está <span className="gtl">deixando na mesa.</span></h2>
<p style={css('margin:22px 0 0;font-size:18.5px;color:#6b2a5e;max-width:500px')}>Avaliamos o potencial real. Se não fizer sentido para temporada, somos transparentes e dizemos.</p>
</div>
<div style={css('position:relative;flex:1 1 380px;min-width:0;background:rgba(255,255,255,.96);color:#1c0a19;border-radius:30px;padding:36px;box-shadow:0 50px 100px -40px rgba(0,0,0,.7)')}>
<label htmlFor="f1" style={css('display:block;font-size:13px;font-weight:600;color:#695f67')}>Seu nome</label>
<input id="f1" value={form.nome} onChange={set("nome")} type="text" placeholder="Como podemos te chamar?" style={css('width:100%;box-sizing:border-box;height:52px;margin-top:6px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;font-size:16px;background:#fcf8fb')} />
<label htmlFor="f2" style={css('display:block;margin-top:16px;font-size:13px;font-weight:600;color:#695f67')}>Endereço completo</label>
<div style={css('position:relative')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d700a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('position:absolute;left:16px;top:21px')}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg><input id="f2" value={form.endereco} onChange={onAddress} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)} autoComplete="off" type="text" placeholder="Comece a digitar a rua, número e bairro…" style={css('width:100%;box-sizing:border-box;height:52px;margin-top:6px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;font-size:16px;background:#fcf8fb;padding-left:44px')} />
{show && sugg.length > 0 && (
<ul role="listbox" style={css('position:absolute;left:0;right:0;top:62px;z-index:5;margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #eee2ec;border-radius:14px;box-shadow:0 24px 50px -20px rgba(215,0,166,.45);max-height:240px;overflow:auto')}>
{sugg.map((s, i) => (
<li key={i} role="option" aria-selected="false" onMouseDown={() => pick(s)} style={css('padding:10px 12px;border-radius:10px;font-size:14px;line-height:1.4;color:#1c0a19;cursor:pointer')}>{s.label}</li>
))}
</ul>
)}
</div>
<div style={css('margin-top:10px;display:flex;gap:10px')}>
<div style={css('flex:2;min-width:0')}><span style={css('display:block;font-size:11.5px;font-weight:600;color:#958b93')}>Cidade</span><input type="text" value={form.cidade} onChange={set("cidade")} placeholder="Automático" style={css('width:100%;box-sizing:border-box;height:44px;margin-top:4px;padding:0 12px;border:1.5px dashed #e3c5dd;border-radius:12px;font-size:14px;background:#f9eef7;color:#695f67')} /></div>
<div style={css('flex:.8;min-width:0')}><span style={css('display:block;font-size:11.5px;font-weight:600;color:#958b93')}>Estado</span><input type="text" value={form.estado} onChange={set("estado")} placeholder="UF" style={css('width:100%;box-sizing:border-box;height:44px;margin-top:4px;padding:0 12px;border:1.5px dashed #e3c5dd;border-radius:12px;font-size:14px;background:#f9eef7;color:#695f67')} /></div>
<div style={css('flex:1.2;min-width:0')}><span style={css('display:block;font-size:11.5px;font-weight:600;color:#958b93')}>CEP</span><input type="text" value={form.cep} onChange={set("cep")} placeholder="Automático" style={css('width:100%;box-sizing:border-box;height:44px;margin-top:4px;padding:0 12px;border:1.5px dashed #e3c5dd;border-radius:12px;font-size:14px;background:#f9eef7;color:#695f67')} /></div>
</div>
<div style={css('margin-top:10px')}><span style={css('display:block;font-size:11.5px;font-weight:600;color:#958b93')}>Complemento</span><input type="text" value={form.complemento} onChange={set("complemento")} placeholder="Apto, bloco, torre…" style={css('width:100%;box-sizing:border-box;height:44px;margin-top:4px;padding:0 12px;border:1.5px solid #e3c5dd;border-radius:12px;font-size:14px;background:#fcf8fb;color:#695f67')} /></div>
<label htmlFor="f3" style={css('display:block;margin-top:16px;font-size:13px;font-weight:600;color:#695f67')}>Expectativa de ganhos por mês (R$)</label>
<input id="f3" value={form.ganhos} onChange={set("ganhos")} inputMode="numeric" type="text" placeholder="Ex.: 8.000" style={css('width:100%;box-sizing:border-box;height:52px;margin-top:6px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;font-size:16px;background:#fcf8fb')} />
<div style={css('display:block;margin-top:16px;font-size:13px;font-weight:600;color:#695f67')}>O imóvel está 100% mobiliado?</div>
<div style={css('display:flex;gap:10px;margin-top:6px')}><label style={css('flex:1;display:flex;align-items:center;gap:8px;height:52px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;background:#fcf8fb;font-size:15px;cursor:pointer')}><input type="radio" name="mob" checked={form.mobiliado === "sim"} onChange={() => setForm((f) => ({ ...f, mobiliado: "sim" }))} style={css('accent-color:#d700a6')} />Sim</label><label style={css('flex:1;display:flex;align-items:center;gap:8px;height:52px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;background:#fcf8fb;font-size:15px;cursor:pointer')}><input type="radio" name="mob" checked={form.mobiliado === "nao"} onChange={() => setForm((f) => ({ ...f, mobiliado: "nao" }))} style={css('accent-color:#d700a6')} />Ainda não</label></div>
<label htmlFor="f4" style={css('display:block;margin-top:16px;font-size:13px;font-weight:600;color:#695f67')}>Disponibilidade para início</label>
<select id="f4" value={form.inicio} onChange={set("inicio")} style={css('width:100%;box-sizing:border-box;height:52px;margin-top:6px;padding:0 16px;border:1.5px solid #e3c5dd;border-radius:14px;font-size:16px;background:#fcf8fb;appearance:auto')}><option>Imediata</option><option>Em até 30 dias</option><option>De 30 a 60 dias</option><option>Mais de 60 dias</option></select>
<button type="button" className="btn" onClick={submit} style={css('width:100%;border:0;cursor:pointer;margin-top:24px;display:flex;align-items:center;justify-content:center;background:#d700a6;color:#fff;font-weight:600;font-size:17px;padding:18px;border-radius:16px')}>Receber minha análise no WhatsApp</button>
{error && (<p role="alert" style={css('margin:10px 0 0;font-size:13px;color:#B3300F;text-align:center')}>{error}</p>)}
<p style={css('margin:12px 0 0;font-size:12px;color:#958b93;text-align:center')}>Resposta direta com os fundadores · sem compromisso</p>
</div>
</div>
</section>
</>
  );
};
