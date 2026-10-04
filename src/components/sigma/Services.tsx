import { Fragment } from "react";
import { css } from "@/lib/css";

import { GESTAO, MENTORIA } from "@/data/sigma";
export const Services = () => {
  const gestao = GESTAO.map((t) => ({ t }));
  const mentoria = MENTORIA.map((t) => ({ t }));
  return (
<>
<section id="servicos" style={css('position:relative;overflow:hidden;background:linear-gradient(180deg,#fff 0%,#FBF9FD 8%,#F5F0FA 18%,#EFE8F7 30%,#EFE8F7 70%,#F5F0FA 82%,#FBF9FD 92%,#fff 100%)')}>
<div style={css('position:absolute;left:-180px;top:22%;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.14),transparent 68%);filter:blur(30px);animation:sgAurora 22s ease-in-out infinite')}></div>
<div style={css('position:absolute;right:-180px;bottom:14%;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(166,140,196,.22),transparent 68%);filter:blur(30px);animation:sgAurora 26s ease-in-out infinite reverse')}></div>
<div style={css('position:relative;max-width:1240px;margin:0 auto;padding:180px 32px 200px')}>
<div style={css('text-align:center;max-width:820px;margin:0 auto')}>
<div style={css('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>Dois caminhos. Um destino.</div>
<h2 className="hd" style={css('margin:18px 0 0;font-weight:600;font-size:clamp(34px,4.4vw,62px);line-height:1.04;letter-spacing:-0.045em')}>Escolha como você quer <span className="gt">aumentar sua receita.</span></h2>
</div>
<div style={css('margin-top:80px;display:flex;flex-wrap:wrap;gap:28px;align-items:stretch')}>
<div className="lift" style={css('flex:1 1 480px;min-width:0;background:linear-gradient(150deg,#2A0A47,#120A1C);color:#fff;border-radius:36px;padding:56px;position:relative;overflow:hidden;border:1px solid #2A0A47;display:flex;flex-direction:column')}>
<div style={css('position:absolute;right:-80px;top:-120px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(166,140,196,.4),transparent 70%)')}></div>
<div style={css('position:relative;font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#C2B1D6')}>01 · Gestão completa</div>
<h3 className="hd" style={css('position:relative;margin:20px 0 0;font-weight:600;font-size:38px;line-height:1.1;letter-spacing:-0.045em')}>Você não faz nada. <span className="gtl">Nós fazemos tudo.</span></h3>
<p style={css('position:relative;margin:20px 0 0;color:#C2B1D6;font-size:17px')}>Do anúncio ao repasse mensal na sua conta, com padrão hoteleiro.</p>
<div style={css('position:relative;margin-top:36px;flex:1')}>
{gestao.map((g, i) => (<Fragment key={i}>
<div style={css('display:flex;gap:16px;align-items:center;padding:17px 0;border-top:1px solid rgba(255,255,255,.12);font-size:16px;font-weight:500')}><span style={css('flex:none;width:6px;height:6px;border-radius:50%;background:#FF4700')}></span>{g.t}</div>
</Fragment>))}
</div>
<a className="btn" href="#cta" style={css('position:relative;margin-top:36px;display:flex;align-items:center;justify-content:center;background:#fff;color:#120A1C;font-weight:600;font-size:16.5px;padding:18px;border-radius:16px')}>Quero gestão completa</a>
</div>
<div className="lift" style={css('flex:1 1 480px;min-width:0;background:#fff;border:1px solid #E7E2EE;border-radius:36px;padding:56px;position:relative;overflow:hidden;display:flex;flex-direction:column')}>
<div style={css('position:absolute;right:-90px;top:-110px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(101,56,160,.14),transparent 70%)')}></div>
<div style={css('position:relative;font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#431171')}>02 · Mentoria Sigma</div>
<h3 className="hd" style={css('position:relative;margin:20px 0 0;font-weight:600;font-size:38px;line-height:1.1;letter-spacing:-0.045em')}>Ou aprenda a fazer sozinho <span className="gt">como um profissional.</span></h3>
<p style={css('position:relative;margin:20px 0 0;color:#5F5870;font-size:17px')}>Estratégia, automação e crescimento previsível para quem quer dominar o jogo.</p>
<div style={css('position:relative;margin-top:36px;flex:1')}>
{mentoria.map((g, i) => (<Fragment key={i}>
<div style={css('display:flex;gap:16px;align-items:center;padding:17px 0;border-top:1px solid #ECE7F2;font-size:16px;font-weight:500')}><span style={css('flex:none;width:6px;height:6px;border-radius:50%;background:#431171')}></span>{g.t}</div>
</Fragment>))}
</div>
<a className="btn" href="#cta" style={css('position:relative;margin-top:36px;display:flex;align-items:center;justify-content:center;background:#431171;color:#fff;font-weight:600;font-size:16.5px;padding:18px;border-radius:16px')}>Quero entrar para a mentoria</a>
</div>
</div>
</div>
</section>
</>
  );
};
