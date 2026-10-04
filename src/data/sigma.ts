// Conteúdo da landing page principal (v3). Edite aqui textos e números.

export const MARQUEE_CITIES = ["Foz do Iguaçu", "Gramado", "Balneário Camboriú", "Curitiba"];

export const STATS = [
  { value: 150, unit: "%", label: "Aumento médio de receita", decimals: 0 },
  { value: 100, unit: "+", label: "Imóveis sob gestão", decimals: 0 },
  { value: 92, unit: "%", label: "Taxa média de ocupação", decimals: 0 },
  { value: 4.9, unit: "★", label: "Avaliação dos hóspedes", decimals: 1 },
];

export const STEPS = [
  { n: "01", t: "Análise gratuita", d: "Avaliamos o potencial real do seu imóvel e apresentamos a projeção de receita." },
  { n: "02", t: "Vistoria e fotos", d: "Padronização hoteleira e fotos profissionais que sustentam a diária premium." },
  { n: "03", t: "Anúncio e preço dinâmico", d: "Anúncios otimizados em múltiplas plataformas e precificação ajustada todo dia." },
  { n: "04", t: "Repasse mensal", d: "Operação 24/7 por nossa conta, com relatório transparente e repasse na sua conta." },
];

export const COMPARE = {
  temporada: {
    title: "Aluguel por temporada", tag: "Recomendado", liq: "R$ 9.400", w: 100,
    bruta: "R$ 11.800", custos: "- R$ 2.400", ocup: "78% médio", val: "Alta (premium)",
    points: [
      { t: "Pagamento antecipado por hóspede" },
      { t: "Precificação dinâmica diária" },
      { t: "Crescimento contínuo de receita" },
    ],
  },
  tradicional: {
    title: "Aluguel tradicional", tag: "Mensal fixo", liq: "R$ 3.050", w: 32,
    bruta: "R$ 3.500", custos: "- R$ 450", ocup: "12 meses fixos", val: "Baixa",
    points: [
      { t: "Inadimplência e calote" },
      { t: "Dor de cabeça com inquilinos" },
      { t: "Receita estagnada por anos" },
    ],
  },
};

export const GESTAO = [
  "Fotos profissionais e anúncios",
  "Precificação dinâmica diária",
  "Atendimento 24/7 ao hóspede",
  "Limpeza e enxoval premium",
  "Manutenção preventiva",
  "Relatórios mensais transparentes",
];

export const MENTORIA = [
  "Posicionamento de alto valor",
  "Pricing e revenue management",
  "Estratégias validadas e cases reais",
  "Plano de escala 90 dias",
  "Comunidade exclusiva de anfitriões",
  "Mentoria 1:1 com fundadores",
];

export const CASES = [
  { local: "Suíte 12m² · Balneário Camboriú", before: "R$ 2.800", after: "R$ 7.200", lift: "+157%", path: "M0 46 C 50 44, 90 38, 130 30 S 210 22, 250 12 S 285 6, 300 4" },
  { local: "Casa 3 quartos · Foz do Iguaçu", before: "R$ 6.500", after: "R$ 16.400", lift: "+152%", path: "M0 44 C 40 46, 80 34, 120 32 S 200 20, 245 14 S 285 8, 300 6" },
  { local: "Stúdio 35m² · Foz do Iguaçu", before: "R$ 1.900", after: "R$ 5.100", lift: "+168%", path: "M0 48 C 60 46, 100 40, 140 28 S 220 24, 260 10 S 290 4, 300 3" },
];

export const SIM_MULTIPLIER = 2.5; // multiplicador médio usado no simulador
