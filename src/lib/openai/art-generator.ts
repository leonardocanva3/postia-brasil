import type { ArtFormat, ArtStyle, DesignerLevel } from "@prisma/client";
import {
  buildArtBriefDraft,
  getArtFormatDefinition,
  getArtStyleDefinition,
  getDesignerLevelDefinition
} from "@/lib/art";
import type { RealArtTemplate } from "@/lib/art/templates";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";
import { openai } from "@/lib/openai/openai-client";
import { assertOpenAIKeyConfigured, getActiveAISettings } from "@/lib/openai/settings";

export type GenerateArtFromDraftInput = Readonly<{
  subject: string;
  objective: string;
  platform: string;
  format: ArtFormat;
  style?: ArtStyle | null;
  designerLevel?: DesignerLevel | null;
  companyImageId?: string | null;
  useLogo: boolean;
  useBrandColors: boolean;
  companyProfile?: CompanyProfileContext | null;
  selectedImage?: {
    title: string;
    type: string;
    description?: string | null;
    tags: string[];
    imageUrl: string;
  } | null;
  selectedTemplate?: {
    name: string;
    description: string;
    visualStyle: string;
    layoutHints: string;
  } | null;
  selectedRealTemplate?: RealArtTemplate | null;
}>;

function getOpenAIImageSize(format: ArtFormat) {
  if (format === "FEED_QUADRADO") {
    return "1024x1024" as const;
  }

  return "1024x1536" as const;
}

export function buildGeneratedArtPrompt(input: GenerateArtFromDraftInput) {
  const brief = buildArtBriefDraft({
    ...input,
    selectedTemplate: input.selectedRealTemplate
  });
  const format = getArtFormatDefinition(input.format);
  const style = input.style ? getArtStyleDefinition(input.style) : null;
  const designerLevel = input.designerLevel
    ? getDesignerLevelDefinition(input.designerLevel)
    : null;
  const selectedImage = input.selectedImage
    ? [
        `Imagem especifica selecionada: ${input.selectedImage.title}`,
        `Tipo da imagem: ${input.selectedImage.type}`,
        input.selectedImage.description
          ? `Descricao da imagem: ${input.selectedImage.description}`
          : null,
        input.selectedImage.tags.length
          ? `Tags da imagem: ${input.selectedImage.tags.join(", ")}`
          : null,
        `URL de referencia da imagem: ${input.selectedImage.imageUrl}`
      ]
        .filter(Boolean)
        .join("\n")
    : "Nenhuma imagem especifica foi selecionada para esta arte.";
  const selectedTemplate = input.selectedTemplate
    ? [
        `Template visual selecionado: ${input.selectedTemplate.name}`,
        `Descricao do template: ${input.selectedTemplate.description}`,
        `Estilo visual do template: ${input.selectedTemplate.visualStyle}`,
        `Orientacoes de layout do template: ${input.selectedTemplate.layoutHints}`
      ].join("\n")
    : "Nenhum template visual selecionado. Escolha uma composicao coerente com segmento, especialidade, objetivo e formato.";
  const selectedRealTemplate = input.selectedRealTemplate
    ? [
        `Template tecnico real: ${input.selectedRealTemplate.name}`,
        `Estrutura visual: ${brief.layoutStructure}`,
        `Logo: ${brief.logoPlacement}`,
        `Imagem principal: ${brief.imagePlacement}`,
        `Titulo: ${brief.titlePlacement}`,
        `Subtitulo: ${brief.subtitlePlacement}`,
        `CTA: ${brief.ctaPlacement}`,
        `Nivel de texto: ${input.selectedRealTemplate.textLevel}`,
        `Elementos graficos: ${brief.graphicElements.join(", ")}`,
        `Regras de composicao: ${brief.compositionRules}`
      ].join("\n")
    : "Template tecnico real automatico ausente. Use o template conceitual e o contexto do nicho.";
  const selectedStyle = style
    ? [
        `Estilo visual escolhido: ${style.name}`,
        `Descricao do estilo: ${style.description}`,
        `Direcao visual: ${brief.visualDirection}`,
        `Tipografia: ${brief.typographyStyle}`,
        `Densidade de texto: ${brief.textDensity}`,
        `CTA recomendado: ${brief.CTAIntensity}`,
        `Icones/elementos graficos: ${brief.iconStyle}`,
        `Composicao: ${brief.compositionHints}`,
        `Nivel de contraste: ${style.contrastLevel}`,
        `Comportamento visual: ${style.visualBehavior}`
      ].join("\n")
    : "Estilo visual automatico: adapte composicao, tipografia, hierarquia, densidade, CTA, cores, icones e elementos graficos ao nicho.";
  const designerLevelContext = designerLevel
    ? [
        `Nivel de designer: ${designerLevel.name}`,
        `Complexidade visual: ${brief.visualComplexity}`,
        `Quantidade de elementos: ${designerLevel.elementQuantity}`,
        `Refinamento da composicao: ${designerLevel.compositionRefinement}`,
        `Intensidade tipografica: ${designerLevel.typographyIntensity}`,
        `Profundidade visual: ${designerLevel.visualDepth}`,
        `Sofisticacao da direcao de arte: ${designerLevel.artDirectionSophistication}`,
        `Sofisticacao da composicao: ${brief.compositionSophistication}`,
        `Nivel cinematico: ${brief.cinematicLevel}`
      ].join("\n")
    : "Nivel de designer automatico: aplique sofisticacao adequada ao nicho e objetivo.";
  const logoInstruction =
    input.useLogo && input.companyProfile?.logoUrl
      ? `Use o logotipo da empresa como referencia visual: ${input.companyProfile.logoUrl}`
      : "Nao crie logotipo ficticio. Reserve espaco visual limpo para a marca quando fizer sentido.";
  const colorInstruction =
    input.useBrandColors && input.companyProfile?.brandColors?.length
      ? `Use as cores da marca: ${input.companyProfile.brandColors.join(", ")}`
      : "Use uma paleta profissional coerente com o segmento e com boa leitura.";

  return [
    "Gere uma arte profissional em PNG para redes sociais, pronta para demonstracao comercial.",
    `Assunto: ${brief.subject}`,
    `Objetivo: ${brief.objective}`,
    `Plataforma: ${brief.platform}`,
    `Formato escolhido: ${format.label}`,
    `Dimensoes finais esperadas: ${brief.width}px x ${brief.height}px`,
    `Proporcao: ${brief.aspectRatio}`,
    `Area segura de texto: x=${format.layout.textSafeArea.x}, y=${format.layout.textSafeArea.y}, largura=${format.layout.textSafeArea.width}, altura=${format.layout.textSafeArea.height}`,
    `Area da imagem principal: x=${format.layout.mainImageArea.x}, y=${format.layout.mainImageArea.y}, largura=${format.layout.mainImageArea.width}, altura=${format.layout.mainImageArea.height}`,
    `Area de CTA: x=${format.layout.ctaArea.x}, y=${format.layout.ctaArea.y}, largura=${format.layout.ctaArea.width}, altura=${format.layout.ctaArea.height}`,
    `Posicao recomendada da logo: x=${format.layout.logoPosition.x}, y=${format.layout.logoPosition.y}`,
    logoInstruction,
    colorInstruction,
    `Contexto completo da empresa:\n${formatCompanyProfileContext(input.companyProfile)}`,
    selectedTemplate,
    selectedRealTemplate,
    selectedStyle,
    designerLevelContext,
    selectedImage,
    "Use descricao, servicos, diferenciais, publico-alvo, CTA padrao, tom de voz, segmento, especialidade, estilo visual do nicho, cores sugeridas, icones sugeridos, compliance e banco de imagens como orientacao de composicao.",
    "A arte deve ter hierarquia visual clara, texto curto, contraste alto, CTA legivel e acabamento premium.",
    "Nao adicione textos pequenos demais, marcas d'agua, placeholders ou elementos que parecam mockup inacabado."
  ].join("\n");
}

export async function generateArtPngFromDraft(input: GenerateArtFromDraftInput) {
  assertOpenAIKeyConfigured();
  const settings = await getActiveAISettings();
  const prompt = buildGeneratedArtPrompt(input);
  const response = await openai.images.generate({
    model: settings.imageModel,
    prompt,
    n: 1,
    output_format: "png",
    quality: "high",
    size: getOpenAIImageSize(input.format)
  });
  const image = response.data?.[0];

  if (!image?.b64_json && !image?.url) {
    throw new Error("A OpenAI nao retornou a imagem.");
  }

  return {
    prompt,
    imageUrl: image.b64_json
      ? `data:image/png;base64,${image.b64_json}`
      : image.url ?? ""
  };
}
