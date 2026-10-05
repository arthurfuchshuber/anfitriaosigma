import { useEffect } from "react";

/**
 * Celular: tabelas da intranet (.ix-table) viram cartões de 2 colunas (CSS em intranet.css).
 * Este hook só copia o título de cada coluna (th) para o atributo data-l de cada célula (td),
 * que o CSS usa como rótulo. Vale para TODAS as telas da intranet, inclusive as futuras.
 */
export const useStackTables = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    const apply = () => {
      document.querySelectorAll<HTMLTableElement>("table.ix-table").forEach((t) => {
        const heads = Array.from(t.tHead?.rows[0]?.cells ?? []).map((h) => (h.textContent ?? "").trim());
        Array.from(t.tBodies).forEach((b) => Array.from(b.rows).forEach((tr) => Array.from(tr.cells).forEach((td, i) => {
          const l = heads[i] ?? "";
          if (td.getAttribute("data-l") !== l) td.setAttribute("data-l", l);
        })));
      });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [enabled]);
};
