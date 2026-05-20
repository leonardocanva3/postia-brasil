import { ArtStyle } from "@prisma/client";

export type ArtStyleDefinition = Readonly<{
  value: ArtStyle;
  name: string;
  description: string;
  visualStyle: string;
  typographyStyle: string;
  contrastLevel: string;
  textDensity: string;
  ctaIntensity: string;
  visualBehavior: string;
  iconStyle: string;
  compositionHints: string;
}>;

export const ART_STYLES: Record<ArtStyle, ArtStyleDefinition> = {
  [ArtStyle.PREMIUM_LUXO]: {
    value: ArtStyle.PREMIUM_LUXO,
    name: "Premium Luxo",
    description: "elegante, sofisticado e refinado",
    visualStyle: "minimalista com alto valor percebido",
    typographyStyle: "serifada premium ou sans elegante com espaco generoso",
    contrastLevel: "medio-alto com tons profundos e detalhes finos",
    textDensity: "baixo",
    ctaIntensity: "discreto",
    visualBehavior: "poucos elementos, respiro amplo, acabamento editorial",
    iconStyle: "icones lineares finos ou monogramas discretos",
    compositionHints: "usar margens amplas, hierarquia calma e destaque para uma frase principal"
  },
  [ArtStyle.CLEAN_MODERNO]: {
    value: ArtStyle.CLEAN_MODERNO,
    name: "Clean Moderno",
    description: "claro, atual e organizado",
    visualStyle: "layout limpo com blocos bem definidos",
    typographyStyle: "sans moderna, legivel e bem espaçada",
    contrastLevel: "medio",
    textDensity: "medio",
    ctaIntensity: "moderado",
    visualBehavior: "cards simples, linhas leves e leitura rapida",
    iconStyle: "icones simples e arredondados",
    compositionHints: "priorizar clareza, alinhamento consistente e CTA visivel"
  },
  [ArtStyle.CORPORATIVO]: {
    value: ArtStyle.CORPORATIVO,
    name: "Corporativo",
    description: "profissional, confiavel e institucional",
    visualStyle: "estrutura executiva com dados e autoridade",
    typographyStyle: "sans corporativa, firme e neutra",
    contrastLevel: "medio-alto",
    textDensity: "medio",
    ctaIntensity: "moderado",
    visualBehavior: "formas retas, organizacao por secoes e tom seguro",
    iconStyle: "icones institucionais e geometricos",
    compositionHints: "valorizar credibilidade, prova visual e mensagem objetiva"
  },
  [ArtStyle.MINIMALISTA]: {
    value: ArtStyle.MINIMALISTA,
    name: "Minimalista",
    description: "simples, elegante e direto",
    visualStyle: "poucos elementos e muito espaco negativo",
    typographyStyle: "sans limpa ou serifada leve",
    contrastLevel: "baixo-medio",
    textDensity: "baixo",
    ctaIntensity: "discreto",
    visualBehavior: "reduzir ruído visual e focar em uma unica ideia",
    iconStyle: "icones lineares pequenos",
    compositionHints: "usar uma imagem ou bloco principal, texto curto e CTA sem exagero"
  },
  [ArtStyle.IMPACTO_COMERCIAL]: {
    value: ArtStyle.IMPACTO_COMERCIAL,
    name: "Impacto Comercial",
    description: "forte, persuasivo e orientado a venda",
    visualStyle: "contraste alto com chamada dominante",
    typographyStyle: "sans bold, condensada ou display comercial",
    contrastLevel: "alto",
    textDensity: "medio-alto",
    ctaIntensity: "forte",
    visualBehavior: "criar urgencia visual com destaque para beneficio e acao",
    iconStyle: "icones chamativos, setas e selos",
    compositionHints: "headline grande, CTA destacado e beneficio em apoio"
  },
  [ArtStyle.PROMOCIONAL]: {
    value: ArtStyle.PROMOCIONAL,
    name: "Promocional",
    description: "impacto imediato",
    visualStyle: "ofertas e urgencia",
    typographyStyle: "forte e chamativa",
    contrastLevel: "alto",
    textDensity: "alto",
    ctaIntensity: "forte",
    visualBehavior: "preco, oferta, prazo e chamada com grande destaque",
    iconStyle: "selos, etiquetas, setas e elementos de varejo",
    compositionHints: "organizar muita informacao sem perder leitura; CTA deve ser o ponto final"
  },
  [ArtStyle.INSTITUCIONAL]: {
    value: ArtStyle.INSTITUCIONAL,
    name: "Institucional",
    description: "serio, confiavel e alinhado a marca",
    visualStyle: "identidade solida e composicao equilibrada",
    typographyStyle: "sans neutra com boa hierarquia",
    contrastLevel: "medio",
    textDensity: "medio",
    ctaIntensity: "moderado",
    visualBehavior: "transmitir reputacao, historia e posicionamento",
    iconStyle: "icones discretos e simbolos de credibilidade",
    compositionHints: "usar marca, cores corporativas e texto objetivo"
  },
  [ArtStyle.EDUCATIVO]: {
    value: ArtStyle.EDUCATIVO,
    name: "Educativo",
    description: "didatico, claro e util",
    visualStyle: "conteudo organizado em passos, dicas ou comparativos",
    typographyStyle: "sans legivel com destaques numerados",
    contrastLevel: "medio",
    textDensity: "medio-alto",
    ctaIntensity: "moderado",
    visualBehavior: "facilitar aprendizado com blocos e icones de apoio",
    iconStyle: "icones explicativos e marcadores visuais",
    compositionHints: "separar informacoes em blocos curtos e manter CTA de continuidade"
  },
  [ArtStyle.MEDICO_PREMIUM]: {
    value: ArtStyle.MEDICO_PREMIUM,
    name: "Medico Premium",
    description: "credibilidade e confianca",
    visualStyle: "saude premium com leveza, higiene e autoridade",
    typographyStyle: "limpa, profissional e acolhedora",
    contrastLevel: "medio",
    textDensity: "baixo-medio",
    ctaIntensity: "agendamento",
    visualBehavior: "evitar exageros; transmitir cuidado, precisao e seguranca",
    iconStyle: "icones medicos lineares, suaves e discretos",
    compositionHints: "usar tons claros, imagem humana ou clinica e CTA de agendamento"
  },
  [ArtStyle.AUTOMOTIVO_PERFORMANCE]: {
    value: ArtStyle.AUTOMOTIVO_PERFORMANCE,
    name: "Automotivo Performance",
    description: "energia, potencia e precisao tecnica",
    visualStyle: "alto contraste, velocidade e acabamento metalico",
    typographyStyle: "bold, angular e esportiva",
    contrastLevel: "alto",
    textDensity: "medio",
    ctaIntensity: "forte",
    visualBehavior: "transmitir performance, confianca mecanica e acao",
    iconStyle: "icones de motor, ferramenta, velocidade e diagnostico",
    compositionHints: "usar diagonais, textura tecnica e CTA direto para orcamento/agendamento"
  },
  [ArtStyle.LOGISTICA_FORTE]: {
    value: ArtStyle.LOGISTICA_FORTE,
    name: "Logistica Forte",
    description: "robustez, seguranca e eficiencia",
    visualStyle: "institucional forte com movimento e escala",
    typographyStyle: "sans bold e objetiva",
    contrastLevel: "alto",
    textDensity: "medio",
    ctaIntensity: "forte",
    visualBehavior: "usar rotas, frota, mapas e sensacao de entrega confiavel",
    iconStyle: "icones de caminhao, rota, caixa e rastreamento",
    compositionHints: "criar composicao solida com CTA claro para cotacao ou contato"
  },
  [ArtStyle.ELEGANCIA_FEMININA]: {
    value: ArtStyle.ELEGANCIA_FEMININA,
    name: "Elegancia Feminina",
    description: "delicado, sofisticado e acolhedor",
    visualStyle: "suave, premium, com detalhes elegantes",
    typographyStyle: "serifada elegante ou sans delicada",
    contrastLevel: "baixo-medio",
    textDensity: "baixo-medio",
    ctaIntensity: "moderado",
    visualBehavior: "valorizar cuidado, autoestima, leveza e proximidade",
    iconStyle: "icones finos, florais, brilho ou formas organicas",
    compositionHints: "usar tons suaves, boa area de respiro e mensagem humana"
  },
  [ArtStyle.ALTO_PADRAO]: {
    value: ArtStyle.ALTO_PADRAO,
    name: "Alto Padrao",
    description: "sofisticado, sobrio e aspiracional",
    visualStyle: "premium com autoridade e acabamento editorial",
    typographyStyle: "serifada ou sans refinada",
    contrastLevel: "medio-alto",
    textDensity: "baixo-medio",
    ctaIntensity: "discreto-moderado",
    visualBehavior: "transmitir exclusividade, confianca e valor percebido",
    iconStyle: "icones minimalistas e simbolos premium",
    compositionHints: "usar poucos elementos, imagem forte e CTA elegante"
  }
};

export function getArtStyleDefinition(style: ArtStyle) {
  return ART_STYLES[style];
}

export function listArtStyleOptions() {
  return Object.values(ART_STYLES);
}

export function inferArtStyle(input: {
  segmentName?: string | null;
  specialtyName?: string | null;
  objective?: string | null;
}) {
  const text = `${input.segmentName ?? ""} ${input.specialtyName ?? ""} ${
    input.objective ?? ""
  }`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/psicologia|estetica|beleza|sobrancelha|lash|micropigmentacao/.test(text)) {
    return ArtStyle.ELEGANCIA_FEMININA;
  }

  if (/odontologia|saude|medic|clinica|dermatologia|cardiologia|pediatria|nutricao/.test(text)) {
    return ArtStyle.MEDICO_PREMIUM;
  }

  if (/transport|logistica|carga|distribuicao|frota/.test(text)) {
    return ArtStyle.LOGISTICA_FORTE;
  }

  if (/oficina|automotivo|auto|bmw|mini|nissan|mercedes|audi|volkswagen/.test(text)) {
    return ArtStyle.AUTOMOTIVO_PERFORMANCE;
  }

  if (/advocacia|juridico|direito|imobiliario|alto padrao|arquitetura/.test(text)) {
    return ArtStyle.ALTO_PADRAO;
  }

  if (/promocao|oferta|desconto|combo|varejo|preco/.test(text)) {
    return ArtStyle.PROMOCIONAL;
  }

  if (/educa|dica|guia|explicar|passo/.test(text)) {
    return ArtStyle.EDUCATIVO;
  }

  return ArtStyle.CLEAN_MODERNO;
}
