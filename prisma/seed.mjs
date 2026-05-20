import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const segmentDefaults = {
  "Saúde": {
    tone: "acolhedor, educativo, ético e responsável",
    keywords: ["saúde", "prevenção", "cuidado", "bem-estar", "atendimento humanizado"],
    services: ["avaliação", "consulta", "acompanhamento", "orientação preventiva"],
    ideas: ["mitos e verdades", "sinais de alerta", "dicas de prevenção", "rotina de cuidados"],
    visual: "limpo, humano, claro, com bastante respiro visual",
    colors: ["verde suave", "azul claro", "branco", "tons naturais"],
    icons: ["coração", "cruz", "folha", "pessoa"],
    compliance: "Evitar promessas de cura, diagnósticos diretos, antes e depois sensacionalista e linguagem que gere medo."
  },
  "Automotivo": {
    tone: "direto, técnico, confiável e orientado a performance",
    keywords: ["manutenção", "segurança", "performance", "diagnóstico", "veículo"],
    services: ["revisão", "diagnóstico", "manutenção preventiva", "troca de peças"],
    ideas: ["checklist de revisão", "sinais de problema", "dica de economia", "bastidores da oficina"],
    visual: "forte, técnico, com contraste e sensação de precisão",
    colors: ["preto", "vermelho", "cinza grafite", "amarelo"],
    icons: ["chave", "motor", "velocímetro", "carro"],
    compliance: "Evitar garantias absolutas de resultado sem inspeção técnica."
  },
  "Transporte e Logística": {
    tone: "forte, confiável, institucional e objetivo",
    keywords: ["logística", "segurança", "entrega", "frota", "rastreamento", "carga", "eficiência"],
    services: ["coleta", "entrega", "rastreamento", "armazenagem", "distribuição"],
    ideas: ["rota segura", "diferenciais da frota", "prazo e confiança", "bastidores da operação"],
    visual: "institucional, robusto, com linhas de movimento e mapas",
    colors: ["azul escuro", "laranja", "cinza", "branco"],
    icons: ["caminhão", "rota", "caixa", "pin de mapa"],
    compliance: "Evitar prometer prazos sem ressalvas operacionais e legais."
  },
  "Jurídico": {
    tone: "sóbrio, técnico, claro e ético",
    keywords: ["direito", "orientação", "segurança jurídica", "contrato", "processo"],
    services: ["consultoria", "parecer", "defesa", "planejamento jurídico"],
    ideas: ["direito explicado", "erros comuns", "prazo importante", "documentos necessários"],
    visual: "sóbrio, premium, institucional e com hierarquia editorial",
    colors: ["azul marinho", "dourado", "cinza", "branco"],
    icons: ["balança", "documento", "escudo", "assinatura"],
    compliance: "Evitar promessa de ganho de causa, captação irregular e linguagem sensacionalista."
  },
  "Financeiro": {
    tone: "consultivo, claro, confiável e orientado a resultado",
    keywords: ["gestão", "controle", "planejamento", "segurança", "economia"],
    services: ["diagnóstico financeiro", "planejamento", "relatórios", "consultoria"],
    ideas: ["indicador financeiro", "erro comum", "dica de controle", "benefício prático"],
    visual: "limpo, analítico, com gráficos simples e sensação de organização",
    colors: ["verde", "azul", "cinza", "branco"],
    icons: ["gráfico", "calculadora", "escudo", "moeda"],
    compliance: "Evitar promessa de rentabilidade ou economia garantida."
  },
  "Imobiliário e Construção": {
    tone: "profissional, aspiracional, claro e seguro",
    keywords: ["imóvel", "obra", "projeto", "acabamento", "investimento"],
    services: ["consultoria", "projeto", "venda", "execução", "acompanhamento"],
    ideas: ["antes de comprar", "detalhe de projeto", "tour visual", "valorização"],
    visual: "alto padrão, arquitetônico, com fotos amplas e tipografia elegante",
    colors: ["preto", "areia", "cinza", "dourado"],
    icons: ["casa", "planta", "chave", "régua"],
    compliance: "Evitar promessa de valorização garantida."
  },
  "Fitness e Bem-estar": {
    tone: "motivador, próximo, responsável e energético",
    keywords: ["treino", "saúde", "energia", "força", "rotina"],
    services: ["avaliação", "treino personalizado", "aula", "acompanhamento"],
    ideas: ["exercício da semana", "erro comum", "rotina saudável", "motivação"],
    visual: "dinâmico, com movimento, contraste e pessoas reais",
    colors: ["preto", "verde limão", "azul", "branco"],
    icons: ["halter", "raio", "cronômetro", "coração"],
    compliance: "Evitar promessas de resultado físico rápido ou garantido."
  },
  "Beleza e Estética": {
    tone: "elegante, próximo, confiante e cuidadoso",
    keywords: ["beleza", "autoestima", "resultado", "cuidado", "experiência"],
    services: ["procedimento", "avaliação", "tratamento", "manutenção"],
    ideas: ["cuidados pós-procedimento", "tendência", "benefício", "bastidores"],
    visual: "elegante, suave, premium e com foco em detalhes",
    colors: ["rose", "preto", "nude", "dourado"],
    icons: ["brilho", "rosto", "flor", "pincel"],
    compliance: "Evitar promessa de resultado e comparativos enganosos."
  },
  "Alimentação": {
    tone: "apetitoso, convidativo, leve e direto",
    keywords: ["sabor", "experiência", "pedido", "ingredientes", "delivery"],
    services: ["cardápio", "delivery", "reserva", "combo", "encomenda"],
    ideas: ["prato destaque", "ingrediente especial", "combo da semana", "bastidores da cozinha"],
    visual: "apetitoso, fotográfico, quente e com CTA forte",
    colors: ["vermelho", "amarelo", "preto", "creme"],
    icons: ["talheres", "fogo", "estrela", "sacola"],
    compliance: "Evitar alegações nutricionais sem base e preços desatualizados."
  },
  "Comércio": {
    tone: "comercial, claro, persuasivo e acessível",
    keywords: ["oferta", "produto", "novidade", "preço", "qualidade"],
    services: ["venda", "atendimento", "entrega", "condições especiais"],
    ideas: ["produto da semana", "comparativo", "oferta relâmpago", "dica de uso"],
    visual: "varejo organizado, preço legível e produto em destaque",
    colors: ["vermelho", "azul", "amarelo", "branco"],
    icons: ["etiqueta", "sacola", "carrinho", "estrela"],
    compliance: "Evitar oferta sem prazo, condição ou estoque quando aplicável."
  },
  "Serviços Técnicos": {
    tone: "técnico, prático, confiável e objetivo",
    keywords: ["conserto", "instalação", "manutenção", "segurança", "diagnóstico"],
    services: ["visita técnica", "instalação", "reparo", "manutenção preventiva"],
    ideas: ["sinal de problema", "dica de prevenção", "antes de chamar técnico", "serviço em destaque"],
    visual: "técnico, limpo, com ferramentas e prova de serviço",
    colors: ["azul", "laranja", "cinza", "preto"],
    icons: ["ferramenta", "raio", "engrenagem", "check"],
    compliance: "Evitar prometer orçamento sem avaliação."
  },
  "Educação": {
    tone: "didático, inspirador, claro e acolhedor",
    keywords: ["aprendizado", "desenvolvimento", "curso", "aula", "futuro"],
    services: ["aulas", "mentoria", "material didático", "acompanhamento"],
    ideas: ["dica de estudo", "benefício do curso", "depoimento", "bastidores da aula"],
    visual: "claro, organizado, com elementos educacionais e pessoas",
    colors: ["azul", "amarelo", "verde", "branco"],
    icons: ["livro", "lápis", "chapéu", "lâmpada"],
    compliance: "Evitar promessa de aprovação ou resultado garantido."
  },
  "Pet": {
    tone: "carinhoso, confiável, leve e educativo",
    keywords: ["pet", "cuidado", "saúde animal", "banho", "bem-estar"],
    services: ["consulta", "banho e tosa", "vacinação", "hotel", "adestramento"],
    ideas: ["cuidado da semana", "sinal de atenção", "rotina do pet", "serviço em destaque"],
    visual: "leve, afetivo, com fotos reais e cores vivas",
    colors: ["verde", "azul", "laranja", "branco"],
    icons: ["pata", "coração", "osso", "casa"],
    compliance: "Evitar orientação veterinária específica sem avaliação."
  },
  "Eventos": {
    tone: "emocional, elegante, celebrativo e organizado",
    keywords: ["evento", "experiência", "celebração", "produção", "memória"],
    services: ["planejamento", "produção", "locação", "decoração", "registro"],
    ideas: ["inspiração de evento", "checklist", "bastidores", "momento especial"],
    visual: "emocional, fotográfico, elegante e com detalhes premium",
    colors: ["dourado", "preto", "branco", "rose"],
    icons: ["calendário", "câmera", "taça", "estrela"],
    compliance: "Evitar promessa de disponibilidade sem confirmação de agenda."
  },
  "Marketing e Tecnologia": {
    tone: "moderno, estratégico, claro e inovador",
    keywords: ["estratégia", "tecnologia", "resultado", "automação", "crescimento"],
    services: ["consultoria", "desenvolvimento", "campanhas", "automação"],
    ideas: ["case", "dica estratégica", "ferramenta útil", "erro comum"],
    visual: "moderno, digital, com contraste e elementos de interface",
    colors: ["roxo", "azul", "preto", "verde"],
    icons: ["cursor", "código", "gráfico", "robô"],
    compliance: "Evitar promessa de resultado em tráfego, vendas ou crescimento."
  },
  "Representação e Distribuição": {
    tone: "comercial, institucional, objetivo e confiável",
    keywords: ["catálogo", "distribuição", "revenda", "produto", "parceria"],
    services: ["representação", "atacado", "catálogo", "negociação", "distribuição"],
    ideas: ["produto destaque", "linha de produtos", "condição comercial", "parceria"],
    visual: "catálogo premium, produto em destaque e layout comercial limpo",
    colors: ["azul", "cinza", "preto", "branco"],
    icons: ["caixa", "aperto de mãos", "catálogo", "caminhão"],
    compliance: "Evitar condições comerciais sem validade e disponibilidade."
  }
};

const segments = {
  "Saúde": [
    "Fisioterapia",
    "Psicologia",
    "Psiquiatria",
    "Odontologia",
    "Nutrição",
    "Fonoaudiologia",
    "Terapia Ocupacional",
    "Neuropsicologia",
    "Enfermagem",
    "Dermatologia",
    "Cardiologia",
    "Pediatria",
    "Ortopedia",
    "Ginecologia",
    "Oftalmologia",
    "Endocrinologia",
    "Gastroenterologia",
    "Clínica Médica"
  ],
  Automotivo: [
    "Oficina Mecânica",
    "Centro Automotivo",
    "Auto Elétrica",
    "Funilaria e Pintura",
    "Estética Automotiva",
    "Lavação Automotiva",
    "Guincho",
    "Auto Peças",
    "Concessionária",
    "Assistência Especializada BMW",
    "Assistência Especializada MINI",
    "Assistência Especializada Nissan",
    "Assistência Especializada Mercedes",
    "Assistência Especializada Audi",
    "Assistência Especializada Volkswagen"
  ],
  "Transporte e Logística": [
    "Transportadora",
    "Operador Logístico",
    "Agenciamento de Cargas",
    "Frota Própria",
    "Mudanças",
    "Guincho Pesado",
    "Armazenagem",
    "Distribuição",
    "Entregas Urbanas",
    "Transporte Fracionado",
    "Transporte de Carga Fechada"
  ],
  Jurídico: [
    "Advocacia Trabalhista",
    "Advocacia Previdenciária",
    "Advocacia Criminal",
    "Advocacia Empresarial",
    "Direito de Família",
    "Direito Tributário",
    "Direito Imobiliário",
    "Direito do Consumidor"
  ],
  Financeiro: [
    "Contabilidade",
    "BPO Financeiro",
    "Consultoria Financeira",
    "Corretora de Seguros",
    "Consórcios",
    "Planejamento Financeiro"
  ],
  "Imobiliário e Construção": [
    "Imobiliária",
    "Corretor de Imóveis",
    "Construtora",
    "Incorporadora",
    "Engenharia",
    "Arquitetura",
    "Design de Interiores",
    "Materiais de Construção"
  ],
  "Fitness e Bem-estar": [
    "Academia",
    "Personal Trainer",
    "Pilates",
    "Crossfit",
    "Yoga",
    "Estúdio Funcional",
    "Massoterapia",
    "Estética Corporal"
  ],
  "Beleza e Estética": [
    "Salão de Beleza",
    "Barbearia",
    "Clínica Estética",
    "Harmonização Facial",
    "Designer de Sobrancelhas",
    "Lash Designer",
    "Manicure",
    "Micropigmentação",
    "Depilação"
  ],
  Alimentação: [
    "Restaurante",
    "Hamburgueria",
    "Pizzaria",
    "Cafeteria",
    "Confeitaria",
    "Padaria",
    "Delivery",
    "Food Truck",
    "Marmitaria"
  ],
  Comércio: [
    "Loja de Roupas",
    "Calçados",
    "Ótica",
    "Joalheria",
    "Eletrônicos",
    "Informática",
    "Móveis",
    "Ferragens",
    "Materiais Elétricos",
    "Mercado",
    "Farmácia"
  ],
  "Serviços Técnicos": [
    "Assistência Técnica",
    "Celulares",
    "Informática",
    "Refrigeração",
    "Energia Solar",
    "Elétrica",
    "Hidráulica",
    "Segurança Eletrônica",
    "Marcenaria",
    "Serralheria"
  ],
  Educação: [
    "Escola",
    "Curso Profissionalizante",
    "Escola de Idiomas",
    "Reforço Escolar",
    "Faculdade",
    "Treinamentos Corporativos",
    "Educação Infantil"
  ],
  Pet: ["Clínica Veterinária", "Pet Shop", "Banho e Tosa", "Hotel Pet", "Adestramento"],
  Eventos: [
    "Cerimonialista",
    "Casa de Eventos",
    "Buffet",
    "Fotografia",
    "Filmagem",
    "Decoração",
    "DJ",
    "Locação de Equipamentos"
  ],
  "Marketing e Tecnologia": [
    "Agência de Marketing",
    "Social Media",
    "Designer",
    "Desenvolvimento de Sites",
    "Software House",
    "SaaS",
    "Consultoria em IA",
    "Tráfego Pago"
  ],
  "Representação e Distribuição": [
    "Representação Comercial",
    "Distribuidora",
    "Importadora",
    "Atacadista",
    "Revenda",
    "Catálogo Comercial"
  ]
};

const specialtyOverrides = {
  Psicologia: {
    keywords: ["ansiedade", "autoestima", "terapia", "saúde emocional", "autocuidado", "relacionamento", "acolhimento"],
    recommendedTone: "acolhedor, humano, ético, claro e responsável",
    complianceNotes: "Evitar promessas de cura, diagnósticos diretos e linguagem sensacionalista."
  },
  Odontologia: {
    keywords: ["sorriso", "prevenção", "clareamento", "implantes", "ortodontia", "saúde bucal"],
    recommendedTone: "profissional, confiante, educativo e acessível",
    complianceNotes: "Evitar prometer resultado estético, dor zero ou usar antes e depois sem cuidado regulatório."
  },
  Transportadora: {
    keywords: ["logística", "segurança", "entrega", "frota", "rastreamento", "carga", "eficiência"],
    recommendedTone: "forte, confiável, institucional e objetivo"
  }
};

const templates = [
  ["Saúde Premium Limpo", "Saúde", null, "FEED_RETRATO"],
  ["Saúde Educativo Humanizado", "Saúde", null, "FEED_QUADRADO"],
  ["Psicologia Acolhedor Minimalista", "Saúde", "Psicologia", "FEED_RETRATO"],
  ["Odontologia Sorriso Premium", "Saúde", "Odontologia", "FEED_QUADRADO"],
  ["Transporte Forte Institucional", "Transporte e Logística", "Transportadora", "FEED_RETRATO"],
  ["Logística Impacto Visual", "Transporte e Logística", null, "REELS_STORIES"],
  ["Automotivo Performance Premium", "Automotivo", null, "FEED_RETRATO"],
  ["Oficina Oferta Direta", "Automotivo", "Oficina Mecânica", "FEED_QUADRADO"],
  ["Beleza Elegante", "Beleza e Estética", null, "FEED_RETRATO"],
  ["Alimentação Apetitosa", "Alimentação", null, "FEED_QUADRADO"],
  ["Jurídico Sóbrio Profissional", "Jurídico", null, "FEED_RETRATO"],
  ["Imobiliário Alto Padrão", "Imobiliário e Construção", null, "FEED_RETRATO"],
  ["Comércio Oferta Varejo", "Comércio", null, "FEED_QUADRADO"],
  ["Tecnologia Moderno", "Marketing e Tecnologia", null, "REELS_STORIES"],
  ["Representação Catálogo Premium", "Representação e Distribuição", null, "FEED_RETRATO"]
];

async function seedPlans() {
  await prisma.plan.upsert({
    where: { name: "Free" },
    update: {
      description: "Plano inicial para validar o fluxo de conteudo.",
      monthlyPrice: "0",
      monthlyPostLimit: 5,
      monthlyCaptionLimit: 5,
      monthlyCalendarLimit: 1,
      monthlyArtLimit: 1,
      monthlyAnalysisLimit: 1,
      monthlyCampaignLimit: 0,
      isActive: true
    },
    create: {
      name: "Free",
      description: "Plano inicial para validar o fluxo de conteudo.",
      monthlyPrice: "0",
      monthlyPostLimit: 5,
      monthlyCaptionLimit: 5,
      monthlyCalendarLimit: 1,
      monthlyArtLimit: 1,
      monthlyAnalysisLimit: 1,
      monthlyCampaignLimit: 0,
      isActive: true
    }
  });

  await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {
      description: "Plano profissional para operacao comercial.",
      monthlyPrice: "49.90",
      monthlyPostLimit: 30,
      monthlyCaptionLimit: 30,
      monthlyCalendarLimit: 5,
      monthlyArtLimit: 15,
      monthlyAnalysisLimit: 5,
      monthlyCampaignLimit: 3,
      isActive: true
    },
    create: {
      name: "Pro",
      description: "Plano profissional para operacao comercial.",
      monthlyPrice: "49.90",
      monthlyPostLimit: 30,
      monthlyCaptionLimit: 30,
      monthlyCalendarLimit: 5,
      monthlyArtLimit: 15,
      monthlyAnalysisLimit: 5,
      monthlyCampaignLimit: 3,
      isActive: true
    }
  });
}

async function seedSegmentsAndSpecialties() {
  const segmentByName = new Map();
  const specialtyByName = new Map();

  for (const [segmentName, specialties] of Object.entries(segments)) {
    const defaults = segmentDefaults[segmentName];
    const segment = await prisma.businessSegment.upsert({
      where: { slug: slugify(segmentName) },
      update: {
        name: segmentName,
        description: `Segmento ${segmentName} com contexto profissional para conteudo e artes.`,
        isActive: true
      },
      create: {
        name: segmentName,
        slug: slugify(segmentName),
        description: `Segmento ${segmentName} com contexto profissional para conteudo e artes.`,
        isActive: true
      }
    });

    segmentByName.set(segmentName, segment);

    for (const specialtyName of specialties) {
      const override = specialtyOverrides[specialtyName] ?? {};
      const specialty = await prisma.businessSpecialty.upsert({
        where: { slug: slugify(`${segmentName}-${specialtyName}`) },
        update: {
          segmentId: segment.id,
          name: specialtyName,
          description: `${specialtyName} dentro do segmento ${segmentName}.`,
          keywords: override.keywords ?? [...defaults.keywords, specialtyName.toLowerCase()],
          recommendedTone: override.recommendedTone ?? defaults.tone,
          commonServices: defaults.services,
          contentIdeas: defaults.ideas,
          visualStyle: defaults.visual,
          colorSuggestions: defaults.colors,
          iconSuggestions: defaults.icons,
          complianceNotes: override.complianceNotes ?? defaults.compliance,
          isActive: true
        },
        create: {
          segmentId: segment.id,
          name: specialtyName,
          slug: slugify(`${segmentName}-${specialtyName}`),
          description: `${specialtyName} dentro do segmento ${segmentName}.`,
          keywords: override.keywords ?? [...defaults.keywords, specialtyName.toLowerCase()],
          recommendedTone: override.recommendedTone ?? defaults.tone,
          commonServices: defaults.services,
          contentIdeas: defaults.ideas,
          visualStyle: defaults.visual,
          colorSuggestions: defaults.colors,
          iconSuggestions: defaults.icons,
          complianceNotes: override.complianceNotes ?? defaults.compliance,
          isActive: true
        }
      });

      specialtyByName.set(specialtyName, specialty);
    }
  }

  return { segmentByName, specialtyByName };
}

async function seedTemplates(segmentByName, specialtyByName) {
  for (const [name, segmentName, specialtyName, format] of templates) {
    const segment = segmentName ? segmentByName.get(segmentName) : null;
    const specialty = specialtyName ? specialtyByName.get(specialtyName) : null;
    const defaults = segmentName ? segmentDefaults[segmentName] : segmentDefaults.Comércio;

    await prisma.artTemplate.upsert({
      where: { slug: slugify(name) },
      update: {
        name,
        segmentId: segment?.id ?? null,
        specialtyId: specialty?.id ?? null,
        format,
        description: `Template conceitual para ${name}.`,
        visualStyle: specialty?.visualStyle ?? defaults.visual,
        layoutHints: "Manter hierarquia clara, CTA legivel, area segura para texto e destaque para imagem principal.",
        previewUrl: null,
        isActive: true
      },
      create: {
        name,
        slug: slugify(name),
        segmentId: segment?.id ?? null,
        specialtyId: specialty?.id ?? null,
        format,
        description: `Template conceitual para ${name}.`,
        visualStyle: specialty?.visualStyle ?? defaults.visual,
        layoutHints: "Manter hierarquia clara, CTA legivel, area segura para texto e destaque para imagem principal.",
        previewUrl: null,
        isActive: true
      }
    });
  }
}

await seedPlans();
const { segmentByName, specialtyByName } = await seedSegmentsAndSpecialties();
await seedTemplates(segmentByName, specialtyByName);

await prisma.$disconnect();
