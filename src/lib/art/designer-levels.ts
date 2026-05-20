import { DesignerLevel } from "@prisma/client";

export type DesignerLevelDefinition = Readonly<{
  value: DesignerLevel;
  name: string;
  visualComplexity: string;
  elementQuantity: string;
  compositionRefinement: string;
  typographyIntensity: string;
  visualDepth: string;
  artDirectionSophistication: string;
  compositionSophistication: string;
  cinematicLevel: string;
}>;

export const DESIGNER_LEVELS: Record<DesignerLevel, DesignerLevelDefinition> = {
  [DesignerLevel.JUNIOR]: {
    value: DesignerLevel.JUNIOR,
    name: "Junior",
    visualComplexity: "baixa, com composicao simples e direta",
    elementQuantity: "poucos elementos, priorizando legibilidade",
    compositionRefinement: "basico, com alinhamento claro e hierarquia objetiva",
    typographyIntensity: "moderada e funcional",
    visualDepth: "baixa, com fundo simples e poucos planos",
    artDirectionSophistication: "pratica, sem efeitos complexos",
    compositionSophistication: "estrutura simples com titulo, imagem e CTA",
    cinematicLevel: "baixo"
  },
  [DesignerLevel.PLENO]: {
    value: DesignerLevel.PLENO,
    name: "Pleno",
    visualComplexity: "media, com composicao comercial bem organizada",
    elementQuantity: "quantidade equilibrada de elementos",
    compositionRefinement: "intermediario, com bom uso de contraste e espaco",
    typographyIntensity: "bem hierarquizada, com destaques controlados",
    visualDepth: "media, com sobreposicoes leves e fundos trabalhados",
    artDirectionSophistication: "comercial profissional e consistente",
    compositionSophistication: "grid claro, camadas leves e CTA bem posicionado",
    cinematicLevel: "medio"
  },
  [DesignerLevel.SENIOR]: {
    value: DesignerLevel.SENIOR,
    name: "Senior",
    visualComplexity: "alta, com direcao visual madura e intencional",
    elementQuantity: "elementos suficientes para riqueza visual sem poluicao",
    compositionRefinement: "alto, com proporcao, respiro e ritmo visual",
    typographyIntensity: "forte quando necessario, refinada e com contraste preciso",
    visualDepth: "alta, com planos, luz, sombra e textura com controle",
    artDirectionSophistication: "sofisticada, coerente com marca, nicho e objetivo",
    compositionSophistication: "composicao editorial/comercial com hierarquia premium",
    cinematicLevel: "alto"
  },
  [DesignerLevel.PREMIUM]: {
    value: DesignerLevel.PREMIUM,
    name: "Premium",
    visualComplexity: "muito alta, com acabamento de campanha profissional",
    elementQuantity: "curadoria rigorosa de elementos premium",
    compositionRefinement: "muito alto, com direcao de arte refinada e memoravel",
    typographyIntensity: "premium, precisa, com escolha tipografica sofisticada",
    visualDepth: "muito alta, com luz cinematica, profundidade e acabamento de luxo",
    artDirectionSophistication: "nivel campanha premium, com alto valor percebido",
    compositionSophistication: "composicao autoral, elegante, equilibrada e impactante",
    cinematicLevel: "muito alto"
  }
};

export function getDesignerLevelDefinition(level: DesignerLevel) {
  return DESIGNER_LEVELS[level];
}

export function listDesignerLevelOptions() {
  return Object.values(DESIGNER_LEVELS);
}

export function inferDesignerLevel(input: {
  segmentName?: string | null;
  specialtyName?: string | null;
}) {
  const text = `${input.segmentName ?? ""} ${input.specialtyName ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/odontologia|advocacia|juridico|direito|alto padrao|imobiliario|arquitetura/.test(text)) {
    return DesignerLevel.PREMIUM;
  }

  if (/psicologia|transport|logistica|oficina|automotivo|saude|medic/.test(text)) {
    return DesignerLevel.SENIOR;
  }

  if (/comercio|loja|varejo|mercado|farmacia|alimentacao|restaurante/.test(text)) {
    return DesignerLevel.PLENO;
  }

  return DesignerLevel.SENIOR;
}
