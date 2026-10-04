import { describe, expect, it } from "vitest";
import { attainment, bonusOf, missing, suggestFocus, totalPay } from "./calc";

describe("calc (simulador/foco)", () => {
  it("exemplo Dárcio: meta 18.937, validado 15.600 → 82%, bônus ~1.895, total ~4.195", () => {
    const att = attainment(15600, 18937);
    expect(Math.round(att * 100)).toBe(82);
    expect(Math.round(bonusOf(2300, att))).toBe(1895);
    expect(Math.round(totalPay(2300, att))).toBe(4195);
    expect(Math.round(missing(18937, 15600))).toBe(3337);
  });
  it("foco sugerido fecha a meta e ordena por menor esforço", () => {
    const cards = suggestFocus(18937, 15600, 2300, [
      { id: "1", name: "Gestão Completa", points: 1000 },
      { id: "2", name: "Cherry CC", points: 15600 },
      { id: "3", name: "Cherry Mensal", points: 3000 },
    ]);
    expect(cards.map((c) => c.qty)).toEqual([1, 2, 4]);
    expect(cards[0].product.name).toBe("Cherry CC");
    expect(cards.every((c) => c.attainment >= 1)).toBe(true);
  });
});
