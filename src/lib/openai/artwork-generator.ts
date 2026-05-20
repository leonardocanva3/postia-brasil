import type { ArtFormat } from "@prisma/client";
import { openai } from "@/lib/openai/openai-client";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";
import { getArtFormatDefinition } from "@/lib/art";

export type GenerateArtworkInput = Readonly<{
  subject: string;
  objective: string;
  platform: string;
  format: ArtFormat;
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

export function buildArtworkPrompt(input: GenerateArtworkInput) {
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
    : "Nenhuma imagem especifica selecionada. Use o banco de imagens e o perfil como referencia conceitual.";

  return [
    "Crie uma arte profissional para redes sociais em PNG, com aparencia comercial moderna e legivel.",
    `Assunto: ${input.subject}`,
    `Objetivo: ${input.objective}`,
    `Plataforma: ${input.platform}`,
    `Formato: ${format.label}`,
    `Dimensoes finais esperadas: ${format.width}px x ${format.height}px`,
    `Proporcao: ${format.aspectRatio}`,
    `Area segura de texto: x=${format.layout.textSafeArea.x}, y=${format.layout.textSafeArea.y}, largura=${format.layout.textSafeArea.width}, altura=${format.layout.textSafeArea.height}`,
    `Area de CTA: x=${format.layout.ctaArea.x}, y=${format.layout.ctaArea.y}, largura=${format.layout.ctaArea.width}, altura=${format.layout.ctaArea.height}`,
    `Posicao recomendada da logo: x=${format.layout.logoPosition.x}, y=${format.layout.logoPosition.y}`,
    `Area da imagem principal: x=${format.layout.mainImageArea.x}, y=${format.layout.mainImageArea.y}, largura=${format.layout.mainImageArea.width}, altura=${format.layout.mainImageArea.height}`,
    `Contexto da empresa:\n${formatCompanyProfileContext(input.companyProfile)}`,
    selectedImage,
    "Use automaticamente logo, cores da marca, descricao, servicos, diferenciais, CTA e banco de imagens quando estiverem disponiveis no contexto.",
    "Evite textos longos. Priorize hierarquia visual, contraste, CTA claro e composicao pronta para demonstracao comercial."
  ].join("\n");
}

export async function generateArtworkWithOpenAI(input: GenerateArtworkInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configure OPENAI_API_KEY para gerar artes.");
  }

  const prompt = buildArtworkPrompt(input);
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
    imageUrl: image.b64_json ? `data:image/png;base64,${image.b64_json}` : image.url ?? "",
    thumbnailUrl: image.b64_json
      ? `data:image/png;base64,${image.b64_json}`
      : image.url ?? ""
  };
}
