import { Helmet } from "react-helmet-async";
import "@/styles/sigma.css";
import "@/styles/intranet.css";
import { IntranetTop } from "@/components/intranet/IntranetTop";

/** Área Comercial (id interno "metas"): telas antigas removidas; sistema novo em desenho. */
const ComercialEmConstrucao = () => (
  <div className="sg ix">
    <Helmet><title>Comercial — Intranet Anfitrião Sigma</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="ix-bg">
      <div className="ix-halo" style={{ width: 460, height: 460, background: "rgba(67,17,113,.14)", top: -180, right: -80 }} />
      <IntranetTop compact="Comercial" />
      <main className="ix-wrap" style={{ position: "relative", minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center" }}>
        <h1 className="ix-h1 hd" style={{ margin: 0 }}>Em construção</h1>
      </main>
    </div>
  </div>
);
export default ComercialEmConstrucao;
