/** Listas fechadas usadas nos campos de seleção. */
export const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export const RELATIONS = ["Cônjuge", "Companheiro(a)", "Pai", "Mãe", "Filho(a)", "Irmão(ã)", "Avô(ó)", "Tio(a)", "Amigo(a)", "Outro"];

export const TAX_REGIMES = ["MEI", "Simples Nacional", "Lucro Presumido", "Lucro Real"];

/** Bancos mais usados (código COMPE · nome). Armazenamos "código · nome". */
export const BANKS: [string, string][] = [
  ["001", "Banco do Brasil"], ["033", "Santander"], ["104", "Caixa Econômica Federal"], ["237", "Bradesco"], ["341", "Itaú Unibanco"],
  ["260", "Nu Pagamentos (Nubank)"], ["077", "Banco Inter"], ["336", "C6 Bank"], ["212", "Banco Original"], ["290", "PagBank (PagSeguro)"],
  ["323", "Mercado Pago"], ["380", "PicPay"], ["403", "Cora"], ["197", "Stone Pagamentos"], ["756", "Sicoob"], ["748", "Sicredi"],
  ["085", "Ailos"], ["422", "Banco Safra"], ["070", "BRB"], ["041", "Banrisul"], ["004", "Banco do Nordeste"], ["003", "Banco da Amazônia"],
  ["208", "BTG Pactual"], ["655", "Votorantim (BV)"], ["634", "Triângulo"], ["218", "Banco BS2"], ["301", "BPP"], ["082", "Topázio"],
  ["121", "Agibank"], ["269", "HSBC"], ["735", "Neon"], ["332", "Acesso Soluções"], ["461", "Asaas"], ["384", "Global SCM"],
  ["654", "Banco Digimais"], ["133", "Cresol"], ["136", "Unicred"], ["097", "Credisis"], ["999", "Outro banco"],
].map(([c, n]) => [c, n]) as [string, string][];
export const bankLabel = (code: string) => { const b = BANKS.find(([c]) => c === code); return b ? `${b[0]} · ${b[1]}` : code; };
