/** Cálculos de simulação (só hipótese). A fonte oficial é o banco (supabase/migrations/*engine.sql). */
export interface SimProduct { id: string; name: string; points: number }

export const attainment = (points: number, goal: number) => (goal > 0 ? points / goal : 0);
export const bonusOf = (salary: number, att: number) => salary * att;
export const totalPay = (salary: number, att: number) => salary + bonusOf(salary, att);

/** Quanto falta (em pontos) para 100% da meta */
export const missing = (goal: number, points: number) => Math.max(goal - points, 0);

export interface FocusCard { product: SimProduct; qty: number; attainment: number; total: number }

/** Foco sugerido: menor quantidade de cada produto que fecha a meta. Ordena pelo menor esforço (menos unidades). */
export function suggestFocus(goal: number, validated: number, salary: number, products: SimProduct[], max = 3): FocusCard[] {
  const gap = missing(goal, validated);
  if (gap <= 0) return [];
  return products
    .filter((p) => p.points > 0)
    .map((p) => {
      const qty = Math.ceil(gap / p.points);
      const att = attainment(validated + qty * p.points, goal);
      return { product: p, qty, attainment: att, total: totalPay(salary, att) };
    })
    .sort((a, b) => a.qty - b.qty || b.product.points - a.product.points)
    .slice(0, max);
}

export const commissionRatio = (bonus: number, caixa: number) => (caixa > 0 ? bonus / caixa : null);
