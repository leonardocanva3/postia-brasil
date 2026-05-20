import { ArtFormat, ArtStyle } from "@prisma/client";

export type RealArtTemplate = Readonly<{
  id: string;
  name: string;
  recommendedSegment: string;
  recommendedSpecialty?: string;
  supportedFormats: ArtFormat[];
  recommendedStyle: ArtStyle;
  layoutStructure: string;
  logoPlacement: string;
  imagePlacement: string;
  titlePlacement: string;
  subtitlePlacement: string;
  ctaPlacement: string;
  textLevel: "baixo" | "medio" | "alto";
  graphicElements: string[];
  compositionNotes: string;
}>;

const allFormats = [
  ArtFormat.FEED_QUADRADO,
  ArtFormat.FEED_RETRATO,
  ArtFormat.REELS_STORIES
];

export const REAL_ART_TEMPLATES: Record<string, RealArtTemplate> = {
  SAUDE_PREMIUM_LIMPO: {
    id: "SAUDE_PREMIUM_LIMPO",
    name: "Saude Premium Limpo",
    recommendedSegment: "Saude",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.MEDICO_PREMIUM,
    layoutStructure: "fundo claro, coluna de texto limpa e imagem profissional lateral",
    logoPlacement: "topo esquerdo com respiro",
    imagePlacement: "lateral direita ou faixa inferior com recorte suave",
    titlePlacement: "centro esquerdo em tamanho grande",
    subtitlePlacement: "abaixo do titulo em bloco curto",
    ctaPlacement: "rodape em botao discreto",
    textLevel: "baixo",
    graphicElements: ["linhas finas", "blocos translúcidos", "ícones médicos discretos"],
    compositionNotes: "Transmitir confiança e higiene visual sem parecer genérico."
  },
  PSICOLOGIA_ACOLHEDOR_MINIMALISTA: {
    id: "PSICOLOGIA_ACOLHEDOR_MINIMALISTA",
    name: "Psicologia Acolhedor Minimalista",
    recommendedSegment: "Saude",
    recommendedSpecialty: "Psicologia",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.ELEGANCIA_FEMININA,
    layoutStructure: "muito espaço em branco, frase acolhedora e imagem humana suave",
    logoPlacement: "topo central ou topo esquerdo pequeno",
    imagePlacement: "imagem humana em recorte orgânico lateral ou inferior",
    titlePlacement: "centro com frase curta e emocional",
    subtitlePlacement: "abaixo do titulo com apoio ético e objetivo",
    ctaPlacement: "inferior discreto para agendamento",
    textLevel: "baixo",
    graphicElements: ["formas orgânicas", "linhas suaves", "texturas leves"],
    compositionNotes: "Evitar qualquer promessa de cura ou tom sensacionalista."
  },
  ODONTOLOGIA_SORRISO_PREMIUM: {
    id: "ODONTOLOGIA_SORRISO_PREMIUM",
    name: "Odontologia Sorriso Premium",
    recommendedSegment: "Saude",
    recommendedSpecialty: "Odontologia",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.MEDICO_PREMIUM,
    layoutStructure: "fundo branco ou azul claro, sorriso em destaque e bloco premium",
    logoPlacement: "topo esquerdo",
    imagePlacement: "sorriso ou consultório em destaque lateral",
    titlePlacement: "lado oposto à imagem com headline forte",
    subtitlePlacement: "abaixo do título com benefício educativo",
    ctaPlacement: "inferior direito para agendamento",
    textLevel: "medio",
    graphicElements: ["brilhos discretos", "linhas curvas", "selo de cuidado"],
    compositionNotes: "Usar branco, azul, dourado ou verde sem prometer resultado."
  },
  TRANSPORTE_FORTE_INSTITUCIONAL: {
    id: "TRANSPORTE_FORTE_INSTITUCIONAL",
    name: "Transporte Forte Institucional",
    recommendedSegment: "Transporte e Logistica",
    recommendedSpecialty: "Transportadora",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.LOGISTICA_FORTE,
    layoutStructure: "frota ou caminhão dominante com faixa institucional de texto",
    logoPlacement: "topo direito bem visível",
    imagePlacement: "imagem ampla de frota no fundo ou base",
    titlePlacement: "centro esquerdo em caixa alta",
    subtitlePlacement: "abaixo do título com prova de confiança",
    ctaPlacement: "rodape em faixa forte",
    textLevel: "medio",
    graphicElements: ["linhas de movimento", "setas", "mapa sutil"],
    compositionNotes: "Passar escala, segurança e operação robusta."
  },
  LOGISTICA_IMPACTO_VISUAL: {
    id: "LOGISTICA_IMPACTO_VISUAL",
    name: "Logistica Impacto Visual",
    recommendedSegment: "Transporte e Logistica",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.LOGISTICA_FORTE,
    layoutStructure: "fundo com mapa, rota ou estrada e blocos de entrega",
    logoPlacement: "topo esquerdo",
    imagePlacement: "estrada, rota ou operador em perspectiva",
    titlePlacement: "centro com grande impacto",
    subtitlePlacement: "bloco curto próximo ao título",
    ctaPlacement: "inferior com alto contraste",
    textLevel: "medio",
    graphicElements: ["ícones de entrega", "pins de mapa", "linhas de rota"],
    compositionNotes: "Criar sensação de movimento e eficiência."
  },
  AUTOMOTIVO_PERFORMANCE_PREMIUM: {
    id: "AUTOMOTIVO_PERFORMANCE_PREMIUM",
    name: "Automotivo Performance Premium",
    recommendedSegment: "Automotivo",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.AUTOMOTIVO_PERFORMANCE,
    layoutStructure: "fundo escuro, peça ou carro em destaque e luz de recorte",
    logoPlacement: "topo esquerdo em contraste",
    imagePlacement: "carro ou peça ocupando base/lateral",
    titlePlacement: "centro superior em tipografia forte",
    subtitlePlacement: "faixa técnica abaixo do título",
    ctaPlacement: "rodape direito com ação direta",
    textLevel: "medio",
    graphicElements: ["texturas metálicas", "diagonais", "linhas de velocidade"],
    compositionNotes: "Usar alto contraste e sensação premium técnica."
  },
  OFICINA_OFERTA_DIRETA: {
    id: "OFICINA_OFERTA_DIRETA",
    name: "Oficina Oferta Direta",
    recommendedSegment: "Automotivo",
    recommendedSpecialty: "Oficina Mecanica",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.PROMOCIONAL,
    layoutStructure: "layout promocional com serviço em destaque e CTA WhatsApp",
    logoPlacement: "topo esquerdo",
    imagePlacement: "serviço, mecânico ou peça no lado direito",
    titlePlacement: "topo/centro com chamada grande",
    subtitlePlacement: "lista curta de itens inclusos",
    ctaPlacement: "inferior em botão forte com WhatsApp",
    textLevel: "alto",
    graphicElements: ["ícones de mecânica", "selos", "setas", "faixas de oferta"],
    compositionNotes: "Organizar preço/condição sem poluir demais."
  },
  BELEZA_ELEGANTE: {
    id: "BELEZA_ELEGANTE",
    name: "Beleza Elegante",
    recommendedSegment: "Beleza e Estetica",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.ELEGANCIA_FEMININA,
    layoutStructure: "visual feminino, limpo, sofisticado e focado em resultado",
    logoPlacement: "topo central pequeno",
    imagePlacement: "profissional ou resultado em destaque lateral",
    titlePlacement: "centro em tipografia elegante",
    subtitlePlacement: "abaixo com promessa responsável de experiência",
    ctaPlacement: "inferior discreto-moderado",
    textLevel: "baixo",
    graphicElements: ["brilhos finos", "formas orgânicas", "detalhes rose/dourado"],
    compositionNotes: "Valorizar autoestima e cuidado sem exagerar resultados."
  },
  ALIMENTACAO_APETITOSA: {
    id: "ALIMENTACAO_APETITOSA",
    name: "Alimentacao Apetitosa",
    recommendedSegment: "Alimentacao",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.IMPACTO_COMERCIAL,
    layoutStructure: "foto do produto grande com faixa de texto e CTA direto",
    logoPlacement: "topo esquerdo ou selo sobre imagem",
    imagePlacement: "produto ocupando metade ou mais da arte",
    titlePlacement: "área de alto contraste ao lado do produto",
    subtitlePlacement: "curto, com sabor/ingrediente ou benefício",
    ctaPlacement: "inferior em botão forte",
    textLevel: "medio",
    graphicElements: ["texturas quentes", "selos", "ícones de delivery"],
    compositionNotes: "Fazer a comida parecer protagonista, com cores quentes."
  },
  JURIDICO_SOBRIO_PROFISSIONAL: {
    id: "JURIDICO_SOBRIO_PROFISSIONAL",
    name: "Juridico Sobrio Profissional",
    recommendedSegment: "Juridico",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.ALTO_PADRAO,
    layoutStructure: "azul escuro, cinza e branco com pouca informação",
    logoPlacement: "topo esquerdo ou rodape discreto",
    imagePlacement: "imagem institucional ou textura abstrata no fundo",
    titlePlacement: "centro esquerdo com autoridade",
    subtitlePlacement: "abaixo com explicação curta",
    ctaPlacement: "inferior discreto",
    textLevel: "baixo",
    graphicElements: ["linhas finas", "balança discreta", "blocos sóbrios"],
    compositionNotes: "Evitar promessa de resultado jurídico."
  },
  IMOBILIARIO_ALTO_PADRAO: {
    id: "IMOBILIARIO_ALTO_PADRAO",
    name: "Imobiliario Alto Padrao",
    recommendedSegment: "Imobiliario e Construcao",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.ALTO_PADRAO,
    layoutStructure: "foto do imóvel em destaque com faixa premium de texto",
    logoPlacement: "topo esquerdo",
    imagePlacement: "imóvel ocupando fundo ou lateral principal",
    titlePlacement: "sobre faixa escura/translúcida",
    subtitlePlacement: "abaixo do título com localização ou benefício",
    ctaPlacement: "inferior direito elegante",
    textLevel: "baixo",
    graphicElements: ["linhas arquitetônicas", "molduras finas", "detalhes dourados"],
    compositionNotes: "Criar desejo sem prometer valorização garantida."
  },
  COMERCIO_OFERTA_VAREJO: {
    id: "COMERCIO_OFERTA_VAREJO",
    name: "Comercio Oferta Varejo",
    recommendedSegment: "Comercio",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.PROMOCIONAL,
    layoutStructure: "preço/oferta em destaque com produto e urgência moderada",
    logoPlacement: "topo esquerdo",
    imagePlacement: "produto central ou lateral",
    titlePlacement: "topo com benefício ou oferta",
    subtitlePlacement: "condição curta e objetiva",
    ctaPlacement: "inferior em bloco forte",
    textLevel: "alto",
    graphicElements: ["etiquetas", "selos", "setas", "blocos coloridos"],
    compositionNotes: "Alto contraste, mas manter legibilidade de condição e CTA."
  },
  TECNOLOGIA_MODERNO: {
    id: "TECNOLOGIA_MODERNO",
    name: "Tecnologia Moderno",
    recommendedSegment: "Marketing e Tecnologia",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.CLEAN_MODERNO,
    layoutStructure: "gradientes, elementos digitais e interface abstrata",
    logoPlacement: "topo esquerdo",
    imagePlacement: "mockup, interface ou elemento futurista lateral",
    titlePlacement: "centro esquerdo com grande clareza",
    subtitlePlacement: "abaixo com benefício estratégico",
    ctaPlacement: "inferior em botão moderno",
    textLevel: "medio",
    graphicElements: ["gradientes", "linhas digitais", "cards de interface", "pontos de conexão"],
    compositionNotes: "Visual futurista sem virar peça confusa ou genérica."
  },
  REPRESENTACAO_CATALOGO_PREMIUM: {
    id: "REPRESENTACAO_CATALOGO_PREMIUM",
    name: "Representacao Catalogo Premium",
    recommendedSegment: "Representacao e Distribuicao",
    supportedFormats: allFormats,
    recommendedStyle: ArtStyle.CORPORATIVO,
    layoutStructure: "produto em destaque com layout limpo de catálogo",
    logoPlacement: "topo esquerdo",
    imagePlacement: "produto central em fundo claro",
    titlePlacement: "topo ou lateral com texto comercial direto",
    subtitlePlacement: "lista curta de diferenciais",
    ctaPlacement: "inferior para contato comercial",
    textLevel: "medio",
    graphicElements: ["linhas de catálogo", "selos discretos", "ícones comerciais"],
    compositionNotes: "Valorizar produto e clareza comercial."
  }
};

export function listRealArtTemplates() {
  return Object.values(REAL_ART_TEMPLATES);
}

export function getRealArtTemplate(id: string) {
  return REAL_ART_TEMPLATES[id] ?? null;
}
