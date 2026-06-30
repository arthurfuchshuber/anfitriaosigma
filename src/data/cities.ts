import type { CityContent } from "@/pages/CityPage";

export const CITIES: Record<string, CityContent> = {
  "foz-do-iguacu": {
    slug: "foz-do-iguacu",
    city: "Foz do Iguaçu",
    state: "Paraná",
    stateAbbr: "PR",
    region: "Sul do Brasil",
    intro:
      "Anfitrião profissional em Foz do Iguaçu: gerimos studios e casas urbanas com diárias premium próximas às Cataratas, ao Marco das Três Fronteiras e à região do shopping. Operação completa, hospedagem padrão hotelaria e receita maximizada em todas as estações.",
    highlights: [
      "Precificação dinâmica considerando alta temporada, feriados, eventos e câmbio do turismo internacional",
      "Anúncios otimizados em Airbnb, Booking e plataformas de temporada com fotos profissionais",
      "Check-in 24h e atendimento humano em horário comercial — resposta em até 1h",
      "Limpeza, lavanderia e enxoval padrão hotel após cada hospedagem",
      "Relatórios mensais com receita líquida, ocupação e diária média do seu imóvel",
      "Equipe local em Foz do Iguaçu para resolver qualquer ocorrência presencialmente",
    ],
    stats: [
      { v: "+150%", l: "Receita média" },
      { v: "4.9★", l: "Avaliação hóspedes" },
      { v: "85%+", l: "Ocupação alta temporada" },
    ],
    testimonial: {
      quote:
        "Meu studio em Foz do Iguaçu rendia bem abaixo do potencial. Em 3 meses com a Anfitrião Sigma a receita mais que dobrou e eu finalmente parei de me preocupar com check-in e limpeza.",
      author: "Proprietária",
      role: "Studio 35m²",
    },
    neighborhoods: ["Centro", "Vila Yolanda", "Jardim Iguaçu", "Região das Cataratas", "Vila A", "Próximo ao shopping"],
  },
  gramado: {
    slug: "gramado",
    city: "Gramado",
    state: "Rio Grande do Sul",
    stateAbbr: "RS",
    region: "Serra Gaúcha",
    intro:
      "Anfitrião profissional em Gramado: gestão de Airbnb e temporada para quem quer aproveitar o turismo o ano inteiro — Natal Luz, Festival de Cinema, alta temporada de inverno e feriados. Operação premium, lucro real.",
    highlights: [
      "Estratégia de precificação para Natal Luz, inverno e feriados prolongados da Serra Gaúcha",
      "Anúncios otimizados destacando lareira, hidromassagem e diferenciais de cabana / chalé",
      "Atendimento padrão hotelaria em português, espanhol e inglês",
      "Limpeza e enxoval premium após cada estadia, com inspeção fotográfica",
      "Equipe local para manutenção, jardinagem e suporte presencial",
      "Relatórios mensais transparentes de receita, ocupação e diária média",
    ],
    stats: [
      { v: "+150%", l: "Receita média" },
      { v: "4.9★", l: "Avaliação hóspedes" },
      { v: "90%+", l: "Ocupação no Natal Luz" },
    ],
    testimonial: {
      quote:
        "Tinha uma casa parada boa parte do ano. A Anfitrião Sigma profissionalizou tudo — anúncio, fotos, precificação — e hoje o imóvel é minha melhor aplicação.",
      author: "Proprietário",
      role: "Casa 3 dormitórios",
    },
    neighborhoods: ["Centro de Gramado", "Bavária", "Avenida das Hortênsias", "Planalto", "Próximo ao Mini Mundo", "Várzea Grande"],
  },
  "balneario-camboriu": {
    slug: "balneario-camboriu",
    city: "Balneário Camboriú",
    state: "Santa Catarina",
    stateAbbr: "SC",
    region: "Litoral Norte de Santa Catarina",
    intro:
      "Anfitrião profissional em Balneário Camboriú: gerimos studios e apartamentos frente-mar e a poucas quadras da praia, com hospedagem padrão hotelaria e receita maximizada em alta e baixa temporada.",
    highlights: [
      "Precificação dinâmica para réveillon, carnaval, alta temporada e eventos da cidade",
      "Anúncios otimizados em Airbnb e Booking destacando vista mar, sacada e localização",
      "Check-in 24h, atendimento humano e suporte multi-idioma",
      "Limpeza profissional e enxoval padrão hotel após cada hospedagem",
      "Manutenção preventiva, vistoria e gestão de condomínio",
      "Relatórios mensais de receita, ocupação e diária média",
    ],
    stats: [
      { v: "+150%", l: "Receita média" },
      { v: "4.9★", l: "Avaliação hóspedes" },
      { v: "95%+", l: "Ocupação no réveillon" },
    ],
    testimonial: {
      quote:
        "Estou impressionada com a receita do meu studio em Balneário Camboriú depois que entrei na Anfitrião Sigma. Profissionalismo do começo ao fim.",
      author: "Proprietária",
      role: "Studio 38m²",
    },
    neighborhoods: ["Barra Sul", "Centro", "Avenida Atlântica", "Praia Central", "Pioneiros", "Praia Brava"],
  },
  curitiba: {
    slug: "curitiba",
    city: "Curitiba",
    state: "Paraná",
    stateAbbr: "PR",
    region: "Sul do Brasil",
    intro:
      "Anfitrião profissional em Curitiba: gestão de Airbnb e temporada para studios e apartamentos urbanos com alta demanda corporativa, médica e de turismo. Operação completa e hospedagem padrão hotelaria.",
    highlights: [
      "Estratégia para hóspede corporativo, médico (hospitais Pequeno Príncipe, Erasto Gaertner) e de eventos",
      "Anúncios otimizados destacando localização, Wi-Fi e workspace para nômades digitais",
      "Atendimento humano em horário comercial e suporte 24h ao hóspede",
      "Limpeza, lavanderia e enxoval padrão hotel após cada estadia",
      "Equipe local para manutenção e ocorrências presenciais",
      "Relatórios mensais transparentes de receita, ocupação e diária média",
    ],
    stats: [
      { v: "+150%", l: "Receita média" },
      { v: "4.9★", l: "Avaliação hóspedes" },
      { v: "80%+", l: "Ocupação anual" },
    ],
    testimonial: {
      quote:
        "Meu apartamento no centro de Curitiba estava no aluguel tradicional rendendo pouco. Migrei para temporada com a Anfitrião Sigma e o aumento de receita foi imediato.",
      author: "Proprietário",
      role: "Apartamento 1 dormitório",
    },
    neighborhoods: ["Centro", "Batel", "Água Verde", "Centro Cívico", "Champagnat", "Próximo aos hospitais"],
  },
};
