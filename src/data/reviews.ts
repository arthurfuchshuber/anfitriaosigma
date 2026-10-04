// ============================================================
// AVALIAÇÕES — para adicionar ou remover, edite os arrays abaixo.
// (Etapa seguinte prevista: mover para tabela no Lovable Cloud com
//  área restrita da equipe, login Google do domínio.)
// ============================================================

export type OwnerReview = { id: number; name: string; where: string; stars: number; text: string };
export type GuestReview = { id: number; name: string; src: string; where: string; stars: number; text: string };

export const OWNER_REVIEWS: OwnerReview[] = [
  { id: 1, name: "Patrícia Regina", where: "Proprietária · Foz do Iguaçu", stars: 5, text: "Pessoal, eu realmente nunca vi nada parecido com este valor que vocês reservaram para este período. Estou impressionada com o resultado." },
  { id: 2, name: "Camila Albuquerque", where: "Proprietária · Balneário Camboriú", stars: 5, text: "Saí de um aluguel de R$ 3.200 fixo para uma média de R$ 7.800/mês. A operação é impecável e os hóspedes amam o imóvel." },
  { id: 3, name: "Lucas Heinen", where: "Aluno da Mentoria · Foz do Iguaçu", stars: 5, text: "A mentoria me deu clareza sobre pricing e posicionamento. Em 90 dias estruturei o segundo imóvel com método." },
];

// A seção de hóspedes só aparece quando houver ao menos uma avaliação real.
// Copie o comentário da plataforma (Airbnb/Booking) e use o modelo:
// { id: 11, name: "Nome", src: "Airbnb", where: "Imóvel · Cidade", stars: 5, text: "Comentário do hóspede." },
export const GUEST_REVIEWS: GuestReview[] = [];

export const starString = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export const initials = (name: string) =>
  name.replace(/[[\]]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
