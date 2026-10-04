import { describe, expect, it } from "vitest";
import * as m from "./masks";

describe("máscaras e validações", () => {
  it("CPF", () => {
    expect(m.maskCPF("52998224725")).toBe("529.982.247-25");
    expect(m.maskCPF("5299")).toBe("529.9");
    expect(m.validCPF("529.982.247-25")).toBe(true);
    expect(m.validCPF("529.982.247-24")).toBe(false);
    expect(m.validCPF("111.111.111-11")).toBe(false);
  });
  it("CNPJ", () => {
    expect(m.maskCNPJ("11222333000181")).toBe("11.222.333/0001-81");
    expect(m.maskCNPJ("112223")).toBe("11.222.3");
    expect(m.validCNPJ("11.222.333/0001-81")).toBe(true);
    expect(m.validCNPJ("11.222.333/0001-80")).toBe(false);
    expect(m.validCNPJ("00.000.000/0000-00")).toBe(false);
  });
  it("CEP, RG, e-mail", () => {
    expect(m.maskCEP("85851000")).toBe("85851-000");
    expect(m.maskRG("123456789")).toBe("12.345.678-9");
    expect(m.maskRG("12345678x")).toBe("12.345.678-X");
    expect(m.validRG("12.345.678-9")).toBe(true);
    expect(m.validRG("123")).toBe(false);
    expect(m.validEmail("a@b.com")).toBe(true);
    expect(m.validEmail("a@b")).toBe(false);
  });
  it("telefone com DDI", () => {
    expect(m.splitPhone("+5545999999999")).toEqual({ ddi: "55", national: "45999999999" });
    expect(m.splitPhone("+351912345678")).toEqual({ ddi: "351", national: "912345678" });
    expect(m.splitPhone("45999999999")).toEqual({ ddi: "55", national: "45999999999" });
    expect(m.maskPhoneNational("45999999999")).toBe("(45) 99999-9999");
    expect(m.maskPhoneNational("4533334444")).toBe("(45) 3333-4444");
    expect(m.formatPhone("+5545999999999")).toBe("+55 (45) 99999-9999");
    expect(m.joinPhone("55", "(45) 99999-9999")).toBe("+5545999999999");
    expect(m.validPhone("+5545999999999")).toBe(true);
    expect(m.validPhone("+554599999")).toBe(false);
    expect(m.validPhone("+5503999999999")).toBe(false);
    expect(m.validPhone("+351912345678")).toBe(true);
  });
  it("data", () => {
    expect(m.maskDate("14031992")).toBe("14/03/1992");
    expect(m.dmyToIso("14/03/1992")).toBe("1992-03-14");
    expect(m.dmyToIso("31/02/1992")).toBe("");
    expect(m.dmyToIso("14/03/19")).toBe("");
    expect(m.isoToDmy("1992-03-14")).toBe("14/03/1992");
  });
  it("dinheiro e percentual", () => {
    expect(m.maskMoney("230000")).toBe("2.300,00");
    expect(m.maskMoney("5")).toBe("0,05");
    expect(m.moneyToNumber("2.300,00")).toBe(2300);
    expect(m.numberToMoney(1234.5)).toBe("1.234,50");
    expect(m.maskPercent("655")).toBe("65,5");
    expect(m.maskPercent("9999")).toBe("100,0");
    expect(m.percentToNumber("65,5")).toBe(65.5);
  });
  it("PIX por tipo", () => {
    expect(m.maskPix("cpf", "52998224725")).toBe("529.982.247-25");
    expect(m.pixStore("cpf", "529.982.247-25")).toBe("52998224725");
    expect(m.validPix("cpf", "52998224725")).toBe(true);
    expect(m.validPix("email", "x@y.com")).toBe(true);
    expect(m.validPix("celular", "+5545999999999")).toBe(true);
    expect(m.validPix("aleatoria", "123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(m.validPix("aleatoria", "abc")).toBe(false);
  });
  it("agência e conta", () => {
    expect(m.maskAgency("00012")).toBe("00012");
    expect(m.maskAccount("123456")).toBe("12345-6");
  });
});
