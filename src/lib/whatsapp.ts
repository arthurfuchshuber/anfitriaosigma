// Centraliza o número de WhatsApp e gera links com mensagem pré-preenchida.
const WHATSAPP_NUMBER = "5547996759381"; // formato internacional sem símbolos

export type CTAContext =
  | "gestao"
  | "mentoria"
  | "analise"
  | "calculadora"
  | "geral";

const messages: Record<CTAContext, string> = {
  gestao:
    "Olá! Quero maximizar o lucro do meu imóvel com a gestão completa da Anfitrião Sigma.",
  mentoria:
    "Olá! Tenho interesse na Mentoria Sigma para escalar meus ganhos como anfitrião.",
  analise:
    "Olá! Quero solicitar uma análise gratuita do potencial de receita do meu imóvel.",
  calculadora:
    "Olá! Acabei de simular minha receita no site e quero entender como aplicar no meu imóvel.",
  geral: "Olá! Quero saber mais sobre a Anfitrião Sigma.",
};

export function getWhatsAppUrl(context: CTAContext = "geral"): string {
  const text = encodeURIComponent(messages[context]);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function openWhatsApp(context: CTAContext = "geral") {
  window.open(getWhatsAppUrl(context), "_blank", "noopener,noreferrer");
}

export const WHATSAPP_DISPLAY = "+55 47 99675-9381";

export type LeadData = {
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
  ganhos?: string;
  mobiliado: "sim" | "nao";
  inicio: string;
};

/** Abre o WhatsApp com a análise gratuita já preenchida com os dados do formulário. */
export function openWhatsAppLead(d: LeadData) {
  const linhas = [
    "Olá! Quero a análise gratuita do meu imóvel.",
    "",
    `Nome: ${d.nome}`,
    `Endereço: ${d.endereco}`,
    d.complemento ? `Complemento: ${d.complemento}` : "",
    [d.cidade, d.estado].filter(Boolean).length ? `Cidade/UF: ${[d.cidade, d.estado].filter(Boolean).join(" - ")}` : "",
    d.cep ? `CEP: ${d.cep}` : "",
    d.ganhos ? `Expectativa de ganhos por mês: R$ ${d.ganhos}` : "",
    `100% mobiliado: ${d.mobiliado === "sim" ? "Sim" : "Ainda não"}`,
    `Disponibilidade para início: ${d.inicio}`,
  ].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== ""));
  const text = encodeURIComponent(linhas.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
}
