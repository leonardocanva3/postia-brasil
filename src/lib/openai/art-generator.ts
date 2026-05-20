import type { ArtFormat } from "@prisma/client";
import { buildArtBriefDraft, getArtFormatDefinition } from "@/lib/art";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";
import { openai } from "@/lib/openai/openai-client";

export type GenerateArtFromDraftInput = Readonly<{
  subject: string;
  objective: string;
  platform: string;
  format: ArtFormat;
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
}>;

function getOpenAIImageSize(format: ArtFormat) {
  if (format === "FEED_QUADRADO") {
    return "1024x1024" as const;
  }

  return "1024x1536" as const;
}

export function buildGeneratedArtPrompt(input: GenerateArtFromDraftInput) {
  const brief = buildArtBriefDraft(input);
  const format = getArtFormatDefinition(input.format);
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
    selectedImage,
    "Use descricao, servicos, diferenciais, publico-alvo, CTA padrao, tom de voz e banco de imagens como orientacao de composicao.",
    "A arte deve ter hierarquia visual clara, texto curto, contraste alto, CTA legivel e acabamento premium.",
    "Nao adicione textos pequenos demais, marcas d'agua, placeholders ou elementos que parecam mockup inacabado."
  ].join("\n");
}

export async function generateArtPngFromDraft(input: GenerateArtFromDraftInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configure OPENAI_API_KEY para gerar artes.");
  }

  const prompt = buildGeneratedArtPrompt(input);
  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
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
