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
